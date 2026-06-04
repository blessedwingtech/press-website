'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    throw new Error('Non autorisé. Accès réservé aux administrateurs.');
  }
}

const adSchema = z.object({
  titre: z.string().min(2, 'Le titre doit faire au moins 2 caractères.'),
  imageUrl: z.string().min(1, 'L’URL de l’image est obligatoire.'),
  lien: z.string().url('Veuillez fournir un lien URL de redirection valide.'),
  position: z.enum(['header', 'sidebar', 'footer']),
  active: z.boolean().default(true),
});

export async function saveAd(
  id: string | undefined,
  data: {
    titre: string;
    imageUrl: string;
    lien: string;
    position: 'header' | 'sidebar' | 'footer';
    active: boolean;
  }
) {
  await checkAdmin();
  const validated = adSchema.parse(data);

  if (id) {
    await db.ad.update({
      where: { id },
      data: validated,
    });
  } else {
    await db.ad.create({
      data: validated,
    });
  }

  revalidatePath('/admin/ads');
  revalidatePath('/');
}

export async function deleteAd(id: string) {
  await checkAdmin();
  await db.ad.delete({ where: { id } });
  revalidatePath('/admin/ads');
  revalidatePath('/');
}
