'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export interface PromoValidationResult {
  valid: boolean;
  code?: string;
  promoId?: string;
  description?: string | null;
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  finalAmount?: number;
  isFree?: boolean;
  error?: string;
}

// 1. Validation d'un code promo côté serveur
export async function validatePromoCodeAction(
  code: string,
  originalAmount: number,
  targetPlan: string = 'SUBSCRIPTION_VIP'
): Promise<PromoValidationResult> {
  try {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      return { valid: false, error: 'Veuillez saisir un code promo.' };
    }

    const promo = await db.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo) {
      return { valid: false, error: 'Code promo invalide ou inexistant.' };
    }

    if (!promo.active) {
      return { valid: false, error: 'Ce code promo a été désactivé.' };
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return { valid: false, error: 'Ce code promo a expiré.' };
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return { valid: false, error: 'Le quota maximum d\'utilisations de ce code promo a été atteint.' };
    }

    // Vérifier l'éligibilité du plan ciblé
    if (promo.targetPlan !== 'ALL' && promo.targetPlan !== targetPlan) {
      return { valid: false, error: `Ce code promo est uniquement valable pour la formule ${promo.targetPlan}.` };
    }

    // Calcul de la remise
    let discountAmount = 0;
    if (promo.discountType === 'PERCENT') {
      discountAmount = Math.round(originalAmount * (promo.discountValue / 100) * 100) / 100;
    } else {
      discountAmount = Math.min(originalAmount, promo.discountValue);
    }

    const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100);
    const isFree = finalAmount <= 0 || (promo.discountType === 'PERCENT' && promo.discountValue >= 100);

    return {
      valid: true,
      promoId: promo.id,
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      finalAmount,
      isFree,
    };
  } catch (err: any) {
    console.error('[validatePromoCodeAction] Erreur:', err);
    return { valid: false, error: err.message || 'Erreur lors de la validation du code promo.' };
  }
}

// 2. Validation et Activation IMMÉDIATE d'une transaction 100% Gratuite (Remise 100%)
export async function applyFreePromoCodeAction({
  code,
  targetPlan = 'SUBSCRIPTION_VIP',
  planDuration = 'monthly',
}: {
  code: string;
  targetPlan?: string;
  planDuration?: 'monthly' | 'yearly';
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return {
        success: false,
        error: 'Vous devez être connecté à votre compte pour activer cette offre.',
      };
    }

    const cleanCode = (code || '').trim().toUpperCase();
    const promo = await db.promoCode.findUnique({
      where: { code: cleanCode },
    });

    if (!promo || !promo.active) {
      return { success: false, error: 'Code promo invalide ou expiré.' };
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return { success: false, error: 'Ce code promo a expiré.' };
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return { success: false, error: 'Quota maximum de ce code promo atteint.' };
    }

    // Vérifier formellement que la réduction est bien de 100%
    const isHundredPercent = promo.discountType === 'PERCENT' && promo.discountValue >= 100;
    if (!isHundredPercent) {
      return {
        success: false,
        error: 'Ce code promo n\'accorde pas une gratuité à 100%. Veuillez procéder au règlement sécurisé.',
      };
    }

    // Vérifier si l'utilisateur a déjà utilisé ce code
    const alreadyUsed = await db.promoCodeUsage.findFirst({
      where: {
        promoCodeId: promo.id,
        userId,
      },
    });

    if (alreadyUsed) {
      return {
        success: false,
        error: 'Vous avez déjà utilisé ce code promotionnel sur votre compte.',
      };
    }

    // APPLICATION IMMÉDIATE DU PLAN SELON LE TYPE CIBLE
    if (targetPlan === 'SUBSCRIPTION_VIP' || targetPlan === 'VIP') {
      // Activer l'accès lecteur VIP
      await db.user.update({
        where: { id: userId },
        data: {
          role: 'reader_vip',
        },
      });
      await logAction('PROMO_100_VIP_ACTIVATION', `Activation VIP 100% gratuite via code ${promo.code} pour l'utilisateur ${userId}`);
    } else if (targetPlan === 'JOURNALIST_PRO' || targetPlan === 'PRO') {
      // Activer l'accès Journaliste PRO
      const durationDays = planDuration === 'yearly' ? 365 : 30;
      await db.user.update({
        where: { id: userId },
        data: {
          isPro: true,
          proExpiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
        },
      });
      await logAction('PROMO_100_PRO_ACTIVATION', `Activation Journaliste PRO 100% gratuite via code ${promo.code} pour ${userId}`);
    } else {
      // Par défaut : activer reader_vip
      await db.user.update({
        where: { id: userId },
        data: {
          role: 'reader_vip',
        },
      });
    }

    // Incrémenter le nombre d'utilisations du code
    await db.promoCode.update({
      where: { id: promo.id },
      data: {
        usedCount: { increment: 1 },
      },
    });

    // Enregistrer l'usage du code par l'utilisateur
    await db.promoCodeUsage.create({
      data: {
        promoCodeId: promo.id,
        userId,
        discount: 100,
        finalAmount: 0,
      },
    });

    return {
      success: true,
      code: promo.code,
      message: `Félicitations ! Votre réduction de 100% a été validée avec succès. Votre abonnement est activé immédiatement !`,
    };
  } catch (err: any) {
    console.error('[applyFreePromoCodeAction] Erreur:', err);
    return { success: false, error: err.message || 'Erreur lors de la validation immédiate.' };
  }
}
