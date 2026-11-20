'use client';

import { useEffect } from 'react';

/**
 * Gestionnaire de résilience après déploiement et protection DOM.
 * 1. Empêche Google AdSense et les extensions tierces de faire crasher React via "removeChild" / "insertBefore".
 * 2. Détecte les réelles erreurs de ChunkLoadError (après un build serveur) et recharge automatiquement et silencieusement.
 */
export default function ChunkErrorHandler() {
  useEffect(() => {
    // 1. Protection anti-crash pour Google AdSense et scripts tiers
    if (typeof window !== 'undefined' && typeof Node !== 'undefined') {
      const origRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function <T extends Node>(child: T): T {
        if (child && child.parentNode !== this) {
          return child;
        }
        return origRemoveChild.apply(this, [child]) as T;
      };

      const origInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function <T extends Node>(newNode: T, refNode: Node | null): T {
        if (refNode && refNode.parentNode !== this) {
          return newNode;
        }
        return origInsertBefore.apply(this, [newNode, refNode]) as T;
      };
    }

    // 2. Détection ciblée des vraies erreurs de chunks de déploiement
    const handleChunkError = (rawMessage: string) => {
      if (!rawMessage) return;
      const msg = String(rawMessage);

      const isRealChunkError =
        msg.includes('Loading chunk') ||
        msg.includes('ChunkLoadError') ||
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Loading CSS chunk');

      if (isRealChunkError) {
        const lastReload = sessionStorage.getItem('pt_chunk_ts');
        const now = Date.now();

        // Limite à un rechargement automatique toutes les 15 secondes pour éviter toute boucle
        if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
          sessionStorage.setItem('pt_chunk_ts', now.toString());
          console.warn('[PressTonik] Nouvelle version déployée. Rechargement transparent...');
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
