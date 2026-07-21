import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export default function AccountRequestConfirmedPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden text-center">
        {/* Glow effects */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center">
          <div className="p-3 bg-teal-500/10 rounded-full text-teal-400 border border-teal-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Email Confirmé !
          </h1>
          <p className="text-sm text-slate-350 leading-relaxed">
            Votre adresse e-mail a été validée avec succès.
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl text-left space-y-3 text-xs sm:text-sm text-slate-300">
          <div className="flex gap-2.5 items-start">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Votre demande de compte a été soumise avec succès aux administrateurs de la rédaction.
            </p>
          </div>
          <div className="flex gap-2.5 items-start">
            <Mail className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <p>
              Vous recevrez un e-mail à votre adresse dès que votre compte aura été approuvé ou rejeté.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="w-full flex justify-center items-center gap-1.5 py-3 px-4 rounded-xl text-sm font-bold bg-teal-500 hover:bg-teal-600 text-white transition-all shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20"
          >
            Retourner à l'accueil <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
