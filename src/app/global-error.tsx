'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Récupération globale 100% automatique et transparente.
 * L'utilisateur ne doit JAMAIS avoir à cliquer manuellement pour rafraîchir.
 * Le script s'exécute instantanément en arrière-plan pour recharger la page
 * avec les nouveaux assets sans interrompre l'expérience de lecture.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[PressTonik Global Auto-Recovery]:', error);

    try {
      const attempts = parseInt(sessionStorage.getItem('pt_auto_rec') || '0', 10);
      if (attempts < 2) {
        sessionStorage.setItem('pt_auto_rec', (attempts + 1).toString());
        window.location.reload();
      } else {
        sessionStorage.removeItem('pt_auto_rec');
        window.location.replace('/');
      }
    } catch {
      window.location.reload();
    }
  }, [error, reset]);

  return (
    <html lang="fr" className="dark">
      <head>
        <title>PressTonik</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var att = parseInt(sessionStorage.getItem('pt_auto_rec') || '0', 10);
                if (att < 2) {
                  sessionStorage.setItem('pt_auto_rec', (att + 1).toString());
                  window.location.reload();
                } else {
                  sessionStorage.removeItem('pt_auto_rec');
                  window.location.replace('/');
                }
              } catch(e) {
                window.location.reload();
              }
            `,
          }}
        />
        <style>{`
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background-color: #020617;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #94a3b8;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .spinner {
            width: 36px;
            height: 36px;
            border: 3px solid rgba(16, 185, 129, 0.2);
            border-top-color: #10b981;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 14px auto;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .text {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: #cbd5e1;
          }
        `}</style>
      </head>
      <body>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" />
          <div className="text">Chargement en cours...</div>
        </div>
      </body>
    </html>
  );
}
