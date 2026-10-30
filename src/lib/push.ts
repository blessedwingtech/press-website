import webpush from 'web-push';
import { db } from '@/lib/db';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BJdKJkngqy5Fx3NaXjv8HkCWfLyf92F9CMre7uETRbYh46g79nkZeEHIPhH3JUjnA_PNXw6PI_PAmOHox0x37Ks';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || 'KKjE-cN41GgoYJcy8OAZDjAskmRuHJMrUBBKnhYk94c';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:press@bittonik.com';

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  icon?: string;
  badge?: string;
}

/**
 * Diffuse une notification Push Web aux abonnés d'un auteur ou de toute la rédaction.
 */
export async function sendWebPushNotification(authorId: string | null, payload: PushPayload) {
  try {
    const subscriptions = await db.pushSubscription.findMany({
      where: authorId ? { authorId } : undefined,
    });

    if (!subscriptions || subscriptions.length === 0) {
      return { count: 0 };
    }

    const payloadString = JSON.stringify(payload);
    let successCount = 0;

    for (const sub of subscriptions) {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushConfig, payloadString);
        successCount++;
      } catch (err: any) {
        // Si l'abonnement a expiré ou a été refusé par l'appareil (404 ou 410 Gone)
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`[Push] Abonnement expiré supprimé : ${sub.id}`);
          await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.warn(`[Push] Erreur d'envoi à l'endpoint : ${err.message || err}`);
        }
      }
    }

    return { count: successCount, total: subscriptions.length };
  } catch (error) {
    console.error('[Push Service] Erreur lors de la diffusion push :', error);
    return { count: 0, error };
  }
}
