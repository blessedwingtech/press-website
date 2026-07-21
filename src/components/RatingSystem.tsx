'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { rateArticle } from '@/app/articles/actions';

interface RatingSystemProps {
  articleId: string;
  initialAverage: number;
  initialTotalCount: number;
  userVote: number | null; // Vote précédent de l'utilisateur s'il existe
}

export default function RatingSystem({
  articleId,
  initialAverage = 0,
  initialTotalCount = 0,
  userVote: initialUserVote = null,
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
      // Premier vote
      newCount += 1;
      sum += stars;
    } else {
      // Mise à jour du vote existant
      sum = sum - previousVote + stars;
    }

    const newAverage = sum / newCount;
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

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
        Évaluation du Journaliste
      </span>
      <div className="flex items-center gap-3">
        {/* Stars container */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = hoverRating !== null ? star <= hoverRating : star <= (myVote || Math.round(average));
            const isMyRating = star <= (myVote || 0);

            return (
              <button
                key={star}
                type="button"
                onClick={() => handleVote(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(null)}
                disabled={isPending}
                className={`transition-all duration-200 focus:outline-none ${
                  isPending ? 'opacity-60 cursor-not-allowed' : 'hover:scale-125 active:scale-95'
                }`}
              >
                <Star
                  className={`w-6 h-6 stroke-1.5 ${
                    isFilled
                      ? isMyRating
                        ? 'fill-amber-400 stroke-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : 'fill-cyan-400 stroke-cyan-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Text Stats */}
        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
          <span className="font-extrabold text-white text-sm leading-none bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
            {average.toFixed(1)}
          </span>
          <span className="text-slate-500">({count} évaluation{count > 1 ? 's' : ''})</span>
          {myVote !== null && (
            <span className="text-[9px] uppercase font-black tracking-wider text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/30">
              Votre note : {myVote}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
