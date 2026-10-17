import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminPromosClient from '@/components/AdminPromosClient';

export const revalidate = 0;

export default async function AdminPromosPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    redirect('/');
  }

  const promos = await db.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { usages: true },
      },
    },
  });

  return <AdminPromosClient initialPromos={promos} />;
}
