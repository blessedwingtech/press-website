import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import {
  Award,
  ShieldCheck,
  FileCheck,
  Sparkles,
  BookmarkCheck,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import VerificationForm from './VerificationForm';

export const revalidate = 0;

export default async function JournalistVerificationPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    redirect('/login');
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect('/login');
  }

  const isVerified = (user as any).isVerified === true;
  const verifiedAt = (user as any).verifiedAt as Date | null;

  // Récupérer une demande en attente éventuelle
  const pendingRequest = await db.verificationRequest.findFirst({
    where: {
      userId: user.id,
      status: 'PENDING'
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Award className="w-3.5 h-3.5" /> Programme de Crédibilité & Déontologie
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Accréditation & Badge Journaliste Vérifié
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Obtenez le badge officiel de Journaliste / Enquêteur vérifié pour certifier la fiabilité de vos travaux et renforcer la confiance de votre lectorat.
        </p>
      </div>

      {/* État actuel de certification */}
      {isVerified ? (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                  Compte Journaliste Vérifié & Certifié
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Actif
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Félicitations ! Votre profil et votre signature ont été certifiés conformes à la Charte Déontologique PressTonik.
                {verifiedAt && ` (Vérifié le ${new Date(verifiedAt).toLocaleDateString('fr-FR')})`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-emerald-500/20 text-xs">
            <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block">Badge de Notoriété</span>
              <span className="text-slate-500 text-[11px]">Affiché sur tous vos articles et profil public</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block">Distribution Prioritaire</span>
              <span className="text-slate-500 text-[11px]">Indexation à la Une et flux RSS recommandés</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block">Accréditation Presse</span>
              <span className="text-slate-500 text-[11px]">Reconnaissance officielle de votre rigueur</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/journalist/articles/new"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm"
            >
              <FileCheck className="w-4 h-4" /> Rédiger un nouvel article
            </Link>
            <Link
              href="/journalist"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              Tableau de bord
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bannière explicative */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Statut : Rédacteur Indépendant (Non Certifié)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    L&apos;accréditation est facultative : vous pouvez publier librement vos articles sans être certifié.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Optionnel
              </span>
            </div>

            {/* Pourquoi se faire certifier ? */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-amber-500" /> Pourquoi demander le badge vérifié ?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-350">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white block font-semibold">Crédibilité & Confiance</strong>
                  <p className="text-[11px] leading-relaxed">
                    Les lecteurs savent que votre identité professionnelle et votre démarche ont été examinées et validées.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <strong className="text-slate-900 dark:text-white block font-semibold">Garantie Déontologique</strong>
                  <p className="text-[11px] leading-relaxed">
                    Engagement solennel sur le respect des faits, la vérification des sources et la transparence éditoriale.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de candidature */}
          <VerificationForm hasPendingApplication={!!pendingRequest} />
        </div>
      )}
    </div>
  );
}
