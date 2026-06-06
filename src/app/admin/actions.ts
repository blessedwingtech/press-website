'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    throw new Error('Non autorisé. Accès réservé aux administrateurs.');
  }
}

export async function toggleDemoDataVisibility() {
  await checkAdmin();
  
  const setting = await db.systemSetting.findUnique({
    where: { key: 'showDemoData' },
  });
  
  const currentValue = setting ? setting.value === 'true' : true;
  const newValue = currentValue ? 'false' : 'true';

  await db.systemSetting.upsert({
    where: { key: 'showDemoData' },
    update: { value: newValue },
    create: { key: 'showDemoData', value: newValue },
  });

  // Revalider toutes les pages principales
  revalidatePath('/admin');
  revalidatePath('/');
  revalidatePath('/latest');
  revalidatePath('/category/[menuSlug]');
  revalidatePath('/category/[menuSlug]/[subMenuSlug]');
  revalidatePath('/articles/[slug]');
  
  return { success: true, newValue: newValue === 'true' };
}
