'use client';

import { useState } from 'react';
import { PenTool, X, CheckCircle2, AlertCircle, Loader2, Sparkles, Send, Globe, BookOpen } from 'lucide-react';
import { requestPromotionToJournalist } from './actions';
import { useRouter } from 'next/navigation';

const AVAILABLE_RUBRICS = [
  'Actualités & Faits Divers',
  'Politique & Institutions',
  'Économie & Entrepreneuriat',
  'Société & Enquêtes',
  'Santé & Sciences',
  'Technologies & IA',
  'Sport & Compétitions',
  'Culture & Arts'
];

interface Props {
  hasPendingRequest?: boolean;
}

export default function BecomeJournalistModal({ hasPendingRequest = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [selectedRubrics, setSelectedRubrics] = useState<string[]>([]);
  const [motivation, setMotivation] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  const router = useRouter();

  const toggleRubric = (rubric: string) => {
    if (selectedRubrics.includes(rubric)) {
      setSelectedRubrics(selectedRubrics.filter((r) => r !== rubric));
    } else {
      setSelectedRubrics([...selectedRubrics, rubric]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivation.trim()) {
      setError('Veuillez décrire brièvement vos motivations ou sujets de prédilection.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await requestPromotionToJournalist({
        motivation,
        portfolioUrl: portfolioUrl.trim() || undefined,
        rubrics: selectedRubrics
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1200);
      } else {
        setError(res.error || 'Une erreur est survenue.');
      }
    } catch (err: any) {
      setError('Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (hasPendingRequest) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 sm:p-6 relative z-10 flex flex-col sm:flex-row items-center gap-4 text-amber-900 dark:text-amber-300">
        <div className="p-3 bg-amber-500/20 rounded-full text-amber-500 shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
            Candidature Rédacteur en cours d&apos;examen
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-350">
            Votre demande pour devenir Rédacteur PressTonik est actuellement examinée par la rédaction. Vous recevrez une notification par e-mail dès validation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Banner / Card to trigger modal */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-50 to-teal-500/10 dark:from-amber-950/20 dark:via-slate-900 dark:to-teal-950/20 border border-amber-500/30 p-5 sm:p-6 rounded-2xl relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider">
            <PenTool className="w-4 h-4" /> Devenir Rédacteur PressTonik
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white">
            Partagez vos analyses, publiez vos articles et développez votre audience
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Rejoignez le collectif de journalistes et rédacteurs indépendants de PressTonik Ayiti.
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-950/20 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
        >
          <PenTool className="w-3.5 h-3.5" /> Postuler comme Rédacteur
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-3 h-3" /> Évolution de statut
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Candidature au statut Rédacteur
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="text-center py-8 space-y-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase">
                    Candidature transmise avec succès !
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                    Notre comité de rédaction va étudier votre profil. Vous recevrez une notification par email dès confirmation.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-xl flex items-center gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Rubriques d'intérêt */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Vos rubriques de prédilection
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_RUBRICS.map((rubric) => {
                      const selected = selectedRubrics.includes(rubric);
                      return (
                        <button
                          type="button"
                          key={rubric}
                          onClick={() => toggleRubric(rubric)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer ${
                            selected
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-amber-500/50'
                          }`}
                        >
                          {rubric}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Motivation / Description */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Motivation & Expérience <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="Présentez brièvement vos sujets d'intérêt, votre style d'analyse, vos expériences journalistiques ou ce qui vous anime à écrire sur PressTonik..."
                    required
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  />
                </div>

                {/* Liens ou Portfolio */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" /> Lien portfolio / articles précédents (optionnel)
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                  />
                </div>

                {/* Footer buttons */}
                <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Soumettre ma candidature
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
