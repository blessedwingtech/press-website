import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminUsersClient from '@/components/AdminUsersClient';

export const revalidate = 0; // Pas de cache

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/login');
  }

  const currentUserId = (session.user as any).id;

  // Récupérer tous les utilisateurs enregistrés
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <AdminUsersClient users={users} currentUserId={currentUserId} />;
}
