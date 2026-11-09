'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Clock } from 'lucide-react';

interface ProgressiveArticleContentProps {
  htmlContent: string;
  isPaywalled?: boolean;
}

export default function ProgressiveArticleContent({
  htmlContent,
  isPaywalled = false,
}: ProgressiveArticleContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Estimation du volume de texte et temps de lecture
  const stats = useMemo(() => {
    if (!htmlContent) return { isLong: false, totalWords: 0, remainingMinutes: 0 };
    const textOnly = htmlContent.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    const words = textOnly ? textOnly.split(/\s+/).length : 0;
    
    // Si l'article fait plus de 350 mots, on propose la lecture progressive
    const isLong = words > 350;
    const remainingWords = Math.max(0, words - 250);
    const remainingMinutes = Math.max(1, Math.round(remainingWords / 200));

    return {
      isLong,
      totalWords: words,
      remainingMinutes,
    };
  }, [htmlContent]);

  // Si l'article est protégé par Paywall ou s'il est court, affichage direct
  if (isPaywalled || !stats.isLong) {
    return (
      <div
        id="article-prose-body"
        className="prose prose-invert prose-emerald max-w-none text-slate-350 leading-relaxed text-sm sm:text-base space-y-4"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

  return (
    <div className="relative">
      {/* Conteneur de l'article avec limite de hauteur si non étendu */}
      <div
        id="article-prose-body"
        className={`prose prose-invert prose-emerald max-w-none text-slate-350 leading-relaxed text-sm sm:text-base space-y-4 transition-all duration-500 ease-in-out ${
          isExpanded ? 'max-h-none' : 'max-h-[500px] overflow-hidden select-none sm:select-text'
        }`}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Fondu dégradé et bouton "Lire plus" style WhatsApp / Presse moderne */}
      {!isExpanded && (
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-col items-center justify-end pb-3 pt-12 z-10">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-950 transition-transform group-hover:scale-110" />
            <span>Lire la suite (Lire plus...)</span>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-900 bg-emerald-300/60 px-2 py-0.5 rounded-full">
              ~{stats.remainingMinutes} min
            </span>
            <ChevronDown className="w-4 h-4 text-slate-950 animate-bounce" />
          </button>
          <p className="mt-2 text-[11px] text-slate-500 font-medium">
            Affichage progressif activé &bull; Cliquez pour dévoiler l'intégralité
          </p>
        </div>
      )}

      {/* Bouton discret pour replier si le lecteur le souhaite après lecture complète */}
      {isExpanded && stats.isLong && (
        <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              const el = document.getElementById('article-prose-body');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors py-1 px-3 rounded-lg hover:bg-slate-900"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Replier l'article</span>
          </button>
        </div>
      )}
    </div>
  );
}
