'use client';

import { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  Newspaper,
  Zap,
  BookOpen,
  ShoppingBag,
  Cloud,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';

interface BwtApp {
  id: string;
  name: string;
  subtitle: string;
  url: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  isCurrent?: boolean;
}

const BWT_APPS: BwtApp[] = [
  {
    id: 'press',
    name: 'PressTonik',
    subtitle: 'Presse & Enquêtes',
    url: 'https://press.bittonik.com',
    icon: Newspaper,
    color: 'text-emerald-500 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    isCurrent: true,
  },
  {
    id: 'biblio',
    name: 'BiblioTonik',
    subtitle: 'Bibliothèque & Savoirs',
    url: 'https://biblio.bittonik.com',
    icon: BookOpen,
    color: 'text-indigo-500 dark:text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  {
    id: 'bit',
    name: 'BitTonik',
    subtitle: 'Réseau Social & Challenges',
    url: 'https://bittonik.com',
    icon: Zap,
    color: 'text-cyan-500 dark:text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  {
    id: 'shop',
    name: 'ShopTonik',
    subtitle: 'Boutique & E-commerce',
    url: 'https://shop.bittonik.com',
    icon: ShoppingBag,
    color: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    id: 'memo',
    name: 'MemoTonik',
    subtitle: 'Cloud & Souvenirs',
    url: 'https://memo.bittonik.com',
    icon: Cloud,
    color: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
];

export default function BwtEcosystemSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fermer le menu lors d'un clic à l'extérieur ou touche Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      {/* Bouton grille 9 points BWT */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Applications et Écosystème BWT"
        title="Écosystème BWT (BitTonik, BiblioTonik, ShopTonik, MemoTonik)"
        className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
          isOpen
            ? 'bg-slate-200 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border-slate-300 dark:border-slate-700'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>

      {/*
        Menu Popover Ultra-Responsif :
        - Sur mobile (< 640px) : centré dans l'écran via inset-x-3 et position fixe pour ne jamais déborder hors de l'écran.
        - Sur tablette / PC (>= 640px) : ancré à droite du bouton (sm:absolute sm:right-0 sm:w-80).
      */}
      {isOpen && (
        <div className="fixed sm:absolute top-16 sm:top-full inset-x-3 sm:inset-x-auto sm:right-0 mt-2 sm:w-80 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ring-1 ring-black/10 z-50 overflow-hidden p-3 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
          {/* En-tête */}
          <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Écosystème BWT
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Blessed Wing Technology
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Passerelle
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="sm:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grille des applications */}
          <div className="space-y-1">
            {BWT_APPS.map((app) => {
              const IconComponent = app.icon;
              return (
                <a
                  key={app.id}
                  href={app.url}
                  target={app.isCurrent ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all group ${
                    app.isCurrent
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${app.bgColor} ${app.borderColor} ${app.color}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                        {app.name}
                        {app.isCurrent && (
                          <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-1 py-0.2 rounded shrink-0">
                            Actuel
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {app.subtitle}
                      </p>
                    </div>
                  </div>
                  {!app.isCurrent && (
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
                  )}
                </a>
              );
            })}
          </div>

          {/* Pied de page du menu */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <a
              href="https://bwt.bittonik.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
            >
              Portail central BWT <ChevronRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
