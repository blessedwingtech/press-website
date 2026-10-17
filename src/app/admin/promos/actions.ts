'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    throw new Error('Action réservée aux administrateurs.');
  }
  return session;
}

export async function createPromoCodeAction(formData: {
  code: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  maxUses?: number | null;
  targetPlan?: string;
  expiresAt?: string | null;
}) {
  await checkAdmin();

  const code = formData.code.trim().toUpperCase();
  if (!code || code.length < 3) {
    throw new Error('Le code promo doit comporter au moins 3 caractères.');
  }

  if (formData.discountValue <= 0) {
    throw new Error('La valeur de la réduction doit être supérieure à 0.');
  }

  if (formData.discountType === 'PERCENT' && formData.discountValue > 100) {
    throw new Error('Le pourcentage de réduction ne peut pas dépasser 100%.');
  }

  const existing = await db.promoCode.findUnique({
    where: { code },
  });

  if (existing) {
    throw new Error(`Le code promo "${code}" existe déjà.`);
  }

  const newPromo = await db.promoCode.create({
    data: {
      code,
      description: formData.description?.trim() || null,
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      maxUses: formData.maxUses ? Number(formData.maxUses) : null,
      targetPlan: formData.targetPlan || 'ALL',
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
      active: true,
    },
  });

  await logAction('PROMO_CREATE', `Création du code promo ${code} (${formData.discountValue}${formData.discountType === 'PERCENT' ? '%' : '$'})`);
  revalidatePath('/admin/promos');
  return { success: true, promo: newPromo };
}

export async function togglePromoCodeStatusAction(id: string, active: boolean) {
  await checkAdmin();

  const promo = await db.promoCode.update({
    where: { id },
    data: { active },
  });

  await logAction('PROMO_TOGGLE', `Code promo ${promo.code} passé à : ${active ? 'ACTIF' : 'INACTIF'}`);
  revalidatePath('/admin/promos');
  return { success: true };
}

export async function deletePromoCodeAction(id: string) {
  await checkAdmin();

  const promo = await db.promoCode.delete({
    where: { id },
  });

  await logAction('PROMO_DELETE', `Suppression du code promo ${promo.code}`);
  revalidatePath('/admin/promos');
  return { success: true };
}
