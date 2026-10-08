import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPayHubSignature } from '@/lib/pay-hub';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-payhub-signature');

    // 1. Validation de la signature cryptographique (si configurée en prod)
    if (process.env.NODE_ENV === 'production' || process.env.PAY_HUB_WEBHOOK_SECRET) {
      if (!signature || !verifyPayHubSignature(rawBody, signature)) {
        console.error('[Pay-Hub Webhook] Signature invalide ou manquante.');
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    if (!event || !data) {
      return NextResponse.json({ error: 'Payload webhook incomplet' }, { status: 400 });
    }

    const transactionId = data.transaction_id || data.id || `TX_${Date.now()}`;
    const idempotencyKey = `PAYHUB_TX_${transactionId}`;

    // 2. Vérification d'idempotence (éviter le double traitement)
    const alreadyProcessed = await db.auditLog.findFirst({
      where: {
        action: idempotencyKey,
      },
    });

    if (alreadyProcessed) {
      console.log(`[Pay-Hub Webhook] Événement déjà traité (${transactionId}), retour 200 idempotent.`);
      return NextResponse.json({ received: true, status: 'already_processed' }, { status: 200 });
    }

    const metadata = data.metadata || {};
    const userId = data.user_id || metadata.user_id;

    console.log(`[Pay-Hub Webhook] Traitement de l'événement : ${event}`, { transactionId, userId });

    // 3. Traitement métier selon l'événement
    switch (event) {
      case 'payment.completed':
      case 'subscription.created': {
        const itemType = metadata.type || 'DONATION';

        // A. Activation d'un abonnement lecteur ou journaliste
        if (itemType === 'SUBSCRIPTION' && userId) {
          const targetRole = metadata.target_role || 'reader_vip';
          await db.user.update({
            where: { id: userId },
            data: { role: targetRole },
          });
        }

        // B. Activation d'une campagne publicitaire annonceur
        if (itemType === 'ONE_TIME_AD' && metadata.ad_id) {
          await db.ad.update({
            where: { id: metadata.ad_id },
            data: {
              active: true,
              ownerId: userId || undefined,
            },
          });
        }

        // C. Don ou soutien financier
        if (itemType === 'DONATION') {
          console.log(`[Pay-Hub] Don reçu de ${data.amount} ${data.currency} par l'utilisateur ${userId || 'Anonyme'}`);
        }
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        // Rétrogradation de l'accès au rôle standard
        if (userId) {
          await db.user.update({
            where: { id: userId },
            data: { role: 'reader' },
          });
        }
        break;
      }

      case 'payout.succeeded': {
        console.log(`[Pay-Hub] Reversement réussi pour le journaliste/bénéficiaire ${data.recipient_id} : ${data.amount} ${data.currency}`);
        break;
      }

      default:
        console.log(`[Pay-Hub] Événement ignoré ou non géré : ${event}`);
    }

    // 4. Enregistrement de l'idempotence et de l'audit
    await db.auditLog.create({
      data: {
        action: idempotencyKey,
        details: JSON.stringify({
          event,
          amount: data.amount,
          currency: data.currency,
          userId,
          metadata,
          processedAt: new Date().toISOString(),
        }),
        userId: userId || null,
      },
    });

    return NextResponse.json({ received: true, status: 'processed' }, { status: 200 });
  } catch (error: any) {
    console.error('[Pay-Hub Webhook] Erreur interne lors du traitement:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur webhook' }, { status: 500 });
  }
}
