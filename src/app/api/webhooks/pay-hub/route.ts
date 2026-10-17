import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPayHubSignature } from '@/lib/pay-hub';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-payhub-signature') || req.headers.get('x-hub-signature');

    // 1. Validation de la signature cryptographique (si configurée en prod)
    if (process.env.NODE_ENV === 'production' || process.env.PAY_HUB_WEBHOOK_SECRET) {
      if (!signature || !verifyPayHubSignature(rawBody, signature)) {
        console.error('[Pay-Hub Webhook] Signature invalide ou manquante.');
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.eventType || payload.event;
    const data = payload.data || {};

    if (!event) {
      return NextResponse.json({ error: 'Payload webhook incomplet (événement manquant)' }, { status: 400 });
    }

    const transactionId = data.transactionId || data.transaction_id || data.id || payload.eventId || `TX_${Date.now()}`;
    const idempotencyKey = `PAYHUB_TX_${transactionId}`;

    // 2. Vérification d'idempotence (éviter le double traitement d'un même événement)
    const alreadyProcessed = await db.auditLog.findFirst({
      where: {
        action: idempotencyKey,
      },
    });

    if (alreadyProcessed) {
      console.log(`[Pay-Hub Webhook] Événement déjà traité (${transactionId}), retour 200 idempotent.`);
      return NextResponse.json({ received: true, status: 'already_processed' }, { status: 200 });
    }

    const metadata = data.metadata || payload.metadata || {};
    const userId = data.satelliteUserId || data.userId || data.user_id || metadata.userId || metadata.user_id;

    console.log(`[Pay-Hub Webhook] Traitement de l'événement : ${event}`, { transactionId, userId, amount: data.amount });

    // 3. Traitement métier selon l'événement
    switch (event) {
      case 'payment.completed':
      case 'subscription.created': {
        const itemType = data.type || metadata.type || 'DONATION';

        // A. Activation d'un abonnement lecteur VIP ou Journaliste PRO
        if (itemType === 'SUBSCRIPTION' && userId) {
          const targetRole = metadata.target_role || 'reader_vip';
          await db.user.update({
            where: { id: userId },
            data: { role: targetRole },
          }).catch((err) => {
            console.error(`[Pay-Hub] Utilisateur ${userId} introuvable pour upgrade VIP :`, err);
          });
        }

        // A2. Activation d'un abonnement Journaliste PRO (95% net, sourcing IA, badge certifié)
        if ((itemType === 'JOURNALIST_PRO' || itemType === 'PRO_SUBSCRIPTION') && userId) {
          const durationDays = metadata.days || 30;
          const proExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
          await db.user.update({
            where: { id: userId },
            data: {
              isPro: true,
              proExpiresAt,
            },
          }).catch((err) => {
            console.error(`[Pay-Hub] Utilisateur ${userId} introuvable pour activation Journaliste PRO :`, err);
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
          }).catch((err) => {
            console.error(`[Pay-Hub] Annonce ${metadata.ad_id} introuvable :`, err);
          });
        }

        // C. Don ou soutien financier avec partage (95% Journaliste PRO / 85% Journaliste Standard)
        if (itemType === 'DONATION') {
          const amount = Number(data.amount) || 0;
          const currency = (data.currency || 'USD').toUpperCase();
          const authorId = metadata.authorId;
          const articleId = metadata.articleId;

          // Vérifier si l'auteur bénéficie du statut Journaliste PRO
          let isProAuthor = false;
          if (authorId) {
            const author = await db.user.findUnique({
              where: { id: authorId },
              select: { isPro: true },
            }).catch(() => null);
            isProAuthor = Boolean(author?.isPro);
          }

          // Règle financière convenue : 95% net pour Journaliste PRO (5% frais) / 85% net standard (15% frais)
          const feePercentage = isProAuthor ? 0.05 : 0.15;
          const platformFee = Math.round(amount * feePercentage * 100) / 100;
          const netAmount = Math.round((amount - platformFee) * 100) / 100;

          if (authorId) {
            // Créer l'enregistrement de don
            await db.donation.create({
              data: {
                transactionId,
                amount,
                currency,
                netAmount,
                platformFee,
                authorId,
                articleId: articleId || null,
                donorName: data.fullName || metadata.donorName || null,
                donorEmail: data.email || metadata.donorEmail || null,
              },
            }).catch((err) => console.error('[Pay-Hub] Erreur création don :', err));

            // Créditer le solde du journaliste
            if (currency === 'HTG') {
              await db.user.update({
                where: { id: authorId },
                data: {
                  balanceHTG: { increment: netAmount },
                },
              }).catch(() => {});
            } else {
              await db.user.update({
                where: { id: authorId },
                data: {
                  balanceUSD: { increment: netAmount },
                },
              }).catch(() => {});
            }

            console.log(`[Pay-Hub] Don de ${amount} ${currency} crédité à l'auteur ${authorId} (Net: ${netAmount}, Commission PressTonik: ${platformFee})`);
          } else {
            console.log(`[Pay-Hub] Don général reçu de ${amount} ${currency} pour la rédaction.`);
          }
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
          }).catch(() => {});
        }
        break;
      }

      case 'payout.succeeded': {
        console.log(`[Pay-Hub] Reversement réussi pour le journaliste/bénéficiaire ${data.recipientId || data.sellerId} : ${data.amount} ${data.currency}`);
        break;
      }

      default:
        console.log(`[Pay-Hub] Événement ignoré ou non spécifique : ${event}`);
    }

    // 4. Enregistrement de l'idempotence et de l'audit
    await db.auditLog.create({
      data: {
        action: idempotencyKey,
        details: JSON.stringify({
          event,
          amount: data.amount,
          currency: data.currency,
          provider: data.provider,
          userId,
          metadata,
          processedAt: new Date().toISOString(),
        }),
        userId: userId || null,
      },
    }).catch((err) => {
      console.warn('[Pay-Hub Webhook] Impossible d\'écrire l\'audit log :', err);
    });

    return NextResponse.json({ received: true, status: 'processed' }, { status: 200 });
  } catch (error: any) {
    console.error('[Pay-Hub Webhook] Erreur interne lors du traitement:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur webhook' }, { status: 500 });
  }
}
