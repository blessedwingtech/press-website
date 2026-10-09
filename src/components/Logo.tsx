import Link from 'next/link';
import Image from 'next/image';
import { PenTool } from 'lucide-react';

interface LogoProps {
  showSlogan?: boolean;
  size?: 'sm' | 'md' | 'lg';
  hideHaitiImage?: boolean;
}

export default function Logo({ showSlogan = true, size = 'md', hideHaitiImage = false }: LogoProps) {
  const sizeClasses = {
    sm: {
      quill: 'w-4 h-4',
      img: 13,
      title: 'text-base sm:text-lg',
      slogan: 'text-[8px]',
      gap: 'gap-1.5 sm:gap-2',
      badgeText: 'text-[7px]',
    },
    md: {
      quill: 'w-5 h-5 sm:w-6 sm:h-6',
      img: 16,
      title: 'text-xl sm:text-2xl',
      slogan: 'text-[9px]',
      gap: 'gap-2 sm:gap-3',
      badgeText: 'text-[7px] sm:text-[8px]',
    },
    lg: {
      quill: 'w-7 h-7 sm:w-9 sm:h-9',
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
      {/* Crayon de rédaction PenTool incliné comme s'il écrivait */}
      <div className="shrink-0 relative bg-slate-900/60 p-2 sm:p-2.5 rounded-xl border border-slate-800 shadow-md group-hover:border-teal-500/50 transition-all duration-300">
        <PenTool
          className={`${selectedSize.quill} text-teal-400 -rotate-45 group-hover:-rotate-30 transition-transform duration-300 shrink-0`}
        />
      </div>

      {/* Identité textuelle */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 leading-none">
          <span className={`${selectedSize.title} font-black tracking-wider whitespace-nowrap`}>
            <span className="text-teal-400 group-hover:text-teal-300 transition-colors">Press</span>
            <span className="text-amber-400 group-hover:text-amber-300 transition-colors">Tonik</span>
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
        {showSlogan && (
          <span className={`${selectedSize.slogan} text-slate-400 mt-1 sm:mt-1.5 font-medium tracking-wide leading-none hidden md:block`}>
            Le portail haïtien d'information libre et d'accès numérique.
          </span>
        )}
      </div>
    </Link>
  );
}
