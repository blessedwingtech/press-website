import { db } from '@/lib/db';
import AdminAdsClient from '@/components/AdminAdsClient';

export const revalidate = 0; // Pas de cache

export default async function AdminAdsPage() {
  // Récupérer toutes les publicités triées par titre
  const ads = await db.ad.findMany({
    orderBy: { titre: 'asc' },
  });

  return <AdminAdsClient ads={ads} />;
}
