'use client';

import { useEffect, useRef } from 'react';

interface GoogleAdBannerProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

export default function GoogleAdBanner({
  client = 'ca-pub-7700349313493923',
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: GoogleAdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && !isLoadedRef.current) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        isLoadedRef.current = true;
      }
    } catch (e) {
      // Ignorer silencieusement si un bloqueur de pub empêche le push
    }
  }, []);

  return (
    <div
      className={`w-full overflow-hidden flex flex-col items-center justify-center my-2 min-h-[90px] bg-slate-900/20 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-800/80 p-2 ${className}`}
    >
      <span className="text-[9px] tracking-widest uppercase font-bold text-slate-500 mb-1 select-none">
        Publicité Google AdSense
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', textAlign: 'center' }}
        data-ad-client={client}
        data-ad-slot={slot || undefined}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
