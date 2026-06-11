'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import SafeImage from '@/components/SafeImage';

interface Ad {
  id: string;
  titre: string;
  imageUrl: string;
  lien: string;
  position: string;
}

interface AdRotatorProps {
  ads: Ad[];
  interval: number; // en secondes
  position: string;
}

export default function AdRotator({ ads, interval, position }: AdRotatorProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, interval * 1000);

    return () => clearInterval(timer);
  }, [ads.length, interval]);

  const ad = ads[index];
  if (!ad) return null;

  // Classes de styles selon l'emplacement
  const layoutClasses: Record<string, string> = {
    header: 'w-full max-w-7xl mx-auto my-4 h-[90px] sm:h-[120px] relative rounded-lg overflow-hidden border border-slate-800 shadow-lg group bg-slate-900',
    sidebar: 'w-full my-4 h-[250px] sm:h-[300px] relative rounded-lg overflow-hidden border border-slate-800 shadow-lg group bg-slate-900',
    footer: 'w-full max-w-7xl mx-auto my-4 h-[90px] sm:h-[120px] relative rounded-lg overflow-hidden border border-slate-800 shadow-lg group bg-slate-900',
    'left-sidebar': 'w-full my-4 h-[250px] sm:h-[300px] relative rounded-lg overflow-hidden border border-slate-800 shadow-lg group bg-slate-900',
  };

  const currentClass = layoutClasses[position] || layoutClasses['sidebar'];

  return (
    <a
      href={ad.lien}
      target="_blank"
      rel="noopener noreferrer"
      className={`${currentClass} block transition-all duration-500 transform hover:scale-[1.01] hover:border-emerald-500/40`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
      
      {/* Utilisation de next/image avec transition CSS douce */}
      <div className="relative w-full h-full">
        <Image
          src={ad.imageUrl}
          alt={ad.titre}
          fill
          sizes="(max-w-768px) 100vw, 25vw"
          className="object-cover select-none transition-opacity duration-500"
          priority={position === 'header'}
        />
      </div>

      <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2 py-0.5 rounded text-[8px] font-extrabold text-emerald-400 uppercase tracking-widest z-20">
        Publicité
      </div>
      <div className="absolute bottom-2 left-3 text-xs font-semibold text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate max-w-[80%] z-20">
        {ad.titre}
      </div>
    </a>
  );
}
