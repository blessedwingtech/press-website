'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Logo from '@/components/Logo';
import { submitAccountRequest } from './actions';
import {
  User,
  Mail,
  UserCheck,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FilePlus,
  PenTool
} from 'lucide-react';

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

export default function RequestAccountPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('reader');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  // Upload and loading states
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // File Upload Handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('La photo de profil est trop volumineuse (limite 5 Mo maximum).');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/request-account/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Échec du téléversement.');
      }

      const data = await res.json();
      setProfilePhoto(data.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Impossible de téléverser la photo.');
    } finally {
      setUploading(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !email || !role) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitAccountRequest({
        name,
        username,
        email,
        role,
        profilePhoto,
      });

      if (!res.success) {
        setError(res.error || 'Une erreur est survenue.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error(err);
      setError('Une erreur réseau est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-2xl shadow-2xl relative overflow-hidden text-center">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex justify-center">
            <div className="p-3 bg-teal-500/10 rounded-full text-teal-400 border border-teal-500/20">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-black text-white uppercase tracking-wider">
              Demande Envoyée !
            </h1>
            <p className="text-sm text-slate-350 leading-relaxed">
              Un e-mail de sécurité a été envoyé à l'adresse <strong>{email}</strong>.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl text-left space-y-3 text-xs sm:text-sm text-slate-300">
            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Vérifiez votre boîte mail :</strong> Vous devez cliquer sur le lien dans l'e-mail pour soumettre officiellement votre dossier aux administrateurs.
              </p>
            </div>
            <div className="flex gap-2.5 items-start">
              <UserCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <p>
                Dès confirmation, votre compte sera révisé et vous recevrez un second e-mail de validation avec vos accès.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/"
              className="w-full flex justify-center items-center gap-1.5 py-3 px-4 rounded-xl text-sm font-bold bg-teal-500 hover:bg-teal-600 text-white transition-all shadow-lg"
            >
              Retourner à l'accueil <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center mb-6 px-4">
        <Logo size="lg" hideHaitiImage />
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-6 relative">
            <h2 className="text-xl font-extrabold text-white">
              Demander un Compte
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Rejoignez PressTonik en tant que rédacteur ou lecteur officiel
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-start gap-2.5 text-rose-400 text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Option Demande Rapide via Google */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => {
                setGoogleLoading(true);
                setError(null);
                signIn('google', { callbackUrl: '/login?google_pending=true' });
              }}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 transition duration-150 disabled:opacity-50 cursor-pointer shadow-sm active:scale-[0.99]"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              <span>Faire ma demande avec Google</span>
            </button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
                  ou remplir le formulaire
                </span>
              </div>
            </div>
          </div>

          <form className="space-y-5 relative" onSubmit={handleSubmit}>
            {/* Nom Complet */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Nom Complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="Jean-Baptiste Pierre"
                />
              </div>
            </div>

            {/* Nom d'utilisateur */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <PenTool className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="jbpierre"
                />
              </div>
            </div>

            {/* Adresse E-mail */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Adresse Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  placeholder="jbpierre@example.com"
                />
              </div>
            </div>

            {/* Statut demandé */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Statut demandé
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              >
                <option value="reader">Lecteur / Visiteur officiel</option>
                <option value="journalist">Rédacteur / Journaliste</option>
              </select>
            </div>

            {/* Photo de profil récente */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Photo de profil (récente pour identification)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 relative">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profil Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-700" />
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <input
                    type="file"
                    accept="image/*"
                    id="profile-upload"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition"
                  >
                    <FilePlus className="w-4 h-4" /> Sélectionner une photo
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    Images PNG, JPG ou GIF. Limite 5 Mo.
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-bold bg-teal-500 text-white hover:bg-teal-600 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" /> Soumission en cours...
                  </>
                ) : (
                  'Envoyer la demande'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-850 pt-4 flex justify-between">
            <Link href="/login" className="text-teal-400 hover:underline">
              Retour à la connexion
            </Link>
            <Link href="/privacy" className="text-teal-400 hover:underline">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
