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
  position: z.string().min(1, 'La position est requise.'),
  active: z.boolean().default(true),
  ownerId: z.string().nullable().optional(),
});

export async function saveAd(
  id: string | undefined,
  data: {
    titre: string;
    imageUrl: string;
    lien: string;
    position: string;
    active: boolean;
    ownerId?: string | null;
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

export async function saveAdSetting(position: string, limit: number, interval: number) {
  await checkAdmin();
  
  if (limit < 1 || interval < 1) {
    throw new Error('La limite et l’intervalle doivent être supérieurs à 0.');
  }

  await db.adSetting.upsert({
    where: { position },
    update: { limit, interval },
    create: { position, limit, interval },
  });

  revalidatePath('/admin/ads');
  revalidatePath('/');
}

