'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    throw new Error('Non autorisé. Accès réservé aux administrateurs.');
  }
}

const menuSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  slug: z.string().min(2, 'Le slug doit contenir au moins 2 caractères.'),
  order: z.number().int().default(0),
});

const subMenuSchema = z.object({
  nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  slug: z.string().min(2, 'Le slug doit contenir au moins 2 caractères.'),
  order: z.number().int().default(0),
  menuId: z.string().min(1, 'Liaison de catégorie parente requise.'),
});

export async function saveMenu(
  id: string | undefined,
  data: { nom: string; order: number }
): Promise<{ success?: boolean; error?: string }> {
  try {
    await checkAdmin();
    const baseSlug = slugify(data.nom);
    if (!baseSlug) {
      return { error: 'Le nom du menu doit comporter des caractères valides.' };
    }

    // Détermination d'un slug unique automatique (non-bloquant)
    let finalSlug = baseSlug;
    let counter = 2;
    while (await db.menu.findFirst({ where: { slug: finalSlug, NOT: id ? { id } : undefined } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const validated = menuSchema.parse({ ...data, slug: finalSlug });

    if (id) {
      await db.menu.update({
        where: { id },
        data: { nom: validated.nom, slug: validated.slug, order: validated.order }
      });
    } else {
      await db.menu.create({
        data: { nom: validated.nom, slug: validated.slug, order: validated.order }
      });
    }

    revalidatePath('/admin/menus');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving menu:', error);
    return { error: error?.message || "Erreur lors de l'enregistrement du menu." };
  }
}

export async function deleteMenu(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await checkAdmin();

    // Les articles liés sont supprimés en cascade (onDelete: Cascade dans le schéma).
    // Supprimer les sous-menus enfants explicitement pour propreté.
    await db.subMenu.deleteMany({
      where: { menuId: id }
    });

    await db.menu.delete({ where: { id } });

    revalidatePath('/admin/menus');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting menu:', error);
    return { error: error?.message || 'Erreur lors de la suppression du menu.' };
  }
}

export async function saveSubMenu(
  id: string | undefined,
  data: { nom: string; order: number; menuId: string }
): Promise<{ success?: boolean; error?: string }> {
  try {
    await checkAdmin();

    const parentMenu = await db.menu.findUnique({
      where: { id: data.menuId }
    });

    if (!parentMenu) {
      return { error: 'Menu parent introuvable.' };
    }

    const baseSlug = slugify(data.nom);
    if (!baseSlug) {
      return { error: 'Le nom de la sous-rubrique doit comporter des caractères valides.' };
    }

    // Détermination d'un slug unique automatique (non-bloquant)
    let candidateSlug = baseSlug;
    const existingGlobal = await db.subMenu.findFirst({
      where: { slug: candidateSlug, NOT: id ? { id } : undefined }
    });

    if (existingGlobal) {
      candidateSlug = `${parentMenu.slug}-${baseSlug}`;
      let counter = 2;
      while (await db.subMenu.findFirst({ where: { slug: candidateSlug, NOT: id ? { id } : undefined } })) {
        candidateSlug = `${parentMenu.slug}-${baseSlug}-${counter}`;
        counter++;
      }
    }

    const validated = subMenuSchema.parse({ ...data, slug: candidateSlug });

    if (id) {
      await db.subMenu.update({
        where: { id },
        data: {
          nom: validated.nom,
          slug: validated.slug,
          order: validated.order,
          menuId: validated.menuId
        }
      });
    } else {
      await db.subMenu.create({
        data: {
          nom: validated.nom,
          slug: validated.slug,
          order: validated.order,
          menuId: validated.menuId
        }
      });
    }

    revalidatePath('/admin/menus');
    revalidatePath(`/category/${parentMenu.slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error saving subMenu:', error);
    return { error: error?.message || "Erreur lors de l'enregistrement de la rubrique." };
  }
}

export async function deleteSubMenu(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await checkAdmin();

    // 1. Détacher les articles associés à cette sous-rubrique
    await db.article.updateMany({
      where: { submenuId: id },
      data: { submenuId: null }
    });

    // 2. Supprimer la sous-rubrique
    await db.subMenu.delete({ where: { id } });

    revalidatePath('/admin/menus');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting subMenu:', error);
    return { error: error?.message || 'Erreur lors de la suppression de la rubrique.' };
  }
}
