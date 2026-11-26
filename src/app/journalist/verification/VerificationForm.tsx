'use client';

import { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Send,
  Globe,
  FileCheck,
  Scale,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { submitVerificationApplication } from './actions';
import { useRouter } from 'next/navigation';

const SPECIALTIES = [
  'Politique & Institutions',
  'Enquêtes de terrain & Société',
  'Économie & Finance',
  'Droits Humains & Justice',
  'Santé publique & Sciences',
  'Technologies & Numérique',
  'Culture & Patrimoine',
  'Sport & Jeunesse'
];

interface Props {
  hasPendingApplication?: boolean;
}

export default function VerificationForm({ hasPendingApplication = false }: Props) {
  const router = useRouter();

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [publicProfileUrl, setPublicProfileUrl] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [bio, setBio] = useState('');
  const [ethicsAccepted, setEthicsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleSpecialty = (spec: string) => {
    if (selectedSpecialties.includes(spec)) {
      setSelectedSpecialties(selectedSpecialties.filter((s) => s !== spec));
    } else {
      setSelectedSpecialties([...selectedSpecialties, spec]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ethicsAccepted) {
      setError('Vous devez accepter la Charte Éditoriale et Déontologique pour soumettre votre dossier.');
      return;
    }
    if (!portfolioLinks.trim()) {
      setError('Veuillez fournir au moins un lien vers vos articles ou travaux récents.');
      return;
    }
    if (!bio.trim() || bio.trim().length < 20) {
      setError('Veuillez décrire brièvement votre démarche et votre parcours (min. 20 caractères).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitVerificationApplication({
        specialties: selectedSpecialties,
        publicProfileUrl: publicProfileUrl.trim() || undefined,
        portfolioLinks: portfolioLinks.trim(),
        bio: bio.trim(),
        ethicsAccepted: true
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setError(res.error || 'Erreur lors de la soumission.');
      }
    } catch (err: any) {
      setError('Une erreur réseau est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (hasPendingApplication) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 relative flex flex-col sm:flex-row items-center gap-4 text-amber-900 dark:text-amber-300">
        <div className="p-3 bg-amber-500/20 rounded-full text-amber-500 shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
            Dossier de vérification en cours d&apos;examen
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-350">
            Votre demande d&apos;accréditation a bien été reçue. L&apos;équipe examine vos références et votre respect de la charte. Vous recevrez un e-mail dès validation de votre badge.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Dossier soumis avec succès !
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Votre candidature pour le badge « Journaliste Vérifié » a été transmise. Vous serez notifié par e-mail dès son examen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider">
          <Award className="w-4 h-4" /> Formulaire d&apos;Accréditation Déontologique
        </div>
        <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Demande du Badge « Journaliste Vérifié »
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Aucune pièce d&apos;identité personnelle n&apos;est exigée. La vérification repose sur vos travaux publics, vos canaux de diffusion et votre engagement déontologique.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3.5 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Spécialités */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            1. Domaines de prédilection &amp; d&apos;investigation
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((spec) => {
              const selected = selectedSpecialties.includes(spec);
              return (
                <button
                  type="button"
                  key={spec}
                  onClick={() => toggleSpecialty(spec)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
                    selected
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-amber-500/50'
                  }`}
                >
                  {spec}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Profil public / canal de diffusion */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" /> 2. Canal public ou profil de diffusion
          </label>
          <input
            type="url"
            value={publicProfileUrl}
            onChange={(e) => setPublicProfileUrl(e.target.value)}
            placeholder="Lien vers votre compte X/Twitter, page Facebook, chaîne WhatsApp ou site web..."
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
          <p className="text-[11px] text-slate-500">
            Permet de recouper votre présence publique sans avoir à exposer votre identité civile.
          </p>
        </div>

        {/* 3. Preuves de travail */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-slate-400" /> 3. Liens vers des articles ou enquêtes déjà publiés <span className="text-amber-500">*</span>
          </label>
          <textarea
            rows={3}
            value={portfolioLinks}
            onChange={(e) => setPortfolioLinks(e.target.value)}
            placeholder="Indiquez 2 à 5 liens vers vos écrits récents (sur PressTonik, d'autres journaux, blogs ou revues)..."
            required
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
        </div>

        {/* 4. Bio & Démarche */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            4. Votre démarche journalistique &amp; sujets prioritaires <span className="text-amber-500">*</span>
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Expliquez brièvement votre méthode de travail, vos sources habituelles et vos engagements pour une information rigoureuse..."
            required
            className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
          />
        </div>

        {/* 5. Engagement déontologique */}
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 p-4 rounded-xl space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={ethicsAccepted}
              onChange={(e) => setEthicsAccepted(e.target.checked)}
              required
              className="w-4 h-4 mt-0.5 rounded text-amber-500 border-amber-400 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed select-none">
              <strong>J&apos;atteste sur l&apos;honneur respecter la <Link href="/charte" target="_blank" className="underline font-bold hover:text-amber-600">Charte Éditoriale et Déontologique</Link> de PressTonik</strong> : rigueur et vérification des faits, citation des sources, interdiction formelle du plagiat, transparence sur l&apos;usage des outils IA et déclaration de tout conflit d&apos;intérêts.
            </span>
          </label>
        </div>

        {/* Bouton de soumission */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Transmission en cours...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Soumettre mon dossier d&apos;accréditation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
