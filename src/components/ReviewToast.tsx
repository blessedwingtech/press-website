'use client';

import { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';

interface Review {
  id: string;
  userName: string | null;
  avatarUrl: string | null;
  rating: number;
  comment: string;
  sourceSite: string;
}

interface ReviewToastProps {
  currentSite: string;
  hubUrl?: string;
  intervalMinutes?: number; // Temps entre chaque toast (ex: 3)
}

export default function ReviewToast({ currentSite, hubUrl = 'http://localhost:3000', intervalMinutes = 3 }: ReviewToastProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [visible, setVisible] = useState(false);

  // 1. Charger les avis une seule fois
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // On récupère uniquement les avis excellents (4 ou 5 étoiles) pour le toast publicitaire
        const res = await fetch(`${hubUrl}/api/reviews?source=${currentSite}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          const bestReviews = data.reviews.filter((r: Review) => r.rating >= 4);
          setReviews(bestReviews);
        }
      } catch (err) {
        console.error("Erreur chargement des avis pour le toast", err);
      }
    };
    fetchReviews();
  }, [currentSite, hubUrl]);

  // 2. Gérer le cycle d'affichage aléatoire
  useEffect(() => {
    if (reviews.length === 0) return;

    // Fonction pour afficher un avis aléatoire
    const showRandomReview = () => {
      const randomIndex = Math.floor(Math.random() * reviews.length);
      setCurrentReview(reviews[randomIndex]);
      setVisible(true);

      // Le cacher après 8 secondes
      setTimeout(() => {
        setVisible(false);
      }, 8000);
    };

    // Lancer le premier toast après quelques secondes d'arrivée sur le site
    const initialDelay = setTimeout(showRandomReview, 10000);

    // Puis lancer la boucle toutes les X minutes
    const interval = setInterval(showRandomReview, intervalMinutes * 60 * 1000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [reviews, intervalMinutes]);

  if (!visible || !currentReview) return null;

  // Tronquer le commentaire s'il est trop long
  const truncatedComment = currentReview.comment.length > 70 
    ? currentReview.comment.substring(0, 70) + '...' 
    : currentReview.comment;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-80 relative">
        <button 
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex gap-3">
          {/* Avatar */}
          {currentReview.avatarUrl ? (
            <img src={currentReview.avatarUrl} alt={currentReview.userName || 'Avatar'} className="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-sm" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm">
              {currentReview.userName ? currentReview.userName[0].toUpperCase() : 'U'}
            </div>
          )}
          
          {/* Contenu */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-slate-800">
                {currentReview.userName || 'Utilisateur'}
              </span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${star <= currentReview.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              "{truncatedComment}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
