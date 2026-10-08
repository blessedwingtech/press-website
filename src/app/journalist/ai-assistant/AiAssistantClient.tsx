'use client';

import { useState, useMemo, useEffect } from 'react';
import { Loader2, Search, PenTool, CheckCircle, AlertTriangle, Layers, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function AiAssistantClient({ menus, authorId }: { menus: Menu[]; authorId: string }) {
  const [topic, setTopic] = useState('');
  const [selectedMenu, setSelectedMenu] = useState(menus[0]?.id || '');
  const [selectedSubmenu, setSelectedSubmenu] = useState('');
  const [tone, setTone] = useState<'factual' | 'analysis' | 'investigation'>('factual');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'searching' | 'writing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // Filtrer les sous-menus selon le menu choisi
  const currentMenu = useMemo(() => {
    return menus.find((m) => m.id === selectedMenu);
  }, [menus, selectedMenu]);

  const availableSubmenus = useMemo(() => {
    return currentMenu?.submenus || [];
  }, [currentMenu]);

  // Réinitialiser le sous-menu quand la catégorie change
  useEffect(() => {
    setSelectedSubmenu('');
  }, [selectedMenu]);

  const handleGenerate = async () => {
    if (!topic || !selectedMenu) return;

    setIsLoading(true);
    setStatus('searching');
    setErrorMessage('');

    // Transition visuelle vers l'étape de rédaction après 3 secondes
    const writingTimer = setTimeout(() => {
      setStatus('writing');
    }, 3000);

    try {
      const response = await fetch('/api/ai/generate-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          menuId: selectedMenu,
          submenuId: selectedSubmenu || null,
          tone,
          authorId,
        }),
      });

      clearTimeout(writingTimer);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la génération de l'article.");
      }

      setStatus('success');

      // Rediriger vers l'éditeur avec l'ID du nouvel article brouillon
      setTimeout(() => {
        router.push(`/journalist/articles/edit/${data.articleId}`);
      }, 1500);
    } catch (error: any) {
      clearTimeout(writingTimer);
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-3xl shadow-xl">
      <div className="space-y-6">
        {/* Sujet de recherche */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">
            Quel sujet d&apos;actualité souhaitez-vous couvrir ?
          </label>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Ex: Mercato Ligue des Champions, Intelligence Artificielle générative, Sommet diplomatique..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              disabled={isLoading}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            L&apos;IA scannera le web en direct (GNews &amp; Google News) pour collecter les faits les plus récents et vérifiés.
          </p>
        </div>

        {/* Sélection Catégorie & Sous-rubrique */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" /> Catégorie principale
            </label>
            <select
              value={selectedMenu}
              onChange={(e) => setSelectedMenu(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3.5 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
              disabled={isLoading}
            >
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" /> Sous-rubrique (optionnel)
            </label>
            <select
              value={selectedSubmenu}
              onChange={(e) => setSelectedSubmenu(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-3.5 text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer disabled:opacity-50"
              disabled={isLoading || availableSubmenus.length === 0}
            >
              <option value="">-- Aucune (Rubrique globale) --</option>
              {availableSubmenus.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Angle éditorial / Ton */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400" /> Angle &amp; Format journalistique
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTone('factual')}
              disabled={isLoading}
              className={`p-3 rounded-xl border text-left transition-all ${
                tone === 'factual'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="block text-xs font-black text-amber-400">Dépêche Factuelle</span>
              <span className="block text-[11px] text-slate-400 mt-1 leading-snug">
                Synthèse directe, chronologique et rapide des faits majeurs.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTone('analysis')}
              disabled={isLoading}
              className={`p-3 rounded-xl border text-left transition-all ${
                tone === 'analysis'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="block text-xs font-black text-amber-400">Analyse &amp; Décryptage</span>
              <span className="block text-[11px] text-slate-400 mt-1 leading-snug">
                Mise en perspective, causes, conséquences et avis d&apos;experts.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTone('investigation')}
              disabled={isLoading}
              className={`p-3 rounded-xl border text-left transition-all ${
                tone === 'investigation'
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <span className="block text-xs font-black text-amber-400">Grand Dossier</span>
              <span className="block text-[11px] text-slate-400 mt-1 leading-snug">
                Immersion approfondie, comparatif de sources et synthèse critique.
              </span>
            </button>
          </div>
        </div>

        {/* Bouton de déclenchement */}
        <button
          onClick={handleGenerate}
          disabled={!topic || isLoading}
          className="w-full flex justify-center items-center gap-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20 text-sm tracking-wide"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <PenTool className="w-5 h-5" />
          )}
          {isLoading ? 'Génération du dossier en cours...' : 'Générer le brouillon journalistique'}
        </button>

        {/* Indicateurs de progression interactifs */}
        {status !== 'idle' && (
          <div
            className={`p-4 rounded-xl border transition-all ${
              status === 'error'
                ? 'bg-red-950/30 border-red-900/50 text-red-400'
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              {status === 'searching' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500 flex-shrink-0" />
                  <span>
                    <strong>Étape 1/3 :</strong> Veille et extraction des actualités vérifiées (GNews &amp; Google News)...
                  </span>
                </>
              )}
              {status === 'writing' && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500 flex-shrink-0" />
                  <span>
                    <strong>Étape 2/3 :</strong> Rédaction de l&apos;article (pyramide inversée, sources &amp; illustration Unsplash)...
                  </span>
                </>
              )}
              {status === 'success' && (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 font-bold">
                    Succès ! Brouillon créé avec sources. Redirection vers l&apos;éditeur...
                  </span>
                </>
              )}
              {status === 'error' && (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-red-400">{errorMessage}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
