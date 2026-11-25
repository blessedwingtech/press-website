import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Mail, ArrowRight, AlertTriangle, KeyRound, Sparkles, LogIn } from 'lucide-react';

interface Props {
  searchParams?: Promise<{ type?: string }> | { type?: string };
}

export default async function AccountRequestConfirmedPage({ searchParams }: Props) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : undefined;
  const isInstant = resolvedParams?.type === 'instant';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 rounded-2xl shadow-xl dark:shadow-2xl relative overflow-hidden text-center">
        {/* Glow effects */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center">
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {isInstant ? <Sparkles className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">
            {isInstant ? 'Compte Activé !' : 'Email Confirmé !'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">
            {isInstant
              ? 'Votre adresse e-mail a été validée et votre compte Lecteur a été activé instantanément.'
              : 'Votre adresse e-mail a été validée avec succès.'}
          </p>
        </div>

        {isInstant ? (
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-5 rounded-xl text-left space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="flex gap-2.5 items-start">
              <KeyRound className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Identifiants envoyés :</strong> Votre mot de passe temporaire vient de vous être expédié par e-mail.
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <p>
                Vous pouvez désormais vous connecter immédiatement pour commenter, interagir et enregistrer vos articles favoris.
              </p>
            </div>
            <div className="flex gap-2.5 items-start bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 p-3 rounded-lg text-amber-900 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                <strong>Conseil messagerie :</strong> Si l&apos;e-mail de bienvenue n&apos;apparaît pas dans votre boîte de réception, vérifiez votre dossier <em>Courriers indésirables / Spams</em>.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-5 rounded-xl text-left space-y-3.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                Votre dossier de candidature Rédacteur a été transmis aux administrateurs de la rédaction.
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <Mail className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <p>
                Vous recevrez une notification par e-mail dès que votre accès de publication aura été validé.
              </p>
            </div>
            <div className="flex gap-2.5 items-start bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 p-3 rounded-lg text-amber-900 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                <strong>Conseil messagerie :</strong> Pensez à vérifier vos spams ou courriers indésirables si vous ne trouvez pas notre notification dans votre boîte principale.
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col gap-2.5">
          {isInstant ? (
            <Link
              href="/login"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg"
            >
              <LogIn className="w-4 h-4" /> Se connecter maintenant
            </Link>
          ) : (
            <Link
              href="/"
              className="w-full flex justify-center items-center gap-1.5 py-3 px-4 rounded-xl text-sm font-bold bg-teal-500 hover:bg-teal-600 text-white transition-all shadow-lg"
            >
              Retourner à l&apos;accueil <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
