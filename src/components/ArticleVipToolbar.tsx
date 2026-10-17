'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  Crown,
  Type,
  Sun,
  Moon,
  Volume2,
  Sparkles,
  Check,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

interface ArticleVipToolbarProps {
  articleTitle: string;
  articleContent: string;
  isVip: boolean;
}

export default function ArticleVipToolbar({
  articleTitle,
  articleContent,
  isVip,
}: ArticleVipToolbarProps) {
  // --- ÉTAT DU MODE ZEN ---
  const [isZenMode, setIsZenMode] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [theme, setTheme] = useState<'dark' | 'sepia' | 'oled'>('dark');

  // --- ÉTAT DE LA SYNTHÈSE AUDIO (TTS) ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Vérifier si la synthèse vocale est supportée par le navigateur
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
    }
  }, []);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Gestion du Mode Zen sur le DOM (masque la sidebar et élargit la zone de lecture)
  useEffect(() => {
    const articleContainer = document.getElementById('article-content-container');
    const articleSidebar = document.getElementById('article-sidebar');

    if (isZenMode) {
      document.body.classList.add('zen-mode-active');
      if (articleSidebar) articleSidebar.style.display = 'none';
      if (articleContainer) {
        articleContainer.classList.remove('lg:col-span-3');
        articleContainer.classList.add('lg:col-span-4', 'max-w-3xl', 'mx-auto');
      }
    } else {
      document.body.classList.remove('zen-mode-active');
      if (articleSidebar) articleSidebar.style.display = '';
      if (articleContainer) {
        articleContainer.classList.add('lg:col-span-3');
        articleContainer.classList.remove('lg:col-span-4', 'max-w-3xl', 'mx-auto');
      }
    }
  }, [isZenMode]);

  // Extraction du texte brut pour la synthèse vocale
  const getPlainText = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = articleContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return `${articleTitle}. ${text}`.replace(/\s+/g, ' ').trim();
  };

  // Lancer ou mettre en pause l'audio
  const handleTogglePlay = () => {
    if (!speechSupported) {
      alert('La synthèse audio n’est pas supportée par votre navigateur.');
      return;
    }

    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Démarrer la lecture
    window.speechSynthesis.cancel();

    const plainText = getPlainText();
    // Si non-VIP, on limite à un extrait teaser de 200 caractères
    const textToRead = isVip ? plainText : plainText.slice(0, 220) + '... Pour écouter l’intégralité de cet article en mobilité, rejoignez le cercle PressTonik VIP.';

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'fr-FR';
    utterance.rate = playbackRate;

    // Trouver une voix française naturelle si possible
    const voices = window.speechSynthesis.getVoices();
    const frenchVoice = voices.find((v) => v.lang.startsWith('fr') || v.lang.includes('FR'));
    if (frenchVoice) {
      utterance.voice = frenchVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setAudioProgress(100);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setAudioProgress(0);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (isPlaying) {
      handleStop();
    }
  };

  return (
    <div className="my-6 space-y-3">
      {/* Barre d'outils VIP principale */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Section 1 : Synthèse Audio */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isPlaying && !isPaused
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-950/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700/80'
            }`}
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
                <span>{isPaused ? 'Reprendre' : 'Écouter l\'article'}</span>
              </>
            )}
          </button>

          {isPlaying && (
            <button
              type="button"
              onClick={handleStop}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Arrêter la lecture"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Vitesse de lecture */}
          <div className="flex items-center bg-slate-950/60 border border-slate-800 rounded-xl p-0.5 text-[10px] font-bold">
            {[1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleRateChange(rate)}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  playbackRate === rate ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {!isVip && (
            <span className="text-[10px] font-bold text-amber-400/90 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <Lock className="w-3 h-3" /> Extrait VIP
            </span>
          )}
        </div>

        {/* Section 2 : Bouton Mode Zen & Confort de lecture */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsZenMode(!isZenMode)}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              isZenMode
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-950/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:text-white'
            }`}
          >
            {isZenMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Quitter Mode Zen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Mode Zen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Panneau de réglages contextuels du Mode Zen (visible quand activé) */}
      {isZenMode && (
        <div className="bg-slate-950/90 border border-teal-500/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-xs text-teal-400 font-bold">
            <Sparkles className="w-4 h-4" /> Mode Lecture Zen Actif — Distractions masquées
          </div>

          <div className="flex items-center gap-3">
            {/* Taille de police */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setFontSize('normal');
                  const el = document.getElementById('article-prose-body');
                  if (el) el.className = el.className.replace(/text-(sm|base|lg|xl)/g, 'text-base');
                }}
                className={`px-2 py-0.5 rounded-lg ${fontSize === 'normal' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => {
                  setFontSize('large');
                  const el = document.getElementById('article-prose-body');
                  if (el) el.className = el.className.replace(/text-(sm|base|lg|xl)/g, 'text-lg');
                }}
                className={`px-2 py-0.5 rounded-lg text-sm ${fontSize === 'large' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => {
                  setFontSize('xlarge');
                  const el = document.getElementById('article-prose-body');
                  if (el) el.className = el.className.replace(/text-(sm|base|lg|xl)/g, 'text-xl');
                }}
                className={`px-2 py-0.5 rounded-lg text-base font-black ${fontSize === 'xlarge' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'}`}
              >
                A++
              </button>
            </div>

            {/* Thèmes de lecture */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  const el = document.getElementById('article-content-container');
                  if (el) {
                    el.style.backgroundColor = '';
                    el.style.color = '';
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase ${theme === 'dark' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              >
                Sombre
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme('sepia');
                  const el = document.getElementById('article-content-container');
                  if (el) {
                    el.style.backgroundColor = '#1c1917';
                    el.style.color = '#fed7aa';
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase ${theme === 'sepia' ? 'bg-amber-900/60 text-amber-200 border border-amber-700/50' : 'text-slate-400'}`}
              >
                Sépia
              </button>
              <button
                type="button"
                onClick={() => {
                  setTheme('oled');
                  const el = document.getElementById('article-content-container');
                  if (el) {
                    el.style.backgroundColor = '#000000';
                    el.style.color = '#e2e8f0';
                  }
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase ${theme === 'oled' ? 'bg-black text-white border border-slate-700' : 'text-slate-400'}`}
              >
                OLED
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
