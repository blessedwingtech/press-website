'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import Logo from '@/components/Logo';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Gestionnaire d'erreurs de segment de route avec auto-résolution silencieuse.
 * En cas de mise à jour du bundle après déploiement, l'application recharge
 * automatiquement la page de façon transparente sans interrompre l'utilisateur.
 */
export default function ErrorBoundary({ error, reset }: ErrorProps) {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    console.error('[PressTonik ErrorBoundary Auto-Recovery]:', error);

    const errorMsg = error?.message || '';
    const isChunk =
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('ChunkLoadError') ||
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('Loading CSS chunk');

    if (isChunk) {
      // Rechargement immédiat et automatique des nouveaux assets
      window.location.reload();
      return;
    }

    // Auto-tentative de réinitialisation sans intervention utilisateur
    try {
      const attempts = parseInt(sessionStorage.getItem('pt_route_rec') || '0', 10);
      if (attempts < 1) {
        sessionStorage.setItem('pt_route_rec', '1');
        reset();
      } else {
        sessionStorage.removeItem('pt_route_rec');
        setShowFallback(true);
      }
    } catch {
      window.location.reload();
    }
  }, [error, reset]);

  // Pendant l'auto-récupération instantanée, on affiche un spinner discret plutôt qu'un message d'erreur
  if (!showFallback) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chargement en cours...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 w-full">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex justify-center relative z-10">
          <Logo size="md" hideHaitiImage />
        </div>

        <div className="space-y-2 relative z-10">
          <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Page momentanément indisponible
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Le contenu demandé n'a pas pu être chargé. Vous pouvez retourner à la une pour poursuivre votre lecture.
          </p>
        </div>

        <div className="pt-2 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Home className="w-4 h-4" /> Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
