import { db } from '@/lib/db';
import AdminAdsClient from '@/components/AdminAdsClient';

export const revalidate = 0; // Pas de cache

export default async function AdminAdsPage() {
  // Récupérer toutes les publicités et les configurations de rotation
  const [ads, adSettings] = await Promise.all([
    db.ad.findMany({
      orderBy: { titre: 'asc' },
    }),
    db.adSetting.findMany(),
  ]);

  return <AdminAdsClient ads={ads} adSettings={adSettings} />;
}
