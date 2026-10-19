'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  Search,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Layers,
  Compass,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  FileText,
  Quote,
  RotateCcw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AiEthicsModal from '@/components/AiEthicsModal';

interface SubMenu {
  id: string;
  nom: string;
  slug: string;
}

interface Menu {
  id: string;
  nom: string;
  submenus: SubMenu[];
}

interface ResearchData {
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

export default function AiAssistantClient({ menus, authorId }: { menus: Menu[]; authorId: string }) {
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'factual' | 'analysis' | 'investigation'>('factual');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [activeTab, setActiveTab] = useState<'dossier' | 'draft'>('dossier');
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleStartSearch = async () => {
    if (!topic.trim()) return;

    if (!hasAcceptedEthics) {
      setIsEthicsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setStatus('searching');
    setErrorMessage('');

    try {
      const response = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: topic.trim(),
          tone,
        }),
      });

      const raw = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        throw new Error('Réponse invalide du serveur de recherche.');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de la collecte des informations.');
      }

      setResearchData(data.data);
      setStatus('success');
      setActiveTab('dossier');
    } catch (err: any) {
      console.error('Erreur recherche IA:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Impossible d\'effectuer la recherche.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!topic.trim()) return;

    if (!hasAcceptedEthics) {
      setIsEthicsModalOpen(true);
      return;
    }

    setIsGeneratingDraft(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          tone,
          researchData,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de la génération de l\'ébauche.');
      }

      setAiDraft(data.draft);
      setActiveTab('draft');
    } catch (err: any) {
      console.error('Erreur draft IA:', err);
      setErrorMessage(err.message || 'Impossible de générer l\'ébauche.');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleOpenEditorWithCarnet = () => {
    try {
      const payload = {
        topic: topic.trim(),
        data: researchData,
        draft: aiDraft,
        timestamp: Date.now(),
      };
      sessionStorage.setItem('presstonik_active_carnet', JSON.stringify(payload));
    } catch (e) {
      console.warn('Erreur stockage carnet session:', e);
    }

    router.push(`/journalist/articles/new?research=${encodeURIComponent(topic.trim())}`);
  };

  return (
    <div className="space-y-8">
      {/* 1. Charte Déontologique & Avertissement Éthique */}
      <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Déontologie Rédactionnelle
              </span>
              {hasAcceptedEthics ? (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" /> Charte Signée
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded">
                  Signature requise
                </span>
              )}
            </div>
            <p className="text-xs text-slate-350 leading-relaxed max-w-2xl">
              L'IA n'écrit pas à votre place : cet outil constitue votre <strong>carnet de recherche documentaire séparé</strong>. Tout fait rapporté doit être vérifié auprès des sources indiquées avant d'être intégré dans vos écrits personnels.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEthicsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-slate-950/80 hover:bg-slate-800 border border-amber-500/30 transition self-start sm:self-center shrink-0 cursor-pointer"
        >
          {hasAcceptedEthics ? 'Relire la Charte' : 'Signer la Charte'}
        </button>
      </div>

      {/* 2. Formulaire d'Investigation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div>
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400" />
            Lancer une Investigation Documentaire
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Indiquez un sujet d'actualité pour extraire les faits clés, les dates et les liens vers les dépêches de presse.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Sujet de recherche ou fait d'actualité
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleStartSearch())}
                  placeholder="Ex: Élections présidentielles, avancée de l'IA en médecine, crise agricole..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition shadow-inner"
                />
              </div>

              <button
                type="button"
                onClick={handleStartSearch}
                disabled={isLoading || !topic.trim()}
                className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-amber-950/40 shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Investigation en cours...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    Sourcer le sujet
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ligne d'options : Angles + Bouton discret de rédaction IA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Angle d'analyse :
              </span>
              <div className="flex items-center gap-1.5">
                {(['factual', 'analysis', 'investigation'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      tone === t
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {t === 'factual' ? 'Factuel & Neutre' : t === 'analysis' ? 'Décryptage Approfondi' : 'Enquête Critique'}
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton discret permettant à l'IA de rédiger une proposition */}
            {topic.trim().length >= 3 && (
              <button
                type="button"
                onClick={handleGenerateDraft}
                disabled={isGeneratingDraft}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm"
                title="Demander une proposition d'ébauche rédigée par l'IA dans l'onglet dédié"
              >
                {isGeneratingDraft ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    Rédaction en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    ✦ Demander une proposition de rédaction IA
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <strong>Erreur :</strong> {errorMessage}
            </div>
          </div>
        )}
      </div>

      {/* 3. Résultats du Carnet de Recherche & Sourcing */}
      {(researchData || aiDraft) && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Dossier Documentaire Préparé
              </span>
              <h2 className="text-xl font-black text-white mt-0.5">
                {topic}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Bouton discret de rédaction IA s'il n'y a pas encore d'ébauche */}
              {!aiDraft && (
                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  disabled={isGeneratingDraft}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition flex items-center gap-2 cursor-pointer"
                >
                  {isGeneratingDraft ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  )}
                  Proposer une rédaction IA
                </button>
              )}

              {/* Bouton pour ouvrir l'éditeur avec ce carnet (remplit le titre et charge le carnet) */}
              <button
                type="button"
                onClick={handleOpenEditorWithCarnet}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <FileText className="w-4 h-4" />
                Rédiger l'article avec ce carnet
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Onglets principaux du résultat */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('dossier')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'dossier'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-400" />
              Dossier de Faits & Sources
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('draft')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'draft'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30'
              }`}
            >
              <FileText className="w-4 h-4" />
              ✍️ Onglet Rédaction IA {aiDraft && '✓'}
            </button>
          </div>

          {/* ONGLET 1 : DOSSIER DE FAITS & SOURCES */}
          {activeTab === 'dossier' && researchData && (
            <div className="space-y-6">
              {/* Synthèse globale */}
              {researchData.summary && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Briefing de synthèse factuelle
                  </span>
                  {researchData.summary}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Colonne 1 : Faits Clés Vérifiés */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Faits & Chiffres Vérifiables ({researchData.keyFacts?.length || 0})
                  </h3>

                  <div className="space-y-2.5">
                    {researchData.keyFacts?.map((f, idx) => (
                      <div
                        key={f.id || idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-white leading-snug">
                            {f.fact}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleCopy(`${f.fact}${f.detail ? ` (${f.detail})` : ''}`, `fact_${idx}`)}
                            className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition shrink-0"
                            title="Copier ce fait"
                          >
                            {copiedId === `fact_${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {f.detail && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {f.detail}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colonne 2 : Sources & Médias Cités */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-cyan-400" />
                    Sources de Presse & Liens Officiels ({researchData.sources?.length || 0})
                  </h3>

                  <div className="space-y-3">
                    {researchData.sources?.map((src, idx) => (
                      <div
                        key={src.id || idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
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
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition shrink-0"
                            title="Consulter la source originale"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {src.summary && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {src.summary}
                          </p>
                        )}

                        {src.keyQuote && (
                          <div className="p-2 rounded-lg bg-slate-900/80 border-l-2 border-amber-500 text-[11px] text-slate-300 italic">
                            « {src.keyQuote} »
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chronologie & Angles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                {/* Chronologie */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Chronologie des Événements
                  </h3>
                  <div className="relative pl-5 border-l-2 border-slate-800 space-y-3">
                    {researchData.timeline?.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-slate-900" />
                        <span className="text-[10px] font-black uppercase text-amber-400">
                          {item.date}
                        </span>
                        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                          {item.event}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pistes d'Investigation */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    Angles & Questions d'Investigation
                  </h3>
                  <div className="space-y-2.5">
                    {researchData.investigativeAngles?.map((a, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <h4 className="text-xs font-bold text-emerald-300 mb-1">
                          {a.angle}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {a.question}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 2 : RÉDACTION & ÉBAUCHE IA (ESPACE SÉPARÉ ET COPIABLE) */}
          {activeTab === 'draft' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Cadre de sensibilisation éthique */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Espace Isolé : Proposition de Rédaction IA
                  </span>
                  {aiDraft && (
                    <span className="text-xs font-bold text-slate-400">
                      ~{aiDraft.split(/\s+/).filter(Boolean).length} mots
                    </span>
                  )}
                </div>
                <p className="text-slate-350 text-xs leading-relaxed">
                  Cette proposition rédactionnelle est un <strong>brouillon consultatif</strong>. Elle n'est jamais injectée dans votre éditeur principal. Vous devez vérifier chaque affirmation auprès des sources et vous approprier le texte avec votre plume souveraine.
                </p>
              </div>

              {aiDraft ? (
                <div className="space-y-4">
                  {/* Actions : Copier toute l'ébauche + Régénérer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleCopy(aiDraft, 'main_draft_full')}
                      className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/30"
                    >
                      {copiedId === 'main_draft_full' ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          ✓ Proposition copiée !
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copier toute la rédaction
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateDraft}
                      disabled={isGeneratingDraft}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center gap-2 cursor-pointer"
                    >
                      {isGeneratingDraft ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      ) : (
                        <RotateCcw className="w-4 h-4 text-amber-400" />
                      )}
                      Régénérer une autre proposition
                    </button>
                  </div>

                  {/* Contenu textuel rédigé */}
                  <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans selection:bg-amber-500/30 select-text">
                    {aiDraft}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-4 bg-slate-950/60 rounded-2xl border border-slate-800 p-8">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Aucune ébauche générée pour l'instant</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Demandez à l'IA d'élaborer une première trame d'article journalistique basée sur les faits et sources collectés ci-contre.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateDraft}
                    disabled={isGeneratingDraft}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/30"
                  >
                    {isGeneratingDraft ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rédaction de l'ébauche en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Générer la proposition de rédaction IA
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal d'engagement éthique */}
      <AiEthicsModal
        isOpen={isEthicsModalOpen}
        onClose={() => setIsEthicsModalOpen(false)}
        onAccept={() => {
          setHasAcceptedEthics(true);
          setIsEthicsModalOpen(false);
          handleStartSearch();
        }}
      />
    </div>
  );
}
