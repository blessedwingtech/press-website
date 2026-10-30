'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, Loader2 } from 'lucide-react';
import { savePushSubscriptionAction, unsubscribePushAction } from '@/app/actions/push';

interface PushNotificationToggleProps {
  authorId?: string | null;
  authorName?: string;
  className?: string;
}

// Helper pour convertir la clé VAPID base64 en Uint8Array pour le navigateur
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationToggle({
  authorId,
  authorName,
  className = '',
}: PushNotificationToggleProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(Boolean(sub));
        });
      });
    }
  }, []);

  const handleTogglePush = async () => {
    if (!isSupported) return;
    setIsLoading(true);
    setFeedback(null);

    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      if (isSubscribed) {
        // Désabonnement
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await unsubscribePushAction(sub.endpoint);
        }
        setIsSubscribed(false);
        setFeedback('Notifications push désactivées.');
      } else {
        // Demande d'autorisation & Abonnement
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setFeedback('Veuillez autoriser les notifications dans votre navigateur.');
          setIsLoading(false);
          return;
        }

        const vapidPublicKey =
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
          'BJdKJkngqy5Fx3NaXjv8HkCWfLyf92F9CMre7uETRbYh46g79nkZeEHIPhH3JUjnA_PNXw6PI_PAmOHox0x37Ks';

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        const subJson = sub.toJSON();
        const p256dh = subJson.keys?.p256dh;
        const auth = subJson.keys?.auth;

        if (sub.endpoint && p256dh && auth) {
          const res = await savePushSubscriptionAction({
            endpoint: sub.endpoint,
            p256dh,
            auth,
            authorId: authorId || null,
          });

          if (res.success) {
            setIsSubscribed(true);
            setFeedback('Alertes push activées avec succès ! 🔔');
          } else {
            setFeedback('Erreur lors de l\'activation des alertes.');
          }
        }
      }
    } catch (err: any) {
      console.error('Erreur Push :', err);
      setFeedback('Action impossible sur cet appareil.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) return null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleTogglePush}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
          isSubscribed
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isSubscribed ? (
          <BellRing className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
        ) : (
          <Bell className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span>
          {isSubscribed
            ? `Notifications Push Actives sur cet appareil`
            : authorName
            ? `Activer les alertes push pour ${authorName}`
            : `Activer les notifications push sur mobile/PC`}
        </span>
      </button>

      {feedback && (
        <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 font-medium">
          {feedback}
        </p>
      )}
    </div>
  );
}
