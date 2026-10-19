'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Quote,
  Clock,
  Compass,
  ShieldCheck,
  X,
  Minus,
  Maximize2,
  Loader2,
  AlertCircle,
  Layers,
  FileText,
  RotateCcw,
} from 'lucide-react';
import AiEthicsModal from './AiEthicsModal';
import FormattedAiDraft from './FormattedAiDraft';

export interface ResearchData {
  summary?: string;
  keyFacts?: Array<{ id: string; fact: string; detail?: string }>;
  sources?: Array<{
    id: string;
    media: string;
    title: string;
    url: string;
    summary?: string;
    keyQuote?: string;
  }>;
  timeline?: Array<{ date: string; event: string }>;
  investigativeAngles?: Array<{ angle: string; question: string }>;
}

interface AiResearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertQuote?: (data: { quote: string; media: string; url: string }) => void;
  onInsertLink?: (data: { text: string; url: string }) => void;
  defaultQuery?: string;
  initialData?: ResearchData | null;
  initialDraft?: string | null;
}

export default function AiResearchDrawer({
  isOpen,
  onClose,
  onInsertQuote,
  onInsertLink,
  defaultQuery = '',
  initialData = null,
  initialDraft = null,
}: AiResearchDrawerProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [tone, setTone] = useState<'factual' | 'analysis' | 'investigation'>('factual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResearchData | null>(initialData);
  const [draft, setDraft] = useState<string | null>(initialDraft);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'facts' | 'sources' | 'timeline' | 'angles' | 'draft'>(
    initialDraft ? 'draft' : 'facts'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal Déontologique
  const [isEthicsModalOpen, setIsEthicsModalOpen] = useState(false);
  const [hasAcceptedEthics, setHasAcceptedEthics] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('presstonik_ai_ethics_consent');
      if (saved) {
        setHasAcceptedEthics(true);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (defaultQuery && !query) {
      setQuery(defaultQuery);
    }
  }, [defaultQuery]);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialDraft) {
      setDraft(initialDraft);
      setActiveTab('draft');
    }
  }, [initialDraft]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleLaunchSearch = async () => {
    if (!query.trim()) return;

    if (!hasAcceptedEthics) {
      setIsEthicsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, tone }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Erreur lors de la recherche.');
      }

      setData(json.data);
      if (json.data?.keyFacts?.length) {
        setActiveTab('facts');
      } else if (json.data?.sources?.length) {
        setActiveTab('sources');
      }
    } catch (err: any) {
      setError(err.message || 'Impossible de charger le carnet de recherche.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!query.trim()) return;

    if (!hasAcceptedEthics) {
      setIsEthicsModalOpen(true);
      return;
    }

    setIsGeneratingDraft(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: query,
          tone,
          researchData: data,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Erreur lors de la génération de la proposition de rédaction.');
      }

      setDraft(json.draft);
      setActiveTab('draft');
    } catch (err: any) {
      setError(err.message || 'Impossible de générer la proposition de rédaction.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  if (!isOpen) return null;

  // Mode réduit (Collapse / Minimisé) : languette flottante non-bloquante
  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 bg-slate-900/95 hover:bg-slate-850 border border-amber-500/50 hover:border-amber-400 text-white px-4 py-3 rounded-2xl shadow-2xl cursor-pointer hover:scale-105 transition-all group backdrop-blur-md animate-in fade-in slide-in-from-bottom-3"
        title="Cliquer pour agrandir la fenêtre du Carnet IA"
      >
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Carnet IA Réduit
            </span>
            {draft && (
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-bold">
                ✓ Ébauche prête
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-200 truncate max-w-[150px] sm:max-w-[200px]">
            {query || 'Investigation active'}
          </p>
        </div>
        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 group-hover:text-slate-950 group-hover:bg-amber-400 transition ml-1">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop semi-transparent sur mobile pour fermer ou minimiser en cliquant à l'extérieur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[65] sm:hidden animate-in fade-in"
        onClick={() => setIsMinimized(true)}
      />

      {/* Panneau latéral rétractable (Drawer) - z-[70] pour être strictement AU-DESSUS de la navbar (z-50) */}
      <div 
        className="fixed inset-y-0 right-0 z-[70] w-full sm:w-[560px] lg:w-[620px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 max-h-screen overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec boutons Réduire et Fermer */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Espace Séparé d'Investigation
              </span>
              <h2 className="text-sm font-black text-white">
                Carnet de Recherche & Sourcing IA
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsEthicsModalOpen(true)}
              className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition p-1.5 rounded-lg hover:bg-slate-800"
              title="Consulter la Charte Déontologique signée"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Charte</span>
            </button>

            {/* Bouton Réduire / Minimiser */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Minimiser la fenêtre IA (languette flottante)"
            >
              <Minus className="w-5 h-5" />
            </button>

            {/* Bouton Fermer */}
            <button
              type="button"
              onClick={() => {
                setIsMinimized(false);
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Fermer le carnet de recherche"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Note déontologique permanente */}
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 text-slate-350">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Espace isolé : l'IA ne modifie pas votre texte brut.
          </span>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
            100% Plume Auteur
          </span>
        </div>

        {/* Formulaire de recherche de faits */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 space-y-3 shrink-0">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sujet d'investigation ou fait à sourcer
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLaunchSearch())}
                  placeholder="Ex: Réforme du code pénal, match Haïti vs Mexique..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <button
                type="button"
                onClick={handleLaunchSearch}
                disabled={isLoading || !query.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-amber-950/30 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                Sourcer
              </button>
            </div>
          </div>

          {/* Ligne d'actions : Angle + Bouton discret de rédaction IA */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Angle :</span>
              {(['factual', 'analysis', 'investigation'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition ${
                    tone === t
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {t === 'factual' ? 'Factuel' : t === 'analysis' ? 'Décryptage' : 'Enquête'}
                </button>
              ))}
            </div>

            {/* Bouton discret permettant à l'IA de rédiger une proposition */}
            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={isGeneratingDraft || !query.trim()}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-lg transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              title="Demander à l'IA de proposer une ébauche rédigée complète dans son onglet dédié"
            >
              {isGeneratingDraft ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                  Rédaction en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  ✦ Proposer une rédaction IA (Brouillon)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Zone des résultats défilable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong>Erreur :</strong> {error}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Recherche et recoupement en cours...</p>
                <p className="text-[11px] text-slate-400">Consultation des dépêches de presse et structuration des sources réelles.</p>
              </div>
            </div>
          )}

          {!isLoading && !data && !draft && !error && (
            <div className="py-14 text-center space-y-3 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <BookOpen className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xs font-bold text-slate-300">Votre carnet de recherche est vierge</h3>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                Lancez une recherche sur un fait d'actualité pour obtenir une fiche factuelle, les sources médias avec liens directs, ou demandez une proposition de rédaction IA.
              </p>
            </div>
          )}

          {(!isLoading && (data || draft)) && (
            <div className="space-y-4">
              {/* Synthèse globale neutre */}
              {data?.summary && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Briefing de synthèse factuelle :
                  </div>
                  {data.summary}
                </div>
              )}

              {/* Barre d'onglets thématiques incluant l'onglet Rédaction IA */}
              <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab('facts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'facts'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Faits ({data?.keyFacts?.length || 0})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('sources')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'sources'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Sources ({data?.sources?.length || 0})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'timeline'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Chronologie
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('angles')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'angles'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  Angles
                </button>

                {/* Onglet IA dédié pour la rédaction */}
                <button
                  type="button"
                  onClick={() => setActiveTab('draft')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    activeTab === 'draft'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-amber-400/90 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  ✍️ Rédaction IA {draft && '✓'}
                </button>
              </div>

              {/* 1. Contenu de l'onglet Faits */}
              {activeTab === 'facts' && (
                <div className="space-y-2.5">
                  {data?.keyFacts && data.keyFacts.length > 0 ? (
                    data.keyFacts.map((f, idx) => (
                      <div
                        key={f.id || idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition space-y-1.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-white leading-snug">
                            {f.fact}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopy(`${f.fact}${f.detail ? ` (${f.detail})` : ''}`, `fact_${idx}`)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition shrink-0"
                            title="Copier ce fait"
                          >
                            {copiedId === `fact_${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {f.detail && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {f.detail}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Aucun fait saillant extrait pour l'instant.</p>
                  )}
                </div>
              )}

              {/* 2. Contenu de l'onglet Sources */}
              {activeTab === 'sources' && (
                <div className="space-y-3">
                  {data?.sources && data.sources.length > 0 ? (
                    data.sources.map((src, idx) => (
                      <div
                        key={src.id || idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                              {src.media}
                            </span>
                            <h4 className="text-xs font-bold text-white mt-0.5 leading-snug">
                              {src.title}
                            </h4>
                          </div>
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition shrink-0"
                            title="Ouvrir la source originale"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {src.summary && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {src.summary}
                          </p>
                        )}

                        {/* Citation & Boutons d'action pour l'éditeur */}
                        <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-2">
                          {onInsertQuote && (src.keyQuote || src.title) && (
                            <button
                              type="button"
                              onClick={() => onInsertQuote({
                                quote: src.keyQuote || src.title,
                                media: src.media,
                                url: src.url,
                              })}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition flex items-center gap-1 cursor-pointer"
                              title="Insérer cette citation avec sa source dans l'article"
                            >
                              <Quote className="w-3 h-3" />
                              Citer cette source
                            </button>
                          )}

                          {onInsertLink && (
                            <button
                              type="button"
                              onClick={() => onInsertLink({
                                text: `${src.media} : ${src.title}`,
                                url: src.url,
                              })}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white border border-slate-800 transition flex items-center gap-1 cursor-pointer"
                              title="Insérer le lien hypertexte de cette source"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Insérer le lien
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Aucune source de presse trouvée.</p>
                  )}
                </div>
              )}

              {/* 3. Contenu de l'onglet Chronologie */}
              {activeTab === 'timeline' && (
                <div className="relative pl-5 border-l-2 border-slate-800 space-y-4 my-2">
                  {data?.timeline && data.timeline.length > 0 ? (
                    data.timeline.map((item, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-slate-900" />
                        <span className="text-[10px] font-black uppercase text-amber-400">
                          {item.date}
                        </span>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                          {item.event}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Aucune chronologie disponible.</p>
                  )}
                </div>
              )}

              {/* 4. Contenu de l'onglet Angles */}
              {activeTab === 'angles' && (
                <div className="space-y-2.5">
                  {data?.investigativeAngles && data.investigativeAngles.length > 0 ? (
                    data.investigativeAngles.map((a, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1"
                      >
                        <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-amber-400" />
                          {a.angle}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {a.question}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Aucun angle suggéré.</p>
                  )}
                </div>
              )}

              {/* 5. Contenu de l'onglet Rédaction IA (Affichage Formaté Épuré) */}
              {activeTab === 'draft' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Avertissement éthique & Déontologique */}
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-amber-400 font-bold text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Espace Isolé : Proposition Rédactionnelle IA
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {draft ? `~${draft.split(/\s+/).filter(Boolean).length} mots` : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-350 leading-relaxed">
                      Ce texte n'est pas injecté dans votre article. Utilisez-le comme ébauche de travail. Vérifiez chaque affirmation auprès des sources citées et adaptez-le de votre propre plume.
                    </p>
                  </div>

                  {draft ? (
                    <div className="space-y-3">
                      {/* Bouton de régénération discrète */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleGenerateDraft}
                          disabled={isGeneratingDraft}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          {isGeneratingDraft ? (
                            <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                          ) : (
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                          )}
                          Régénérer une autre proposition
                        </button>
                      </div>

                      {/* Composant de rendu Markdown Formaté Élégant */}
                      <FormattedAiDraft content={draft} />
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-3 bg-slate-950/60 rounded-xl border border-slate-800/80 p-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Aucune ébauche générée pour l'instant</h4>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Cliquez sur le bouton ci-dessous pour demander une première proposition d'article structuré basé sur votre carnet documentaire.
                      </p>
                      <button
                        type="button"
                        onClick={handleGenerateDraft}
                        disabled={isGeneratingDraft || !query.trim()}
                        className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/30"
                      >
                        {isGeneratingDraft ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Rédaction en cours...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Générer la proposition de rédaction
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'engagement éthique */}
      <AiEthicsModal
        isOpen={isEthicsModalOpen}
        onClose={() => setIsEthicsModalOpen(false)}
        onAccept={() => {
          setHasAcceptedEthics(true);
          setIsEthicsModalOpen(false);
          handleLaunchSearch();
        }}
      />
    </>
  );
}
