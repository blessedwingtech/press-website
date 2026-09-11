'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2, Globe, MapPin } from 'lucide-react';

interface Review {
  id: string;
  sourceSite: string;
  serviceRef: string | null;
  userName: string | null;
  location: string | null;
  avatarUrl: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewWidgetProps {
  currentSite: string; // Ex: 'PRESSTONIK'
  hubUrl?: string; // Ex: 'http://localhost:3001' ou 'https://avis.bittonik.com' en prod
}

export default function ReviewWidget({ currentSite, hubUrl = 'http://localhost:3000' }: ReviewWidgetProps) {
  const [mode, setMode] = useState<'local' | 'global'>('local');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = mode === 'local' 
        ? `${hubUrl}/api/reviews?source=${currentSite}`
        : `${hubUrl}/api/reviews`;
      
      const statsEndpoint = mode === 'local'
        ? `${hubUrl}/api/reviews/stats?source=${currentSite}`
        : `${hubUrl}/api/reviews/stats`;

      const [resReviews, resStats] = await Promise.all([
        fetch(endpoint),
        fetch(statsEndpoint)
      ]);

      if (!resReviews.ok || !resStats.ok) throw new Error('Erreur réseau');

      const dataReviews = await resReviews.json();
      const dataStats = await resStats.json();

      setReviews(dataReviews.reviews || []);
      setStats({
        averageRating: dataStats.averageRating || 0,
        totalReviews: dataStats.totalReviews || 0
      });
    } catch (err: any) {
      setError('Impossible de charger les avis. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [mode, currentSite]);

  const leaveReviewUrl = typeof window !== 'undefined'
    ? `${hubUrl}?source=${currentSite}&return_url=${encodeURIComponent(window.location.href)}`
    : `${hubUrl}?source=${currentSite}`;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-5xl w-full mx-auto font-sans">
      {/* En-tête du widget */}
      <div className="bg-slate-50/80 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-3">
            <MessageSquare className="w-7 h-7 text-emerald-500" />
            Ce que pensent nos utilisateurs
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${star <= Math.round(stats.averageRating) ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]' : 'fill-slate-100 text-slate-200'}`}
                />
              ))}
            </div>
            <span className="text-slate-800 font-black text-lg">{stats.averageRating.toFixed(1)} / 5</span>
            <span className="text-slate-500 font-medium">({stats.totalReviews} avis vérifiés)</span>
          </div>
        </div>

        {/* Toggle Local / Global */}
        <div className="flex bg-slate-200/50 p-1.5 rounded-xl border border-slate-200/60">
          <button
            onClick={() => setMode('local')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mode === 'local' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Ici
          </button>
          <button
            onClick={() => setMode('global')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mode === 'global' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            Réseau BitTonik
          </button>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="p-6 sm:p-8 bg-white">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16 gap-4">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-slate-400 font-medium animate-pulse">Chargement des avis...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-10 bg-red-50 rounded-2xl border border-red-100 font-bold">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-bold text-lg">Aucun avis publié pour le moment.</p>
            <p className="text-slate-500 mt-2">Soyez le premier à partager votre expérience !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-black text-sm uppercase shadow-inner">
                        {review.userName ? review.userName[0] : 'U'}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-800 leading-tight">
                          {review.userName || 'Utilisateur anonyme'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[11px] text-slate-400 font-semibold">
                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                          {review.location && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {review.location}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-medium">"{review.comment}"</p>
                </div>
                
                {mode === 'global' && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-100">
                      Via <span className="text-emerald-500">{review.sourceSite}</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bouton CTA */}
        <div className="mt-10 text-center">
          <a
            href={leaveReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
          >
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            Donner votre avis
          </a>
        </div>
      </div>
    </div>
  );
}
