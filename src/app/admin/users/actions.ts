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
  return session;
}

export async function updateUserRole(id: string, role: string) {
  const session = await checkAdmin();
  
  // Interdire la modification de son propre rôle
  if (id === (session.user as any).id) {
    throw new Error('Vous ne pouvez pas rétrograder votre propre compte.');
  }

  if (role !== 'admin' && role !== 'journalist' && role !== 'reader') {
    throw new Error('Rôle invalide.');
  }

  await db.user.update({
    where: { id },
    data: { role },
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin');
}

export async function toggleUserBan(id: string) {
  const session = await checkAdmin();

  // Interdire l'auto-bannissement
  if (id === (session.user as any).id) {
    throw new Error('Sécurité : Vous ne pouvez pas vous bannir vous-même.');
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new Error('Utilisateur introuvable.');

  const newStatus = user.status === 'banned' ? 'active' : 'banned';

  await db.user.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath('/admin/users');
  revalidatePath('/admin');
}
