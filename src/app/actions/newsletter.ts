'use server';

import { db } from '@/lib/db';
import {
  sendNewsletterWelcomeEmail,
  sendNewsletterArticleAlertEmail,
  sendNewSubscriberAlertToJournalist,
} from '@/lib/email';
import { sendWebPushNotification } from '@/lib/push';

export interface SubscribeParams {
  email: string;
  authorId?: string | null;
  frequency?: 'INSTANT' | 'WEEKLY';
}

export async function subscribeToNewsletterAction(params: SubscribeParams) {
  try {
    const rawEmail = params.email?.trim().toLowerCase();
    if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return { success: false, error: 'Veuillez saisir une adresse email valide.' };
    }

    const frequency = params.frequency === 'INSTANT' ? 'INSTANT' : 'WEEKLY';
    const authorId = params.authorId && params.authorId.trim().length > 0 ? params.authorId.trim() : null;

    let author = null;
    if (authorId) {
      author = await db.user.findUnique({
        where: { id: authorId },
        select: { id: true, name: true, email: true, profilePhoto: true, bio: true },
      });
      if (!author) {
        return { success: false, error: 'Auteur introuvable.' };
      }
    }

    // Recherche de l'inscription existante (compatible SQLite pour authorId null)
    let subscription = await db.newsletterSubscription.findFirst({
      where: {
        email: rawEmail,
        authorId: authorId,
      },
    });

    if (subscription) {
      subscription = await db.newsletterSubscription.update({
        where: { id: subscription.id },
        data: {
          active: true,
          frequency,
        },
      });
    } else {
      subscription = await db.newsletterSubscription.create({
        data: {
          email: rawEmail,
          authorId,
          frequency,
          active: true,
        },
      });
    }

    // Envoi de l'email de confirmation avec lien de désinscription en 1 clic
    const baseUrl = process.env.NEXTAUTH_URL || 'https://press.bittonik.com';
    const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe/${subscription.token}`;

    sendNewsletterWelcomeEmail({
      to: rawEmail,
      authorName: author ? author.name : 'PressTonik',
      authorEmail: author?.email || undefined,
      authorBio: author?.bio || undefined,
      authorPhoto: author?.profilePhoto || undefined,
      frequency,
      unsubscribeUrl,
    }).catch((err) => {
      console.error('[Newsletter] Erreur lors de l\'envoi de l\'email de bienvenue :', err);
    });

    // Notifier le journaliste s'il s'agit d'un abonnement direct à sa plume
    if (author && author.email) {
      db.newsletterSubscription
        .count({
          where: { authorId: author.id, active: true },
        })
        .then((totalCount) => {
          return sendNewSubscriberAlertToJournalist({
            journalistEmail: author.email,
            journalistName: author.name,
            subscriberEmail: rawEmail,
            frequency,
            totalSubscribersCount: totalCount,
          });
        })
        .catch((err) => {
          console.error('[Newsletter] Erreur notification journaliste :', err);
        });
    }

    const targetName = author ? `de ${author.name}` : 'PressTonik';
    return {
      success: true,
      message: `Votre inscription à la newsletter ${targetName} a bien été enregistrée ! Un email de confirmation vient de vous être envoyé.`,
    };
  } catch (error: any) {
    console.error('[Newsletter] Erreur d\'abonnement :', error);
    return {
      success: false,
      error: 'Une erreur est survenue lors de votre inscription. Veuillez réessayer dans un instant.',
    };
  }
}

export async function unsubscribeNewsletterAction(token: string) {
  try {
    if (!token || typeof token !== 'string') {
      return { success: false, error: 'Jeton de désinscription manquant ou invalide.' };
    }

    const subscription = await db.newsletterSubscription.findUnique({
      where: { token },
      include: {
        author: {
          select: { name: true },
        },
      },
    });

    if (!subscription) {
      return { success: false, error: 'Ce lien de désinscription est introuvable ou a expiré.' };
    }

    await db.newsletterSubscription.update({
      where: { id: subscription.id },
      data: { active: false },
    });

    const authorName = subscription.author?.name || 'PressTonik';
    return {
      success: true,
      authorName,
      message: `Vous avez été désabonné(e) avec succès des publications de ${authorName}.`,
    };
  } catch (error: any) {
    console.error('[Newsletter] Erreur de désabonnement :', error);
    return {
      success: false,
      error: 'Une erreur est survenue lors du désabonnement.',
    };
  }
}

export interface ArticleAlertDispatchParams {
  authorId: string;
  authorName: string;
  authorEmail?: string;
  articleTitle: string;
  articleSlug: string;
  articleContent: string;
  articleImage?: string;
}

/**
 * Envoie de façon asynchrone les alertes par email aux abonnés ayant choisi la fréquence INSTANT.
 */
export async function dispatchArticlePublicationAlerts(params: ArticleAlertDispatchParams) {
  try {
    const subscribers = await db.newsletterSubscription.findMany({
      where: {
        authorId: params.authorId,
        active: true,
        frequency: 'INSTANT',
      },
    });

    if (!subscribers || subscribers.length === 0) {
      return;
    }

    console.log(`📬 [Newsletter Alert] Notification de ${subscribers.length} abonnés instantanés pour l'article "${params.articleTitle}"...`);

    const baseUrl = process.env.NEXTAUTH_URL || 'https://press.bittonik.com';
    const cleanPreview = params.articleContent
      .replace(/<[^>]*>?/gm, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 240) + '...';

    for (const sub of subscribers) {
      try {
        const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe/${sub.token}`;
        await sendNewsletterArticleAlertEmail({
          to: sub.email,
          authorName: params.authorName,
          authorEmail: params.authorEmail,
          articleTitle: params.articleTitle,
          articleSlug: params.articleSlug,
          articlePreview: cleanPreview,
          articleImage: params.articleImage?.startsWith('http')
            ? params.articleImage
            : (params.articleImage ? `${baseUrl}${params.articleImage}` : undefined),
          unsubscribeUrl,
        });
      } catch (subErr) {
        console.error(`[Newsletter Alert] Échec d'envoi à ${sub.email} :`, subErr);
      }
    }

    // Diffusion de la notification Push Web
    const articleFullUrl = `${baseUrl}/articles/${params.articleSlug}`;
    sendWebPushNotification(params.authorId, {
      title: `${params.authorName} vient de publier`,
      body: params.articleTitle,
      url: articleFullUrl,
    }).catch((pushErr) => {
      console.error('[Newsletter] Erreur diffusion Push Web :', pushErr);
    });
  } catch (dispatchErr) {
    console.error('[Newsletter Alert] Erreur générale lors de la diffusion des alertes :', dispatchErr);
  }
}
