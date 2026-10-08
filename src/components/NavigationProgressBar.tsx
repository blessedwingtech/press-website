'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fin du chargement quand la route change
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Interception des clics sur les liens <a> pour déclencher l'animation immédiatement
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignorer les liens externes, les ancres locales, ou les nouvelles fenêtres
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        targetAttr === '_blank' ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return;
      }

      // Si c'est un lien interne vers une autre page
      const currentUrl = window.location.pathname + window.location.search;
      if (href !== currentUrl) {
        setIsNavigating(true);
        setProgress(30);

        // Simulation de progression naturelle
        setTimeout(() => setProgress(70), 200);
        setTimeout(() => setProgress(85), 600);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 sm:h-1 z-[99999] pointer-events-none overflow-hidden bg-slate-900/30">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
