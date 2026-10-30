import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  showSlogan?: boolean;
  size?: 'sm' | 'md' | 'lg';
  hideHaitiImage?: boolean;
}

export default function Logo({ showSlogan = true, size = 'md', hideHaitiImage = false }: LogoProps) {
  const sizeClasses = {
    sm: {
      emblemW: 30,
      emblemH: 30,
      img: 13,
      title: 'text-base sm:text-lg',
      slogan: 'text-[8px]',
      gap: 'gap-2 sm:gap-2.5',
      badgeText: 'text-[7px]',
    },
    md: {
      emblemW: 38,
      emblemH: 38,
      img: 16,
      title: 'text-xl sm:text-2xl',
      slogan: 'text-[9px]',
      gap: 'gap-2.5 sm:gap-3',
      badgeText: 'text-[7px] sm:text-[8px]',
    },
    lg: {
      emblemW: 52,
      emblemH: 52,
      img: 20,
      title: 'text-2xl sm:text-3xl',
      slogan: 'text-[10px] sm:text-[11px]',
      gap: 'gap-3 sm:gap-4',
      badgeText: 'text-[8px] sm:text-[9px]',
    },
  };

  const selectedSize = sizeClasses[size];

  return (
    <Link href="/" className={`flex items-center ${selectedSize.gap} group select-none max-w-full`}>
      {/* Plume d'investigation PressTonik (Bleu Marine & Rouge Écarlate) */}
      <div className="shrink-0 relative transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
        <Image
          src="/logo-emblem.png"
          alt="Emblème Plume PressTonik"
          width={selectedSize.emblemW}
          height={selectedSize.emblemH}
          className="object-contain filter drop-shadow-[0_2px_8px_rgba(206,17,38,0.25)] dark:drop-shadow-[0_2px_8px_rgba(56,189,248,0.2)]"
          priority
        />
      </div>

      {/* Identité textuelle PressTonik */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
          <span className={`${selectedSize.title} font-serif tracking-tight whitespace-nowrap font-black`}>
            {/* Press en Bleu Marine / Cyan lumineux en Dark Mode */}
            <span className="text-[#0f2038] dark:text-sky-400 group-hover:text-[#1e3a66] dark:group-hover:text-sky-300 transition-colors">
              Press
            </span>
            {/* Tonik en Rouge Écarlate Vif */}
            <span className="text-[#ce1126] dark:text-rose-500 group-hover:text-[#e0142c] dark:group-hover:text-rose-400 transition-colors">
              Tonik
            </span>
          </span>

          {/* Badge Ayiti regroupé avec le blason national à côté du titre */}
          {!hideHaitiImage && (
            <span className="flex items-center gap-1 bg-slate-900 border border-slate-800/80 px-1.5 sm:px-2 py-0.5 rounded shadow-inner leading-none shrink-0 select-none">
              <Image
                src="/langfr-400px-Coat_of_arms_of_Haiti.svg.png"
                alt="Drapeau d'Haïti"
                width={selectedSize.img}
                height={selectedSize.img}
                className="object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] shrink-0"
                priority
              />
              <span className={`${selectedSize.badgeText} text-slate-300 font-extrabold tracking-widest uppercase`}>
                AYITI
              </span>
            </span>
          )}
        </div>

        {/* Slogan officiel du logo : L'Actualité Avec Dynamisme */}
        {showSlogan && (
          <span className={`${selectedSize.slogan} text-slate-500 dark:text-slate-400 mt-1 font-semibold tracking-wide leading-none hidden md:block`}>
            L'Actualité Avec Dynamisme
          </span>
        )}
      </div>
    </Link>
  );
}
