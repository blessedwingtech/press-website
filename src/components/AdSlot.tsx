import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdRotator from './AdRotator';
import GoogleAdBanner from './GoogleAdBanner';

interface AdSlotProps {
  position: 'header' | 'sidebar' | 'footer' | 'left-sidebar';
}

export default async function AdSlot({ position }: AdSlotProps) {
  // Les membres VIP / PRO bénéficient d'une expérience 100% sans publicité
  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as any).role === 'reader_vip') {
    return null;
  }

  // 1. Récupérer la configuration de rotation et de démonstration
  const setting = await db.adSetting.findUnique({
    where: { position },
  });

  const limit = setting?.limit ?? 5;
  const interval = setting?.interval ?? 10;

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

  // Récupérer les publicités actives pour cette position
  const ads = await db.ad.findMany({
    where,
    take: limit,
  });

  // Emplacement HAUT : Confié à Google AdSense avec vos bannières partenaires en Fallback automatique
  // Ainsi, tant que Google est en examen (24-48h), AUCUN rectangle blanc n'apparaît : vos bannières partenaires s'affichent !
  if (position === 'header') {
    return (
      <GoogleAdBanner
        client="ca-pub-7700349313493923"
        fallbackAds={ads}
        interval={interval}
      />
    );
  }

  // Emplacements LATÉRAL et BAS : Réservés à la régie interne et partenaires
  if (ads.length === 0) {
    return null; // Pas de publicité à afficher
  }

  return <AdRotator ads={ads} interval={interval} position={position} />;
}
