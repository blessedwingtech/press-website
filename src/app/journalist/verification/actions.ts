'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import { sendVerificationApprovedEmail } from '@/lib/email';

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    throw new Error('Action réservée aux administrateurs.');
  }
  return session;
}

export async function submitVerificationApplication(data: {
  specialties: string[];
  publicProfileUrl?: string;
  portfolioLinks: string;
  bio: string;
  ethicsAccepted: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, error: 'Session expirée. Veuillez vous reconnecter.' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return { success: false, error: 'Utilisateur introuvable.' };
    }

    if ((user as any).isVerified) {
      return { success: false, error: 'Votre compte est déjà vérifié et certifié.' };
    }

    if (!data.ethicsAccepted) {
      return { success: false, error: 'Vous devez accepter la Charte Éditoriale et Déontologique.' };
    }

    if (!data.bio || data.bio.trim().length < 20) {
      return { success: false, error: 'Veuillez décrire brièvement votre démarche et votre parcours (min. 20 caractères).' };
    }

    if (!data.portfolioLinks || data.portfolioLinks.trim().length < 5) {
      return { success: false, error: 'Veuillez fournir au moins un lien ou une référence vers vos articles/travaux récents.' };
    }

    // Vérifier si une demande est déjà en attente
    const existingPending = await db.verificationRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING'
      }
    });

    if (existingPending) {
      return { success: false, error: 'Votre dossier de vérification est déjà en cours d\'examen par la rédaction.' };
    }

    await db.verificationRequest.create({
      data: {
        userId: user.id,
        specialties: data.specialties.join(', '),
        publicProfileUrl: data.publicProfileUrl?.trim() || null,
        portfolioLinks: data.portfolioLinks.trim(),
        bio: data.bio.trim(),
        ethicsAccepted: true,
        status: 'PENDING'
      }
    });

    await logAction(
      'JOURNALIST_VERIFICATION_REQUESTED',
      `Dossier d'accréditation soumis par ${user.name} (${user.email}).`
    );

    revalidatePath('/journalist/verification');
    return { success: true };
  } catch (error: any) {
    console.error('Error submitting verification request:', error);
    return { success: false, error: error.message || 'Une erreur est survenue lors de la soumission.' };
  }
}

export async function getPendingVerifications() {
  await ensureAdmin();
  try {
    return await db.verificationRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true,
            role: true,
            createdAt: true,
            _count: { select: { articles: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return [];
  }
}

export async function approveVerification(requestId: string) {
  await ensureAdmin();
  try {
    const request = await db.verificationRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!request) {
      return { success: false, error: 'Demande introuvable.' };
    }

    // Valider le journaliste
    await db.user.update({
      where: { id: request.userId },
      data: {
        isVerified: true,
        verifiedAt: new Date()
      }
    });

    // Mettre à jour la demande
    await db.verificationRequest.update({
      where: { id: requestId },
      data: { status: 'APPROVED' }
    });

    // Envoyer l'email de confirmation
    if (request.user.email) {
      await sendVerificationApprovedEmail(request.user.email, request.user.name);
    }

    // Logger
    await logAction(
      'JOURNALIST_VERIFICATION_APPROVED',
      `Certification accordée à ${request.user.name} (${request.user.email}).`
    );

    revalidatePath('/journalist/verification');
    revalidatePath('/admin/users');
    revalidatePath('/admin/requests');
    return { success: true };
  } catch (error: any) {
    console.error('Error approving verification:', error);
    return { success: false, error: error.message || 'Erreur lors de l\'approbation.' };
  }
}

export async function rejectVerification(requestId: string, reason?: string) {
  await ensureAdmin();
  try {
    const request = await db.verificationRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!request) {
      return { success: false, error: 'Demande introuvable.' };
    }

    await db.verificationRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        adminNotes: reason?.trim() || null
      }
    });

    await logAction(
      'JOURNALIST_VERIFICATION_REJECTED',
      `Demande de certification refusée pour ${request.user.name} (${request.user.email}). Motif: ${reason || 'Non précisé'}`
    );

    revalidatePath('/journalist/verification');
    revalidatePath('/admin/users');
    revalidatePath('/admin/requests');
    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting verification:', error);
    return { success: false, error: error.message || 'Erreur lors du rejet.' };
  }
}
