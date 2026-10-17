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
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-white uppercase tracking-wider">
            Évaluation & Réputation Journalistique
          </span>
          {isUserEvaluated ? (
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-amber-400" />
              Déjà Évalué
            </span>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              ⚪ Non Évalué Par Vous
            </span>
          )}
        </div>

        {/* Moyenne de cet écrit & réputation globale */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span className="text-amber-400">★</span>
            <span>{average > 0 ? average.toFixed(1) : '—'}</span>
            <span className="text-slate-400 font-normal text-[11px]">
              ({count} avis sur cet article)
            </span>
          </div>

          {authorAverage > 0 && (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 border-l border-slate-800 pl-3">
              <span>Plume de l'auteur :</span>
              <strong className="text-emerald-400 font-bold">{authorAverage.toFixed(1)} ★</strong>
            </div>
          )}
        </div>
      </div>

      {/* Rangée interactive des étoiles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Étoiles interactives avec distinction de couleur stricte */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              // Si survol : affiche le niveau survolé
              // Si déjà évalué par l'utilisateur : étoiles dorées jusqu'à myVote
              // Si NON évalué par l'utilisateur : étoiles éteintes (slate) pour bien indiquer qu'il n'a pas voté
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
                    isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-125 active:scale-95'
                  }`}
                >
                  <Star
                    className={`w-7 h-7 transition-all duration-200 ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]'
                        : isUserEvaluated
                        ? 'fill-transparent text-slate-700 stroke-slate-700 hover:text-amber-400'
                        : 'fill-transparent text-slate-600 stroke-[1.5] stroke-slate-500 hover:text-amber-400 hover:stroke-amber-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Infobulle de sélection au survol */}
          {hoverRating !== null ? (
            <span className="text-xs font-bold text-amber-300 animate-in fade-in duration-150">
              Attribuer {hoverRating} étoile{hoverRating > 1 ? 's' : ''} à cet écrit
            </span>
          ) : isUserEvaluated ? (
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
              Votre note : <strong>{myVote} / 5 ★</strong>
              <span className="text-[10px] text-slate-500 font-normal">(cliquez pour modifier)</span>
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">
              Cliquez sur une étoile pour évaluer
            </span>
          )}
        </div>

        {/* Badge explicatif selon l'état de l'utilisateur vis-à-vis de ce journaliste */}
        <div className="text-right">
          {isUserEvaluated ? (
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Merci pour votre évaluation !
            </span>
          ) : count === 0 ? (
            <span className="text-[11px] text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Soyez le premier à évaluer cet écrit !
            </span>
          ) : !hasUserRatedAuthor ? (
            <span className="text-[11px] text-slate-350 font-medium">
              Découvrez cet auteur : notez son travail journalistique
            </span>
          ) : (
            <span className="text-[11px] text-slate-350 font-medium">
              Cet écrit attend votre évaluation
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
