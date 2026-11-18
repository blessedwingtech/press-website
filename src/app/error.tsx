'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log de l'erreur dans la console pour le débogage
    console.error('[PressTonik ErrorBoundary]:', error);

    // Détection automatique des erreurs de chunk (mise à jour serveur)
    const errorMsg = error?.message || '';
    if (
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('ChunkLoadError') ||
      errorMsg.includes('Failed to fetch') ||
      errorMsg.includes('removeChild')
    ) {
      const lastReload = sessionStorage.getItem('chunk_reload_ts');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('chunk_reload_ts', now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  const handleReload = () => {
    // Tenter reset() puis rechargement complet si nécessaire
    try {
      reset();
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 w-full">
      <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden space-y-6">
        {/* Lueur subtile en arrière-plan */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-center relative z-10">
          <Logo size="md" hideHaitiImage />
        </div>

        <div className="space-y-2 relative z-10">
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500 dark:text-amber-400 mb-2">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Interruption momentanée
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Une mise à jour récente de la rédaction ou une instabilité passagère du réseau a interrompu l'affichage. Vous pouvez réactualiser la page directement.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 relative z-10">
          <button
            type="button"
            onClick={handleReload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Actualiser la page
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition-all border border-slate-200 dark:border-slate-700"
          >
            <Home className="w-4 h-4" /> Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
