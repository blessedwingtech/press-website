'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import * as bcrypt from 'bcryptjs';
import { logAction } from '@/lib/audit';

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

  const updatedUser = await db.user.update({
    where: { id },
    data: { role },
  });

  await logAction('USER_UPDATE_ROLE', `Rôle de l'utilisateur ${updatedUser.email} modifié en : ${role}`);

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

  await logAction('USER_TOGGLE_BAN', `Statut de l'utilisateur ${user.email} changé en : ${newStatus}`);

  revalidatePath('/admin/users');
  revalidatePath('/admin');
}

export async function createUser(data: { name: string; email: string; role: string; password?: string; status?: string }) {
  await checkAdmin();
  const { name, email, password, role, status } = data;

  if (!name || !email || !password || !role) {
    throw new Error('Veuillez remplir tous les champs obligatoires.');
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Cette adresse email est déjà enregistrée.');
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      status: status || 'active',
    },
  });

  await logAction('USER_CREATE', `Création d'un nouvel utilisateur : ${newUser.email} (Rôle: ${role})`);

  revalidatePath('/admin/users');
  revalidatePath('/admin');
}

export async function updateUser(id: string, data: { name: string; email: string; role: string; password?: string; status?: string }) {
  const session = await checkAdmin();
  const { name, email, password, role, status } = data;

  const isSelf = id === (session.user as any).id;
  if (isSelf && (role !== 'admin' || status === 'banned')) {
    throw new Error('Vous ne pouvez pas modifier votre propre rôle administrateur ou vous bannir.');
  }

  const updateData: any = {
    name,
    email,
    role,
    status: status || 'active',
  };

  if (password && password.trim() !== '') {
    const salt = bcrypt.genSaltSync(10);
    updateData.password = bcrypt.hashSync(password, salt);
  }

  const existing = await db.user.findFirst({
    where: {
      email,
      NOT: { id },
    },
  });
  if (existing) {
    throw new Error('Cette adresse email est déjà enregistrée par un autre membre.');
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: updateData,
  });

  await logAction('USER_UPDATE', `Mise à jour des informations de l'utilisateur : ${updatedUser.email}`);

  revalidatePath('/admin/users');
  revalidatePath('/admin');
}

export async function deleteUser(id: string) {
  const session = await checkAdmin();

  if (id === (session.user as any).id) {
    throw new Error('Vous ne pouvez pas supprimer votre propre compte.');
  }

  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new Error('Utilisateur introuvable.');

  await db.user.delete({
    where: { id },
  });

  await logAction('USER_DELETE', `Suppression définitive du compte : ${user.email}`);

  revalidatePath('/admin/users');
  revalidatePath('/admin');
}
