'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Une erreur est survenue.');
      }
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-2xl shadow-2xl">
        <div>
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
          <h2 className="mt-4 text-2xl font-extrabold text-white">Mot de passe oublié ?</h2>
          <p className="mt-1.5 text-sm text-slate-400">
            Entrez votre adresse email et nous vous enverrons un lien pour le réinitialiser.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/35 p-4 rounded-lg flex items-start gap-3 text-emerald-400">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Email envoyé !</p>
              <p className="text-xs text-slate-400 mt-1">
                Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation sous peu.
                (En développement, consultez les logs de votre terminal.)
              </p>
            </div>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="nom@example.com"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/35 p-3 rounded-lg text-xs text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...
                </>
              ) : (
                'Envoyer le lien'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
