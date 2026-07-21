'use server';

import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { sendApprovalEmail, sendRejectionEmail } from '@/lib/email';
import * as bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper to check if current user is admin
async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    throw new Error('Action non autorisée. Réservée aux administrateurs.');
  }
}

export async function getConfirmedRequests() {
  await ensureAdmin();
  try {
    return await db.accountRequest.findMany({
      where: { status: 'CONFIRMED_EMAIL' },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching account requests:', error);
    return [];
  }
}

export async function approveAccountRequest(id: string) {
  await ensureAdmin();
  try {
    // 1. Trouver la demande
    const request = await db.accountRequest.findUnique({
      where: { id }
    });

    if (!request) {
      return { success: false, error: 'Demande introuvable.' };
    }

    // 2. Générer un mot de passe temporaire solide
    const tempPass = Math.random().toString(36).substring(2, 10) + 'A1!';
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(tempPass, salt);

    // 3. Créer l'utilisateur officiel
    const newUser = await db.user.create({
      data: {
        name: request.name,
        email: request.email,
        password: hashedPassword,
        role: request.role, // 'reader' ou 'journalist'
        status: 'active',
        profilePhoto: request.profilePhoto
      }
    });

    // 4. Mettre à jour ou supprimer la demande
    await db.accountRequest.delete({
      where: { id }
    });

    // 5. Envoyer l'email d'approbation avec les accès
    // On assume que le site est hébergé localement ou en prod, on crée le lien de login
    const loginLink = `/login`; // Le composant client gérera le lien absolu si besoin ou un simple href /login
    await sendApprovalEmail(request.email, request.name, tempPass, loginLink);

    // 6. Enregistrer l'audit log
    await logAction('ACCOUNT_REQUEST_APPROVE', `Demande de compte approuvée pour ${request.name} (${request.email}) - Utilisateur créé.`);

    return { success: true };
  } catch (error: any) {
    console.error('Error approving account request:', error);
    return { success: false, error: error.message || 'Une erreur est survenue lors de l\'approbation.' };
  }
}

export async function rejectAccountRequest(id: string) {
  await ensureAdmin();
  try {
    // 1. Trouver la demande
    const request = await db.accountRequest.findUnique({
      where: { id }
    });

    if (!request) {
      return { success: false, error: 'Demande introuvable.' };
    }

    // 2. Envoyer l'email de rejet
    await sendRejectionEmail(request.email, request.name);

    // 3. Supprimer la demande
    await db.accountRequest.delete({
      where: { id }
    });

    // 4. Enregistrer l'audit log
    await logAction('ACCOUNT_REQUEST_REJECT', `Demande de compte rejetée et supprimée pour ${request.name} (${request.email}).`);

    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting account request:', error);
    return { success: false, error: error.message || 'Une erreur est survenue lors du rejet.' };
  }
}
