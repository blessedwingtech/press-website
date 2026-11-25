'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { randomUUID } from 'crypto';

export async function requestPromotionToJournalist(formData: {
  motivation: string;
  portfolioUrl?: string;
  rubrics?: string[];
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return { success: false, error: 'Vous devez être connecté pour effectuer cette demande.' };
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return { success: false, error: 'Utilisateur introuvable.' };
    }

    if (user.role === 'journalist' || user.role === 'admin') {
      return { success: false, error: 'Vous possédez déjà les accès de rédaction ou d\'administration.' };
    }

    // Vérifier si une demande est déjà en attente
    const existingPending = await db.accountRequest.findFirst({
      where: {
        email: user.email,
        role: 'journalist',
        isPromotion: true,
        status: { in: ['PENDING', 'CONFIRMED_EMAIL'] }
      }
    });

    if (existingPending) {
      return { success: false, error: 'Votre demande de promotion est déjà en cours d\'examen par la rédaction.' };
    }

    const combinedMotivation = [
      formData.rubrics && formData.rubrics.length > 0 ? `Rubriques souhaitées : ${formData.rubrics.join(', ')}` : '',
      formData.motivation ? formData.motivation.trim() : ''
    ].filter(Boolean).join('\n\n');

    // Créer la demande de promotion avec statut direct CONFIRMED_EMAIL (l'utilisateur étant déjà vérifié et connecté)
    await db.accountRequest.create({
      data: {
        name: user.name,
        username: user.email.split('@')[0],
        email: user.email,
        role: 'journalist',
        profilePhoto: user.profilePhoto,
        status: 'CONFIRMED_EMAIL',
        confirmationToken: randomUUID(),
        motivation: combinedMotivation || null,
        portfolioUrl: formData.portfolioUrl ? formData.portfolioUrl.trim() : null,
        isPromotion: true,
      }
    });

    await logAction(
      'ACCOUNT_PROMOTION_REQUESTED',
      `Demande de promotion au statut Rédacteur soumise par ${user.name} (${user.email}).`
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting promotion request:', error);
    return { success: false, error: error.message || 'Une erreur est survenue lors de la soumission de votre candidature.' };
  }
}
