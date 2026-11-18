'use client';

import { useEffect } from 'react';

/**
 * Gestionnaire d'auto-récupération des erreurs de chunks après déploiement.
 * Lorsqu'un nouveau build est déployé sur le serveur, les anciens chunks JS sont supprimés.
 * Les utilisateurs mobiles ayant gardé un onglet ouvert déclenchent un ChunkLoadError lors
 * de la navigation vers un article. Ce composant intercepte l'erreur avant le crash et recharge
 * automatiquement la page avec les nouveaux fichiers sans perturber l'expérience utilisateur.
 */
export default function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (rawMessage: string) => {
      if (!rawMessage) return;
      const msg = String(rawMessage);

      const isChunkError =
        msg.includes('Loading chunk') ||
        msg.includes('ChunkLoadError') ||
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Loading CSS chunk') ||
        msg.includes('removeChild');

      if (isChunkError) {
        const lastReload = sessionStorage.getItem('chunk_reload_ts');
        const now = Date.now();

        // Limite à un rechargement automatique toutes les 10 secondes pour éviter les boucles
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem('chunk_reload_ts', now.toString());
          console.warn('[PressTonik] Mise à jour d’application détectée. Actualisation automatique de la page...');
          window.location.reload();
        }
      }
    };

    const onError = (event: ErrorEvent) => {
      if (event?.message) {
        handleChunkError(event.message);
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const message =
        typeof reason === 'string'
          ? reason
          : reason?.message || (typeof reason === 'object' && reason ? JSON.stringify(reason) : '');
      handleChunkError(message);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
