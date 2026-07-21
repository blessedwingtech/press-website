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
      quill: 'w-4.5 h-4.5',
      img: 14,
      title: 'text-lg',
      slogan: 'text-[8px]',
      gap: 'space-x-2',
      badgeText: 'text-[7px]',
    },
    md: {
      quill: 'w-6 h-6',
      img: 18,
      title: 'text-2xl',
      slogan: 'text-[9px]',
      gap: 'space-x-3',
      badgeText: 'text-[8px]',
    },
    lg: {
      quill: 'w-9 h-9',
      img: 22,
      title: 'text-3xl',
      slogan: 'text-[11px]',
      gap: 'space-x-4',
      badgeText: 'text-[9px]',
    },
  };

  const selectedSize = sizeClasses[size];

  return (
    <Link href="/" className={`flex items-center ${selectedSize.gap} group select-none`}>
      {/* Crayon de rédaction PenTool incliné comme s'il écrivait */}
      <div className="shrink-0 relative bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 shadow-md group-hover:border-teal-500/50 transition-all duration-300">
        <PenTool
          className={`${selectedSize.quill} text-teal-400 -rotate-45 group-hover:-rotate-30 transition-transform duration-300 shrink-0`}
        />
      </div>

      {/* Identité textuelle */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2 leading-none">
          <span className={`${selectedSize.title} font-black tracking-wider`}>
            <span className="text-teal-400 group-hover:text-teal-300 transition-colors">Press</span>
            <span className="text-amber-400 group-hover:text-amber-300 transition-colors">Tonik</span>
          </span>

          {/* Badge Ayiti regroupé avec le blason national à côté du titre */}
          {!hideHaitiImage && (
            <span className="flex items-center gap-1.5 bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded shadow-inner leading-none shrink-0 select-none">
              <Image
                src="/langfr-400px-Coat_of_arms_of_Haiti.svg.png"
                alt="Drapeau d'Haïti"
                width={selectedSize.img}
                height={selectedSize.img}
                className="object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
                priority
              />
              <span className={`${selectedSize.badgeText} text-slate-300 font-extrabold tracking-widest uppercase`}>
                AYITI
              </span>
            </span>
          )}
        </div>
        {showSlogan && (
          <span className={`${selectedSize.slogan} text-slate-400 mt-1.5 font-medium tracking-wide leading-none`}>
            Le portail haïtien d'information libre et d'accès numérique.
          </span>
        )}
      </div>
    </Link>
  );
}
