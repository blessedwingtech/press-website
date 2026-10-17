import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminPayoutsClient from '@/components/AdminPayoutsClient';

export const revalidate = 0;

export default async function AdminPayoutsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    redirect('/');
  }

  const payouts = await db.payout.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isPro: true,
        },
      },
    },
  });

  return <AdminPayoutsClient initialPayouts={payouts} />;
}
