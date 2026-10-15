'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { z } from 'zod';
import { logAction } from '@/lib/audit';

const articleSchema = z.object({
  titre: z.string().min(5, 'Le titre doit contenir au moins 5 caractères.'),
  contenu: z.string().min(20, 'Le contenu doit contenir au moins 20 caractères.'),
  imagePrincipale: z.string().min(1, 'L’image ou vidéo principale est obligatoire.'),
  menuId: z.string().min(1, 'Sélectionnez un menu.'),
  submenuId: z.string().nullable().optional(),
  alsoInActualites: z.boolean().default(false),
  actualitesSubmenuId: z.string().nullable().optional(),
  published: z.boolean().default(true),
  isVip: z.boolean().default(false),
});

export async function saveArticle(
  id: string | undefined,
  data: {
    titre: string;
    contenu: string;
    imagePrincipale: string;
    menuId: string;
    submenuId: string | null;
    alsoInActualites?: boolean;
    actualitesSubmenuId?: string | null;
    published?: boolean;
    isVip?: boolean;
  }
) {
  const session = await getServerSession(authOptions);
  if (!session || ((session.user as any).role !== 'journalist' && (session.user as any).role !== 'admin')) {
    throw new Error('Session expirée ou droits insuffisants.');
  }

  // Validation Zod serveur
  const validatedData = articleSchema.parse(data);
  const slug = slugify(validatedData.titre);

  // Vérifier l'unicité du slug (exclure l'article en cours si édition)
  const existing = await db.article.findFirst({
    where: {
      slug,
      NOT: id ? { id } : undefined,
    },
  });

  const finalSlug = existing ? `${slug}-${Math.floor(1000 + Math.random() * 9000)}` : slug;

  if (id) {
    // Vérification de la propriété
    const article = await db.article.findUnique({ where: { id } });
    if (!article) throw new Error('Article non trouvé.');

    if (article.auteurId !== (session.user as any).id && (session.user as any).role !== 'admin') {
      throw new Error('Vous n’avez pas l’autorisation de modifier cet article.');
    }

    await db.article.update({
      where: { id },
      data: {
        titre: validatedData.titre,
        slug: finalSlug,
        contenu: validatedData.contenu,
        imagePrincipale: validatedData.imagePrincipale,
        menuId: validatedData.menuId,
        submenuId: validatedData.submenuId || null,
        alsoInActualites: validatedData.alsoInActualites,
        actualitesSubmenuId: validatedData.actualitesSubmenuId || null,
        published: validatedData.published,
        isVip: validatedData.isVip,
      },
    });

    await logAction('ARTICLE_UPDATE', `Article mis à jour : "${validatedData.titre}" (slug: ${finalSlug}, VIP: ${validatedData.isVip})`);
  } else {
    // Création d'un nouvel article
    await db.article.create({
      data: {
        titre: validatedData.titre,
        slug: finalSlug,
        contenu: validatedData.contenu,
        imagePrincipale: validatedData.imagePrincipale,
        menuId: validatedData.menuId,
        submenuId: validatedData.submenuId || null,
        alsoInActualites: validatedData.alsoInActualites,
        actualitesSubmenuId: validatedData.actualitesSubmenuId || null,
        auteurId: (session.user as any).id,
        published: validatedData.published,
        isVip: validatedData.isVip,
      },
    });

    await logAction('ARTICLE_CREATE', `Nouvel article rédigé : "${validatedData.titre}" (slug: ${finalSlug}, VIP: ${validatedData.isVip})`);
  }

  // Mettre à jour le cache de rendu Next.js
  revalidatePath('/journalist');
  revalidatePath('/');
  revalidatePath(`/articles/${finalSlug}`);
  revalidatePath(`/category/${validatedData.menuId}`);
  if (validatedData.alsoInActualites) {
    revalidatePath('/category/actualites');
  }

  return { success: true, slug: finalSlug };
}

export async function deleteArticleAction(articleId: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  if (!userId) throw new Error('Non authentifié');

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error('Article non trouvé.');

  if (article.auteurId === userId || role === 'admin') {
    await db.article.delete({ where: { id: articleId } });
    await logAction('ARTICLE_DELETE', `Article supprimé définitivement : "${article.titre}"`);
    
    revalidatePath('/journalist');
    revalidatePath('/');
  } else {
    throw new Error('Droit de suppression refusé.');
  }
}

export async function updateArticleCoverImage(articleId: string, imageUrl: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  if (!userId) throw new Error('Non authentifié');

  const article = await db.article.findUnique({ where: { id: articleId } });
  if (!article) throw new Error('Article non trouvé.');

  if (article.auteurId !== userId && role !== 'admin') {
    throw new Error('Non autorisé.');
  }

  await db.article.update({
    where: { id: articleId },
    data: { imagePrincipale: imageUrl },
  });

  revalidatePath('/journalist');
  revalidatePath(`/articles/${article.slug}`);
  return { success: true };
}

/**
 * Mise à jour du profil du journaliste indépendant (Canal WhatsApp personnel, Bio, Twitter)
 */
export async function updateJournalistProfile(data: {
  bio?: string;
  whatsappChannel?: string;
  twitter?: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error('Non authentifié');

  await db.user.update({
    where: { id: userId },
    data: {
      bio: data.bio?.trim() || null,
      whatsappChannel: data.whatsappChannel?.trim() || null,
      twitter: data.twitter?.trim() || null,
    },
  });

  revalidatePath('/journalist');
  revalidatePath('/profile');
  return { success: true };
}

/**
 * Demande de reversement (Payout) du solde collecté par un journaliste
 * Supporte MonCash, PayPal, Carte Bancaire et Virement Bancaire
 */
export async function requestPayoutAction(data: {
  amount: number;
  currency: 'HTG' | 'USD';
  method: 'MONCASH' | 'PAYPAL' | 'CARD' | 'BANK_TRANSFER';
  methodDetails: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) throw new Error('Non authentifié');

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('Utilisateur non trouvé');

  const availableBalance = data.currency === 'HTG' ? user.balanceHTG : user.balanceUSD;

  if (data.amount <= 0 || data.amount > availableBalance) {
    throw new Error(`Solde insuffisant. Votre solde disponible est de ${availableBalance} ${data.currency}`);
  }

  // Déduire le montant demandé du solde
  if (data.currency === 'HTG') {
    await db.user.update({
      where: { id: userId },
      data: { balanceHTG: { decrement: data.amount } },
    });
  } else {
    await db.user.update({
      where: { id: userId },
      data: { balanceUSD: { decrement: data.amount } },
    });
  }

  // Créer l'enregistrement de payout en attente
  const payout = await db.payout.create({
    data: {
      userId,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      methodDetails: data.methodDetails,
      status: 'PENDING',
    },
  });

  await logAction(
    'PAYOUT_REQUEST',
    `Demande de reversement de ${data.amount} ${data.currency} par ${user.name} via ${data.method} (${data.methodDetails})`
  );

  revalidatePath('/journalist');
  return { success: true, payoutId: payout.id };
}