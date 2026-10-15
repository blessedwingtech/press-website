'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

/**
 * Valider et marquer un payout comme effectué (COMPLETED)
 */
export async function markPayoutCompletedAction(payoutId: string, note?: string) {
  const session = await getServerSession(authOptions);
  const adminId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  if (!adminId || role !== 'admin') {
    throw new Error('Action réservée aux administrateurs.');
  }

  const payout = await db.payout.findUnique({
    where: { id: payoutId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!payout) throw new Error('Demande de retrait introuvable.');

  await db.payout.update({
    where: { id: payoutId },
    data: {
      status: 'COMPLETED',
      note: note || 'Reversement exécuté avec succès par l’administration.',
    },
  });

  await logAction(
    'PAYOUT_APPROVED',
    `Payout ${payout.amount} ${payout.currency} validé pour ${payout.user.name} (${payout.method})`
  );

  revalidatePath('/admin/payouts');
  revalidatePath('/journalist');
  return { success: true };
}

/**
 * Rejeter une demande de retrait et recréditer automatiquement le solde du journaliste
 */
export async function rejectPayoutAction(payoutId: string, reason: string) {
  const session = await getServerSession(authOptions);
  const adminId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  if (!adminId || role !== 'admin') {
    throw new Error('Action réservée aux administrateurs.');
  }

  const payout = await db.payout.findUnique({
    where: { id: payoutId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!payout) throw new Error('Demande de retrait introuvable.');
  if (payout.status !== 'PENDING') {
    throw new Error('Seules les demandes en attente peuvent être rejetées.');
  }

  // Recréditer le solde de l'auteur
  if (payout.currency === 'HTG') {
    await db.user.update({
      where: { id: payout.userId },
      data: { balanceHTG: { increment: payout.amount } },
    });
  } else {
    await db.user.update({
      where: { id: payout.userId },
      data: { balanceUSD: { increment: payout.amount } },
    });
  }

  // Marquer REJECTED
  await db.payout.update({
    where: { id: payoutId },
    data: {
      status: 'REJECTED',
      note: reason || 'Demande rejetée par l’administration. Fonds recrédités sur votre solde.',
    },
  });

  await logAction(
    'PAYOUT_REJECTED',
    `Payout ${payout.amount} ${payout.currency} refusé pour ${payout.user.name}. Motif: ${reason}`
  );

  revalidatePath('/admin/payouts');
  revalidatePath('/journalist');
  return { success: true };
}
