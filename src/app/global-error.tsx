'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[PressTonik GlobalError]:', error);

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

  return (
    <html lang="fr" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 antialiased">
        <div className="max-w-md w-full text-center bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <h1 className="text-xl font-black text-white uppercase tracking-wider">
              PressTonik • Actualisation requise
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Une nouvelle version de la plateforme a été déployée. Cliquez ci-dessous pour recharger l'actualité.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Recharger la page
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
