import { db } from '@/lib/db';
import AdminMenusClient from '@/components/AdminMenusClient';

export const revalidate = 0; // Pas de cache pour les modifications en temps réel

export default async function AdminMenusPage() {
  // Récupérer la structure actuelle ordonnée
  const menus = await db.menu.findMany({
    orderBy: { order: 'asc' },
    include: {
      submenus: { orderBy: { order: 'asc' } },
    },
  });

  return <AdminMenusClient menus={menus} />;
}
