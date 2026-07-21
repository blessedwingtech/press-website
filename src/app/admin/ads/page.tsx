import { db } from '@/lib/db';
import AdminAdsClient from '@/components/AdminAdsClient';

export const revalidate = 0; // Pas de cache

export default async function AdminAdsPage() {
  // Récupérer toutes les publicités et les configurations de rotation
  const [ads, adSettings, users] = await Promise.all([
    db.ad.findMany({
      orderBy: { titre: 'asc' },
    }),
    db.adSetting.findMany(),
    db.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return <AdminAdsClient ads={ads} adSettings={adSettings} users={users} />;
}
