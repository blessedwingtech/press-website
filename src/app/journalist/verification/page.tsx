import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  BookmarkCheck,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Award className="w-3.5 h-3.5" /> Programme de Crédibilité & Notoriété
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Certification du Journaliste
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Obtenez le badge officiel de Journaliste / Enquêteur vérifié pour attester de la fiabilité et de la déontologie de vos publications.
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
              <p className="text-xs text-slate-600 dark:text-slate-350">
                Félicitations ! Votre profil et votre expertise ont été certifiés par le comité éditorial PressTonik.
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
              <span className="text-slate-500 text-[11px]">Reconnaissance officielle de votre plume</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Statut : Rédacteur Standard (Non Certifié)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  La certification est facultative au départ et n&apos;empêche pas la publication d&apos;articles.
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
              <BookmarkCheck className="w-4 h-4 text-amber-500" /> Les Avantages du Badge Vérifié
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-350">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <strong className="text-slate-900 dark:text-white block font-semibold">Crédibilité & Confiance Renforcée</strong>
                <p className="text-[11px] leading-relaxed">
                  Les lecteurs identifient immédiatement que vos enquêtes respectent les standards déontologiques de la presse.
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <strong className="text-slate-900 dark:text-white block font-semibold">Visibilité accrue des publications</strong>
                <p className="text-[11px] leading-relaxed">
                  Vos analyses sont mises en valeur dans les sections recommandées et dans la newsletter des abonnés.
                </p>
              </div>
            </div>
          </div>

          {/* Feuille de route / Formulaire d'évaluation */}
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-amber-500" /> Formulaire d&apos;Accréditation & Examen de Notoriété
            </div>
            <p className="text-xs text-amber-950 dark:text-amber-200/90 leading-relaxed">
              Le questionnaire d&apos;évaluation journalistique est en cours d&apos;intégration finale par la direction de la rédaction. Il permettra de renseigner vos justificatifs professionnels (carte de presse, diplômes, affiliation, travaux majeurs) et de valider les règles de déontologie.
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
              Dès l&apos;ouverture officielle du formulaire, un bouton d&apos;examen interactif sera disponible sur cet écran pour soumettre votre dossier en 1 clic.
            </p>
          </div>

          {/* Lien vers rédaction */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href="/journalist/articles/new"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm"
            >
              <FileCheck className="w-4 h-4" /> Rédiger un nouvel article
            </Link>
            <Link
              href="/journalist"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              Consulter mes articles publiés
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
