'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Check, X, FileText, ExternalLink, Lock } from 'lucide-react';

interface AiEthicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function AiEthicsModal({ isOpen, onClose, onAccept }: AiEthicsModalProps) {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!checked) return;
    try {
      localStorage.setItem('presstonik_ai_ethics_consent', JSON.stringify({
        acceptedAt: new Date().toISOString(),
        version: 'v1.0',
      }));
    } catch (e) {}
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="p-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Engagement Déontologique & Anti-Plagiat
              </span>
              <h2 className="text-lg font-black text-white">
                Charte d'Utilisation Éthique du Carnet IA
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de la charte */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-300">
          <p className="text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            L'assistant PressTonik est exclusivement un <strong>carnet de recherche et de recoupement factuel</strong>. Il est strictement interdit d'abandonner l'écriture d'un article à l'IA ou de publier du texte brut sans vérification humaine.
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400 text-xs font-black mt-0.5">1</span>
              <div>
                <strong className="block text-slate-100 font-bold mb-0.5">
                  Vérification scrupuleuse des faits et des chiffres
                </strong>
                <span>
                  Tout élément factuel, statistique, date ou citation doit faire l'objet d'un recoupement avec les sources primaires originales. Ne tenez jamais une information d'IA pour acquise.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400 text-xs font-black mt-0.5">2</span>
              <div>
                <strong className="block text-slate-100 font-bold mb-0.5">
                  Interdiction formelle du plagiat et du copier-coller brut
                </strong>
                <span>
                  Les résultats sont présentés dans un <em>espace séparé</em> pour nourrir votre enquête. Le contenu de l'article doit être le fruit de votre plume, de votre style et de votre analyse personnelle.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400 text-xs font-black mt-0.5">3</span>
              <div>
                <strong className="block text-slate-100 font-bold mb-0.5">
                  Attribution explicite et liens hypertextes
                </strong>
                <span>
                  Tout emprunt d'information, de citation ou de déclaration d'un confrère ou d'une agence de presse doit être formellement attribué et enrichi d'un hyperlien vers la source.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400 text-xs font-black mt-0.5">4</span>
              <div>
                <strong className="block text-slate-100 font-bold mb-0.5">
                  Responsabilité éditoriale personnelle et légale
                </strong>
                <span>
                  En publiant sous votre signature, vous engagez votre responsabilité déontologique, professionnelle et légale pleine et entière devant la rédaction et les lecteurs de PressTonik.
                </span>
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer hover:bg-amber-500/15 transition group">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-amber-500 border-amber-500/50 bg-slate-950 focus:ring-0 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs text-amber-200 group-hover:text-amber-100 font-semibold leading-relaxed">
                Je certifie sur l'honneur avoir pris connaissance de la Charte Déontologique. Je m'engage à vérifier scrupuleusement les faits, à ne publier aucun contenu brut généré et à assumer l'entière responsabilité de mes articles.
              </span>
            </label>
          </div>
        </div>

        {/* Pied de page */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition"
          >
            Refuser et fermer
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!checked}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-amber-950/30"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            Signer & Accéder au Carnet IA
          </button>
        </div>
      </div>
    </div>
  );
}
