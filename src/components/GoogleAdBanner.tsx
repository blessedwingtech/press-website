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

    // Timeout de sécurité : si après 3.5s aucune pub Google n'est affichée (examen en cours), on bascule sur la régie partenaire
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

  return (
    <div
      className={`w-full overflow-hidden flex flex-col items-center justify-center my-3 relative rounded-xl transition-all ${
        adStatus === 'filled' ? 'min-h-[90px]' : 'min-h-[90px]'
      } ${className}`}
    >
      {/*
        IMPORTANT pour la stabilité React :
        Ne JAMAIS démonter la balise <ins> du DOM une fois touchée par Google AdSense.
        Google y injecte des iframes ; démonter l'élément provoque une exception React fatale
        "NotFoundError: Failed to execute 'removeChild' on 'Node'" qui fait crasher la page entière.
        On contrôle l'affichage par CSS (display: none / flex).
      */}
      <div
        className="w-full justify-center"
        style={{ display: adStatus === 'filled' ? 'flex' : 'none' }}
      >
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

      {/* Affichage de secours partenaire pendant le chargement ou si Google n'a pas servi d'annonce */}
      {adStatus !== 'filled' && fallbackAds.length > 0 && (
        <div className="w-full">
          <AdRotator ads={fallbackAds} interval={interval} position="header" />
        </div>
      )}
    </div>
  );
}
