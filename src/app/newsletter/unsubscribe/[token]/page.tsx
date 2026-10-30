import React from 'react';
import Link from 'next/link';
import { unsubscribeNewsletterAction } from '@/app/actions/newsletter';
import { MailX, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Désinscription Newsletter | PressTonik',
  description: 'Gérer vos préférences d\'abonnement à la newsletter PressTonik.',
  robots: {
    index: false,
    follow: false,
  },
};

interface UnsubscribePageProps {
  params: {
    token: string;
  };
}

export default async function UnsubscribePage({ params }: UnsubscribePageProps) {
  const result = await unsubscribeNewsletterAction(params.token);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center">
        {result.success ? (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Désinscription confirmée
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              {result.message}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-8">
              Vous ne recevrez plus d'alertes par email pour cette publication. Si vous changez d'avis, vous pouvez vous réinscrire à tout moment depuis la page de l'auteur.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Lien introuvable
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              {result.error || 'Ce lien de désinscription est invalide ou votre adresse email a déjà été retirée.'}
            </p>
          </>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white dark:text-slate-950 font-bold text-sm transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <Link
            href="/latest"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all"
          >
            Découvrir d'autres articles
          </Link>
        </div>
      </div>
    </div>
  );
}
