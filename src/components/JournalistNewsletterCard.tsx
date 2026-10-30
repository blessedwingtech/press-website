'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import { Mail, Check, Bell, Sparkles, MessageCircle, ArrowRight, Loader2 } from 'lucide-react';
import { subscribeToNewsletterAction } from '@/app/actions/newsletter';
import PushNotificationToggle from '@/components/PushNotificationToggle';

interface JournalistNewsletterCardProps {
  authorId?: string | null;
  authorName?: string;
  authorAvatar?: string | null;
  authorBio?: string | null;
  whatsappChannel?: string | null;
  variant?: 'compact' | 'full';
  className?: string;
}

export default function JournalistNewsletterCard({
  authorId,
  authorName,
  authorAvatar,
  authorBio,
  whatsappChannel,
  variant = 'full',
  className = '',
}: JournalistNewsletterCardProps) {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'INSTANT' | 'WEEKLY'>('WEEKLY');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const isAuthor = Boolean(authorName && authorName !== 'PressTonik');
  const displayName = authorName || 'PressTonik';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setFeedbackMessage('Veuillez entrer une adresse email valide.');
      return;
    }

    setStatus('idle');
    setFeedbackMessage('');

    startTransition(async () => {
      const res = await subscribeToNewsletterAction({
        email,
        authorId: authorId || null,
        frequency,
      });

      if (res.success) {
        setStatus('success');
        setFeedbackMessage(res.message || 'Merci ! Vous recevrez nos prochaines publications.');
        setEmail('');
      } else {
        setStatus('error');
        setFeedbackMessage(res.error || 'Une erreur est survenue.');
      }
    });
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 shadow-lg shadow-slate-200/50 dark:shadow-black/40 ${className}`}
    >
      {/* Decorative gradient blur */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header section */}
      <div className="flex items-start gap-3.5 mb-4 relative z-10">
        {isAuthor && authorAvatar ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-emerald-500/30">
            <Image
              src={authorAvatar}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <Mail className="w-6 h-6" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60">
              <Sparkles className="w-2.5 h-2.5" />
              {isAuthor ? 'Newsletter de la rédaction' : 'Lettre d\'information'}
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-snug">
            {isAuthor ? `Suivre les écrits de ${displayName}` : 'Recevez les enquêtes PressTonik'}
          </h3>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed relative z-10">
        {isAuthor
          ? (authorBio ? authorBio.slice(0, 140) + '...' : `Soyez notifié en exclusivité dès que ${displayName} publie une nouvelle enquête ou analyse décryptée.`)
          : 'Recevez nos grands dossiers, enquêtes exclusives et analyses géopolitiques sans spam.'}
      </p>

      {/* Form or Success State */}
      {status === 'success' ? (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div className="text-xs leading-relaxed">
            <strong className="block font-bold text-sm mb-0.5 text-emerald-950 dark:text-emerald-100">Inscription validée !</strong>
            {feedbackMessage}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
          {/* Frequency selection toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] font-medium border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setFrequency('WEEKLY')}
              className={`py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                frequency === 'WEEKLY'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Hebdomadaire
            </button>
            <button
              type="button"
              onClick={() => setFrequency('INSTANT')}
              className={`py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                frequency === 'INSTANT'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bell className="w-3 h-3 text-amber-500" />
              Instantané
            </button>
          </div>

          {/* Email input + submit button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                disabled={isPending}
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Inscription...
                </>
              ) : (
                <>
                  S'abonner
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {status === 'error' && (
            <p className="text-[11px] text-rose-500 font-semibold">{feedbackMessage}</p>
          )}

          <p className="text-[10px] text-slate-500 dark:text-slate-500 text-center">
            🔒 Sans spam. Désinscription possible en 1 clic à tout moment.
          </p>
        </form>
      )}

      {/* Push Notification Toggle */}
      <div className="mt-3 relative z-10">
        <PushNotificationToggle
          authorId={authorId}
          authorName={isAuthor ? displayName : undefined}
        />
      </div>

      {/* WhatsApp Community button if journalist provided one */}
      {whatsappChannel && (
        <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 relative z-10">
          <a
            href={whatsappChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
            Canal WhatsApp de {displayName}
          </a>
        </div>
      )}
    </div>
  );
}
