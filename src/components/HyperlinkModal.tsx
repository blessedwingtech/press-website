'use client';

import React, { useState, useEffect } from 'react';
import { Link2, ExternalLink, Check, X, Globe, Unlink } from 'lucide-react';

interface HyperlinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (linkData: { text: string; url: string; openInNewTab: boolean }) => void;
  onRemoveLink?: () => void;
  initialText?: string;
  initialUrl?: string;
  isEditing?: boolean;
}

export default function HyperlinkModal({
  isOpen,
  onClose,
  onSubmit,
  onRemoveLink,
  initialText = '',
  initialUrl = '',
  isEditing = false,
}: HyperlinkModalProps) {
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setUrl(initialUrl);
      setUrlError(null);
    }
  }, [isOpen, initialText, initialUrl]);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    let cleanUrl = url.trim();

    if (!cleanUrl) {
      setUrlError('Veuillez saisir une URL valide.');
      return;
    }

    // Auto prepend https:// if missing
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('mailto:') && !cleanUrl.startsWith('tel:')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setUrlError('Format d\'adresse URL non reconnu (ex: https://exemple.com).');
      return;
    }

    const displayText = text.trim() || cleanUrl;

    onSubmit({
      text: displayText,
      url: cleanUrl,
      openInNewTab,
    });
    onClose();
  };

  const handleTestUrl = () => {
    let cleanUrl = url.trim();
    if (!cleanUrl) return;
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
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
            <span className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Link2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-black text-white">
                {isEditing ? 'Modifier l’Hyperlien' : 'Insérer un Hyperlien Journalistique'}
              </h3>
              <p className="text-[10px] text-slate-400">
                Liez vos affirmations à des sources externes vérifiées
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
        <form onSubmit={handleApply} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
              Texte à afficher
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: selon le rapport officiel de l'ONU"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">
                Adresse URL de la source
              </label>
              {url.trim().length > 3 && (
                <button
                  type="button"
                  onClick={handleTestUrl}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  Tester le lien
                </button>
              )}
            </div>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError(null);
                }}
                placeholder="https://www.lemonde.fr/article-123..."
                className={`w-full bg-slate-950 border rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none ${
                  urlError ? 'border-red-500/80 focus:border-red-500' : 'border-slate-800 focus:border-cyan-500/60'
                }`}
              />
            </div>
            {urlError && (
              <p className="text-[11px] text-red-400 font-medium">{urlError}</p>
            )}
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="w-4 h-4 rounded text-cyan-500 border-slate-700 bg-slate-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <div>
              <span className="block text-xs font-bold text-slate-200">
                Ouvrir dans un nouvel onglet (<code className="text-[10px] text-cyan-300">target="_blank"</code>)
              </span>
              <span className="block text-[10px] text-slate-500">
                Recommandé pour les citations et sources externes de presse
              </span>
            </div>
          </label>

          {/* Boutons */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
            {isEditing && onRemoveLink ? (
              <button
                type="button"
                onClick={() => {
                  onRemoveLink();
                  onClose();
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition flex items-center gap-1.5"
              >
                <Unlink className="w-3.5 h-3.5" />
                Retirer le lien
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Annuler
              </button>
            )}

            <button
              type="submit"
              className="ml-auto px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              {isEditing ? 'Mettre à jour' : 'Insérer le lien'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
