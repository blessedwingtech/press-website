import { db } from '@/lib/db';
import AdRotator from './AdRotator';

interface AdSlotProps {
  position: 'header' | 'sidebar' | 'footer' | 'left-sidebar';
}

export default async function AdSlot({ position }: AdSlotProps) {
  // 1. Récupérer la configuration de rotation
  const setting = await db.adSetting.findUnique({
    where: { position },
  });

  const limit = setting?.limit ?? 5;
  const interval = setting?.interval ?? 10;

  // 2. Récupérer le paramètre de démonstration
  const demoSetting = await db.systemSetting.findUnique({
    where: { key: 'showDemoData' },
  });
  const showDemo = demoSetting ? demoSetting.value === 'true' : true;

  const where: any = {
    position,
    active: true,
  };

  if (!showDemo) {
    where.isDemo = false;
  }

  // 3. Récupérer les publicités actives pour cette position
  const ads = await db.ad.findMany({
    where,
    take: limit,
  });

  if (ads.length === 0) {
    return null; // Pas de publicité à afficher
  }

  return <AdRotator ads={ads} interval={interval} position={position} />;
}
