'use server';

import { db } from '@/lib/db';

export interface SavePushSubscriptionParams {
  endpoint: string;
  p256dh: string;
  auth: string;
  authorId?: string | null;
}

export async function savePushSubscriptionAction(params: SavePushSubscriptionParams) {
  try {
    if (!params.endpoint || !params.p256dh || !params.auth) {
      return { success: false, error: 'Données de souscription invalides.' };
    }

    const authorId = params.authorId && params.authorId.trim().length > 0 ? params.authorId.trim() : null;

    // Enregistrer ou mettre à jour la souscription
    await db.pushSubscription.upsert({
      where: { endpoint: params.endpoint },
      update: {
        p256dh: params.p256dh,
        auth: params.auth,
        authorId,
      },
      create: {
        endpoint: params.endpoint,
        p256dh: params.p256dh,
        auth: params.auth,
        authorId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('[Push Action] Erreur enregistrement push subscription :', error);
    return { success: false, error: 'Impossible d\'enregistrer l\'abonnement push.' };
  }
}

export async function unsubscribePushAction(endpoint: string) {
  try {
    if (!endpoint) return { success: false };
    await db.pushSubscription.deleteMany({ where: { endpoint } });
    return { success: true };
  } catch (error) {
    console.error('[Push Action] Erreur désabonnement push :', error);
    return { success: false };
  }
}
