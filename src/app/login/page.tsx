'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Mail, AlertTriangle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    errorParam === 'banned'
      ? 'Ce compte a été banni par un administrateur.'
      : errorParam === 'CredentialsSignin'
      ? 'Identifiants invalides.'
      : null
  );
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Effet lumineux décoratif */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center">
          <Link href="/" className="text-3xl font-black tracking-widest bg-gradient-to-r from-emerald-450 to-cyan-455 bg-clip-text text-transparent">
            CHRONOS
          </Link>
          <h2 className="mt-4 text-xl font-extrabold text-white">
            Connexion à l'espace membre
          </h2>
          <p className="mt-1.5 text-xs text-slate-400">
            Entrez vos identifiants pour accéder à la rédaction
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/35 p-3 rounded-lg flex items-start gap-2.5 text-xs text-rose-400">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-500" />
            <p>{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-455 uppercase tracking-wider mb-2">
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
              <label htmlFor="password" className="block text-xs font-bold text-slate-455 uppercase tracking-wider mb-2">
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
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-600 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800 text-center space-y-2">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Comptes de test (mot de passe identique : <code className="text-slate-350 bg-slate-950 px-1 py-0.5 rounded font-mono">nom123</code>) :
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono text-slate-400">
            <div className="bg-slate-950 p-1.5 rounded">
              <span className="text-rose-400 block font-bold">Admin</span>
              admin@sports.com
            </div>
            <div className="bg-slate-950 p-1.5 rounded">
              <span className="text-cyan-400 block font-bold">Journaliste</span>
              journalist@sports.com
            </div>
            <div className="bg-slate-950 p-1.5 rounded">
              <span className="text-emerald-400 block font-bold">Lecteur</span>
              reader@sports.com
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
