import { db } from '@/lib/db';

interface AdSlotProps {
  position: 'header' | 'sidebar' | 'footer';
}

export default async function AdSlot({ position }: AdSlotProps) {
  // Récupérer toutes les publicités actives pour cette position
  const ads = await db.ad.findMany({
    where: {
      position,
      active: true,
    },
  });

  if (ads.length === 0) {
    return null; // Pas de publicité à afficher
  }

  // Choisir une publicité au hasard parmi celles disponibles
  const randomIndex = Math.floor(Math.random() * ads.length);
  const ad = ads[randomIndex];

  // Classes de styles selon l'emplacement
  const layoutClasses = {
    header: 'w-full max-w-7xl mx-auto my-4 h-[90px] sm:h-[120px] relative rounded-lg overflow-hidden border border-slate-800 shadow-lg group bg-slate-900',
    sidebar: 'w-full my-4 h-[250px] sm:h-[300px] relative rounded-lg overflow-hidden border border-slate-800 shadow-lg group bg-slate-900',
    footer: 'w-full max-w-7xl mx-auto my-4 h-[90px] sm:h-[120px] relative rounded-lg overflow-hidden border border-slate-800 shadow-lg group bg-slate-900',
  };

  return (
    <a
      href={ad.lien}
      target="_blank"
      rel="noopener noreferrer"
      className={`${layoutClasses[position]} block transition-all duration-300 transform hover:scale-[1.01] hover:border-emerald-500/40`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ad.imageUrl}
        alt={ad.titre}
        className="w-full h-full object-cover select-none"
      />
      <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm border border-slate-800 px-2 py-0.5 rounded text-[8px] font-extrabold text-emerald-400 uppercase tracking-widest z-20">
        Publicité
      </div>
      <div className="absolute bottom-2 left-3 text-xs font-semibold text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate max-w-[80%] z-20">
        {ad.titre}
      </div>
    </a>
  );
}
