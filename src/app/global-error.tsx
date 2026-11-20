'use client';

import { useEffect, useState } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [isChunkError, setIsChunkError] = useState(false);

  useEffect(() => {
    console.error('[PressTonik GlobalError]:', error);

    const errorMsg = error?.message || '';
    const isChunk =
      errorMsg.includes('Loading chunk') ||
      errorMsg.includes('ChunkLoadError') ||
      errorMsg.includes('Failed to fetch dynamically imported module') ||
      errorMsg.includes('Loading CSS chunk');

    if (isChunk) {
      setIsChunkError(true);
      const lastReload = sessionStorage.getItem('chunk_reload_ts');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
        sessionStorage.setItem('chunk_reload_ts', now.toString());
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html lang="fr" className="dark">
      <head>
        <title>PressTonik | Interruption momentanée</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 1rem;
            background-color: #020617;
            color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background-color: #0f172a;
            border: 1px solid #1e293b;
            border-radius: 1.25rem;
            padding: 2.5rem 2rem;
            max-width: 440px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
          }
          .icon-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            border-radius: 9999px;
            background: rgba(16, 185, 129, 0.12);
            color: #10b981;
            margin-bottom: 1rem;
          }
          .title {
            font-size: 1.25rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0 0 0.5rem 0;
            color: #ffffff;
          }
          .text {
            font-size: 0.875rem;
            color: #94a3b8;
            line-height: 1.6;
            margin: 0 0 1.75rem 0;
          }
          .btn-group {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          .btn {
            background-color: #10b981;
            color: #020617;
            font-weight: 800;
            font-size: 0.8125rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .btn:hover {
            background-color: #34d399;
            transform: translateY(-1px);
          }
          .btn-secondary {
            background-color: #1e293b;
            color: #e2e8f0;
            border: 1px solid #334155;
          }
          .btn-secondary:hover {
            background-color: #334155;
            color: #ffffff;
          }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="icon-box">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </div>
          <h1 className="title">
            {isChunkError ? 'PressTonik • Mise à jour' : 'PressTonik • Interruption'}
          </h1>
          <p className="text">
            {isChunkError
              ? 'Une nouvelle version de la plateforme a été déployée. Cliquez ci-dessous pour charger les dernières actualités.'
              : 'Une interruption temporaire est survenue. Veuillez rafraîchir pour poursuivre votre lecture.'}
          </p>
          <div className="btn-group">
            <button
              type="button"
              className="btn"
              onClick={() => {
                try {
                  reset();
                } catch {
                  window.location.reload();
                }
              }}
            >
              Rafraîchir
            </button>
            <a href="/" className="btn btn-secondary">
              Accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
