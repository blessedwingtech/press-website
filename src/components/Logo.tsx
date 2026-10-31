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
      emblemW: 28,
      emblemH: 28,
      img: 13,
      title: 'text-base sm:text-lg',
      slogan: 'text-[8px]',
      gap: 'gap-2 sm:gap-2.5',
      badgeText: 'text-[7px]',
    },
    md: {
      emblemW: 36,
      emblemH: 36,
      img: 16,
      title: 'text-xl sm:text-2xl',
      slogan: 'text-[9px]',
      gap: 'gap-2.5 sm:gap-3',
      badgeText: 'text-[7px] sm:text-[8px]',
    },
    lg: {
      emblemW: 50,
      emblemH: 50,
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
      {/* Plume d'investigation PressTonik adaptative clair / sombre */}
      <div className="shrink-0 relative transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 flex items-center justify-center">
        {/* Version Light Mode : Plume Bleu Marine classique */}
        <Image
          src="/logo-presstonik.svg"
          alt="Emblème Plume PressTonik"
          width={selectedSize.emblemW}
          height={selectedSize.emblemH}
          className="object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)] dark:hidden"
          priority
        />
        {/* Version Dark Mode : Plume Bleu Ciel éclatant (#38bdf8) en accord avec le texte Press */}
        <Image
          src="/logo-presstonik-dark.svg"
          alt="Emblème Plume PressTonik"
          width={selectedSize.emblemW}
          height={selectedSize.emblemH}
          className="object-contain filter drop-shadow-[0_0_8px_rgba(56,189,248,0.45)] hidden dark:block"
          priority
        />
      </div>

      {/* Identité textuelle PressTonik */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
          <span className={`${selectedSize.title} font-serif tracking-tight whitespace-nowrap font-black`}>
            {/* Press : Bleu Marine en clair / Bleu Ciel éclatant en sombre */}
            <span className="text-[#0f2038] dark:text-sky-400 group-hover:text-[#1e3a66] dark:group-hover:text-sky-300 transition-colors">
              Press
            </span>
            {/* Tonik : Rouge Écarlate Vif */}
            <span className="text-[#ce1126] dark:text-rose-500 group-hover:text-[#e0142c] dark:group-hover:text-rose-400 transition-colors">
              Tonik
            </span>
          </span>

          {/* Badge Ayiti */}
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

        {/* Slogan officiel du logo */}
        {showSlogan && (
          <span className={`${selectedSize.slogan} text-slate-500 dark:text-slate-400 mt-1 font-semibold tracking-wide leading-none hidden md:block`}>
            L'Actualité Avec Dynamisme
          </span>
        )}
      </div>
    </Link>
  );
}
