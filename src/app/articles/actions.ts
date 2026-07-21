'use server';

import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Helper pour récupérer ou initialiser un ID de session anonyme unique
function getOrCreateSessionId(): string {
  const cookieStore = cookies();
  let ratingSessionId = cookieStore.get('presstonik-session-id')?.value;
  if (!ratingSessionId) {
    ratingSessionId = crypto.randomUUID();
    cookieStore.set('presstonik-session-id', ratingSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365, // 1 an
      path: '/',
    });
  }
  return ratingSessionId;
}

// Action : Ajouter/Modifier une évaluation (Étoiles)
export async function rateArticle(articleId: string, stars: number) {
  try {
    if (stars < 0 || stars > 5) {
      throw new Error('La note doit être comprise entre 0 et 5.');
    }

    const sessionIdentifier = getOrCreateSessionId();

    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { titre: true, auteurId: true },
    });

    if (!article) throw new Error('Article introuvable.');

    // Upsert la note pour cette session et cet article (évite les doublons)
    const rating = await db.rating.upsert({
      where: {
        articleId_sessionIdentifier: {
          articleId,
          sessionIdentifier,
        },
      },
      update: {
        stars,
      },
      create: {
        articleId,
        stars,
        sessionIdentifier,
      },
    });

    await logAction('RATING_ADD', `Évaluation de ${stars} étoiles sur l'article : "${article.titre}"`);

    // Revalider les chemins pour rafraîchir l'affichage
    revalidatePath(`/articles/${articleId}`);
    revalidatePath('/');
    
    return { success: true, rating };
  } catch (error: any) {
    console.error('Rating Error:', error);
    return { success: false, error: error.message };
  }
}

// Action : Incrémenter le compteur de vues d'un article de façon unique
export async function incrementArticleViews(articleId: string) {
  try {
    const cookieStore = cookies();
    const sessionIdentifier = getOrCreateSessionId();
    
    const viewedCookieName = `viewed-${articleId}`;
    const alreadyViewed = cookieStore.get(viewedCookieName)?.value;

    if (alreadyViewed) {
      return { success: true, count: null }; // Déjà comptabilisé pour cette session
    }

    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { titre: true, views: true },
    });

    if (!article) return { success: false, error: 'Article introuvable' };

    const updated = await db.article.update({
      where: { id: articleId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    // Marquer l'article comme vu dans les cookies de session pour 2 heures
    cookieStore.set(viewedCookieName, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2, // 2 heures
      path: '/',
    });

    await logAction('ARTICLE_VIEW', `Visite unique sur l'article : "${article.titre}"`);

    revalidatePath(`/articles/${articleId}`);
    
    return { success: true, views: updated.views };
  } catch (error: any) {
    console.error('Views Increment Error:', error);
    return { success: false, error: error.message };
  }
}

// Action : Enregistrer l'action de partage dans le journal d'audit
export async function trackArticleShare(articleId: string, platform: string) {
  try {
    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { titre: true },
    });

    if (!article) return { success: false, error: 'Article introuvable' };

    await logAction('ARTICLE_SHARE', `Partage de l'article "${article.titre}" vers ${platform}`);
    return { success: true };
  } catch (error: any) {
    console.error('Track Share Error:', error);
    return { success: false, error: error.message };
  }
}
