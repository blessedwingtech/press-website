'use client';

import { useEffect, useRef, useState } from 'react';
import AdRotator from './AdRotator';

interface Ad {
  id: string;
  titre: string;
  imageUrl: string;
  lien: string;
  position: string;
}

interface GoogleAdBannerProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  fallbackAds?: Ad[];
  interval?: number;
}

export default function GoogleAdBanner({
  client = 'ca-pub-7700349313493923',
  slot,
  format = 'auto',
  responsive = true,
  className = '',
  fallbackAds = [],
  interval = 10,
}: GoogleAdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const isLoadedRef = useRef(false);
  const [adStatus, setAdStatus] = useState<'loading' | 'filled' | 'unfilled'>('loading');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !isLoadedRef.current) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        isLoadedRef.current = true;
      }
    } catch {
      setAdStatus('unfilled');
    }

    // Observer si Google AdSense remplit l'annonce ou la laisse vide (compte en examen)
    const checkInterval = setInterval(() => {
      if (adRef.current) {
        const status = adRef.current.getAttribute('data-ad-status');
        if (status === 'filled') {
          setAdStatus('filled');
          clearInterval(checkInterval);
        } else if (status === 'unfilled') {
          setAdStatus('unfilled');
          clearInterval(checkInterval);
        }
      }
    }, 1000);

    // Timeout de sécurité : si après 4s aucune pub Google n'est affichée (examen en cours), on bascule sur la régie partenaire
    const safetyTimer = setTimeout(() => {
      if (adStatus === 'loading') {
        const status = adRef.current?.getAttribute('data-ad-status');
        if (status !== 'filled') {
          setAdStatus('unfilled');
        }
      }
    }, 3500);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(safetyTimer);
    };
  }, [adStatus]);

  // Si AdSense n'est pas encore prêt (ou en cours d'examen), afficher la publicité partenaire interne pour éviter le rectangle blanc
  if (adStatus === 'unfilled' && fallbackAds.length > 0) {
    return <AdRotator ads={fallbackAds} interval={interval} position="header" />;
  }

  return (
    <div
      className={`w-full overflow-hidden flex flex-col items-center justify-center my-3 relative rounded-xl transition-all ${
        adStatus === 'filled' ? 'min-h-[90px]' : 'min-h-[90px]'
      } ${className}`}
    >
      {/* Conteneur ins AdSense avec fond sombre pour éviter tout flash blanc */}
      <div className={`w-full flex justify-center ${adStatus === 'unfilled' ? 'hidden' : 'block'}`}>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '970px',
            textAlign: 'center',
            backgroundColor: 'transparent',
          }}
          data-ad-client={client}
          data-ad-slot={slot || undefined}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
      </div>

      {/* Affichage de secours partenaire pendant le chargement ou l'attente */}
      {adStatus === 'loading' && fallbackAds.length > 0 && (
        <div className="w-full">
          <AdRotator ads={fallbackAds} interval={interval} position="header" />
        </div>
      )}
    </div>
  );
}
