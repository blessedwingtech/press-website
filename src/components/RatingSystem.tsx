'use client';

import { useState, useTransition } from 'react';
import { Star, CheckCircle2, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { rateArticle } from '@/app/articles/actions';

interface RatingSystemProps {
  articleId: string;
  initialAverage: number;
  initialTotalCount: number;
  userVote: number | null; // Vote précédent de l'utilisateur sur cet écrit
  authorName?: string;
  authorAverage?: number;
  authorTotalCount?: number;
  hasUserRatedAuthor?: boolean; // L'utilisateur a-t-il déjà évalué au moins un écrit de ce journaliste ?
}

export default function RatingSystem({
  articleId,
  initialAverage = 0,
  initialTotalCount = 0,
  userVote: initialUserVote = null,
  authorName = 'ce journaliste',
  authorAverage = 0,
  authorTotalCount = 0,
  hasUserRatedAuthor = false,
}: RatingSystemProps) {
  const [isPending, startTransition] = useTransition();
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialTotalCount);
  const [myVote, setMyVote] = useState<number | null>(initialUserVote);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleVote = (stars: number) => {
    if (isPending) return;

    // Optimistic UI : Mettre à jour l'affichage immédiatement
    const previousVote = myVote;
    setMyVote(stars);

    // Calculer la nouvelle moyenne de façon optimiste
    let newCount = count;
    let sum = average * count;

    if (previousVote === null) {
      // Premier vote de l'utilisateur sur cet article
      newCount += 1;
      sum += stars;
    } else {
      // Modification du vote existant
      sum = sum - previousVote + stars;
    }

    const newAverage = newCount > 0 ? sum / newCount : stars;
    setAverage(newAverage);
    setCount(newCount);

    // Lancer la mutation serveur
    startTransition(async () => {
      const res = await rateArticle(articleId, stars);
      if (!res.success) {
        // Rollback en cas d'erreur
        setMyVote(previousVote);
        setAverage(initialAverage);
        setCount(initialTotalCount);
        alert(res.error || 'Erreur lors de l’enregistrement de votre vote.');
      }
    });
  };

  const isUserEvaluated = myVote !== null;

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm dark:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Évaluation & Réputation Journalistique
          </span>
          {isUserEvaluated ? (
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-amber-500 dark:text-amber-400" />
              Déjà Évalué
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              ⚪ Non Évalué Par Vous
            </span>
          )}
        </div>

        {/* Moyenne de cet écrit & réputation globale */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <span className="text-amber-500 dark:text-amber-400">★</span>
            <span>{average > 0 ? average.toFixed(1) : '—'}</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal text-[11px]">
              ({count} avis sur cet article)
            </span>
          </div>

          {authorAverage > 0 && (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
              <span>Plume de l'auteur :</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{authorAverage.toFixed(1)} ★</strong>
            </div>
          )}
        </div>
      </div>

      {/* Rangée interactive des étoiles & informations de vote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Étoiles interactives */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = hoverRating !== null
                ? star <= hoverRating
                : isUserEvaluated
                ? star <= myVote!
                : false;

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleVote(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  disabled={isPending}
                  aria-label={`Attribuer ${star} étoile${star > 1 ? 's' : ''}`}
                  className={`p-1 rounded-lg transition-all duration-150 focus:outline-none cursor-pointer ${
                    isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-120 active:scale-95'
                  }`}
                >
                  <Star
                    className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-200 ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                        : isUserEvaluated
                        ? 'fill-transparent text-slate-700 stroke-slate-700 hover:text-amber-400'
                        : 'fill-transparent text-slate-600 stroke-[1.5] stroke-slate-500 hover:text-amber-400 hover:stroke-amber-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Statut ou note attribuée */}
          {hoverRating !== null ? (
            <span className="text-xs font-bold text-amber-300 animate-in fade-in duration-150 whitespace-nowrap">
              Attribuer {hoverRating} ★
            </span>
          ) : isUserEvaluated ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold whitespace-nowrap">
              <span>Votre note : <strong>{myVote}/5 ★</strong></span>
              <span className="text-[10px] text-amber-400/70 font-normal hidden sm:inline">(modifier)</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Cliquez pour évaluer
            </span>
          )}
        </div>

        {/* Message de confirmation ou d'incitation */}
        <div className="flex items-center text-xs sm:text-right">
          {isUserEvaluated ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Merci pour votre évaluation !
            </span>
          ) : count === 0 ? (
            <span className="text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Soyez le premier à évaluer cet écrit !
            </span>
          ) : !hasUserRatedAuthor ? (
            <span className="text-xs text-slate-400 font-medium">
              Notez le travail journalistique de cet auteur
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium">
              Cet écrit attend votre avis
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
