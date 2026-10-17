'use client';

import React, { useState } from 'react';
import { Quote, ExternalLink, Check, X } from 'lucide-react';

interface QuoteSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { quote: string; author: string; sourceUrl: string }) => void;
}

export default function QuoteSourceModal({ isOpen, onClose, onSubmit }: QuoteSourceModalProps) {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote.trim()) {
      setError('Veuillez saisir le texte de la citation.');
      return;
    }
    if (!author.trim()) {
      setError('Veuillez préciser le média émetteur ou la personne citée.');
      return;
    }

    let cleanUrl = sourceUrl.trim();
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    onSubmit({
      quote: quote.trim(),
      author: author.trim(),
      sourceUrl: cleanUrl,
    });

    setQuote('');
    setAuthor('');
    setSourceUrl('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Quote className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white">
                Insérer une Citation & Source
              </h3>
              <p className="text-[10px] text-slate-400">
                Mise en forme conforme et attribution déontologique
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
              Déclaration ou Citation textuelle
            </label>
            <textarea
              rows={3}
              value={quote}
              onChange={(e) => {
                setQuote(e.target.value);
                setError(null);
              }}
              placeholder="« Cette mesure est indispensable pour garantir la sécurité alimentaire dans la région... »"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
              Auteur, Intervenant ou Média d'origine
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);
                setError(null);
              }}
              placeholder="Ex: Dr. Jean Dupont, porte-parole / Agence Reuters"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
              Lien hypertexte de la source (URL facultative mais recommandée)
            </label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://reuters.com/article/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-400 font-medium">{error}</p>
          )}

          {/* Boutons */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/40"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Insérer la citation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
