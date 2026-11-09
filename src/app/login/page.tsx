'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Mail, AlertTriangle, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import Logo from '@/components/Logo';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const isGooglePending = searchParams.get('google_pending') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    errorParam === 'banned'
      ? 'Ce compte a été banni par un administrateur.'
      : errorParam === 'CredentialsSignin'
      ? 'Identifiants invalides.'
      : errorParam === 'AccessDenied'
      ? 'Accès refusé. Veuillez contacter un administrateur.'
      : null
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error === 'CredentialsSignin' ? 'Email ou mot de passe incorrect.' : res.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (err: any) {
      setError("Une erreur s'est produite lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    setError(null);
    signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-6 bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden">

        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" hideHaitiImage />
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Connexion à l'espace membre
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Accédez à la rédaction et aux fonctionnalités exclusives
          </p>
        </div>

        {/* Message en attente de validation Google */}
        {isGooglePending && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-start gap-3 text-xs text-emerald-300">
            <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-400" />
            <div>
              <p className="font-bold text-emerald-200 mb-1">Demande Google reçue !</p>
              <p className="leading-relaxed text-emerald-300/90">
                Votre demande d'accès a été enregistrée avec succès. Elle est actuellement en attente de validation par un administrateur.
              </p>
              <p className="mt-2 text-[11px] text-emerald-400/80">
                Dès validation de votre compte, vous pourrez vous connecter directement ici en un clic avec votre compte Google.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/35 p-3 rounded-lg flex items-start gap-2.5 text-xs text-rose-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-500" />
            <p>{error}</p>
          </div>
        )}

        {/* Bouton Continuer avec Google */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition duration-150 disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.99]"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <GoogleIcon className="w-4 h-4" />
            )}
            <span>Continuer avec Google</span>
          </button>
        </div>

        {/* Séparateur */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
              ou avec email
            </span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="nom@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="text-center mt-4 flex flex-col gap-2">
          <Link href="/request-account" className="text-sm text-emerald-400 hover:text-emerald-300 transition font-bold">
            Demander un compte PressTonik
          </Link>
          <Link href="/forgot-password" className="text-xs text-slate-400 hover:text-slate-300 transition">
            Mot de passe oublié ?
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-slate-950 text-slate-400">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  );
}
