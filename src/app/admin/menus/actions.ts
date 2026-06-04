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
) {
  await checkAdmin();
  const slug = slugify(data.nom);
  const validated = menuSchema.parse({ ...data, slug });

  if (id) {
    await db.menu.update({
      where: { id },
      data: { nom: validated.nom, slug: validated.slug, order: validated.order },
    });
  } else {
    await db.menu.create({
      data: { nom: validated.nom, slug: validated.slug, order: validated.order },
    });
  }

  revalidatePath('/admin/menus');
  revalidatePath('/');
}

export async function deleteMenu(id: string) {
  await checkAdmin();
  await db.menu.delete({ where: { id } });
  revalidatePath('/admin/menus');
  revalidatePath('/');
}

export async function saveSubMenu(
  id: string | undefined,
  data: { nom: string; order: number; menuId: string }
) {
  await checkAdmin();
  const slug = slugify(data.nom);
  const validated = subMenuSchema.parse({ ...data, slug });

  if (id) {
    await db.subMenu.update({
      where: { id },
      data: {
        nom: validated.nom,
        slug: validated.slug,
        order: validated.order,
        menuId: validated.menuId,
      },
    });
  } else {
    await db.subMenu.create({
      data: {
        nom: validated.nom,
        slug: validated.slug,
        order: validated.order,
        menuId: validated.menuId,
      },
    });
  }

  revalidatePath('/admin/menus');
  revalidatePath('/');
}

export async function deleteSubMenu(id: string) {
  await checkAdmin();
  await db.subMenu.delete({ where: { id } });
  revalidatePath('/admin/menus');
  revalidatePath('/');
}
