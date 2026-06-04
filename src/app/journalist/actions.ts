'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

const articleSchema = z.object({
  titre: z.string().min(5, 'Le titre doit contenir au moins 5 caractères.'),
  contenu: z.string().min(20, 'Le contenu doit contenir au moins 20 caractères.'),
  imagePrincipale: z.string().min(1, 'L’image principale est obligatoire.'),
  menuId: z.string().min(1, 'Sélectionnez un menu.'),
  submenuId: z.string().nullable().optional(),
});

export async function saveArticle(
  id: string | undefined,
  data: {
    titre: string;
    contenu: string;
    imagePrincipale: string;
    menuId: string;
    submenuId: string | null;
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
      },
    });
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
        auteurId: (session.user as any).id,
      },
    });
  }

  // Mettre à jour le cache de rendu Next.js
  revalidatePath('/journalist');
  revalidatePath('/');
  revalidatePath(`/articles/${finalSlug}`);
  revalidatePath(`/category/${validatedData.menuId}`);

  return { success: true, slug: finalSlug };
}
