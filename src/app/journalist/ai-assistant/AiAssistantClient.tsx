'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Loader2,
  Search,
  PenTool,
  CheckCircle,
  AlertTriangle,
  Layers,
  Compass,
  Image as ImageIcon,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import SafeImage from '@/components/SafeImage';
import UnsplashImageModal from '@/components/UnsplashImageModal';
import { updateArticleCoverImage } from '@/app/journalist/actions';

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

interface CandidateImage {
  id: string;
  url: string;
  thumb: string;
  photographer: string;
}

interface GeneratedResult {
  articleId: string;
  titre: string;
  coverImage: string;
  candidateImages: CandidateImage[];
  imageQuery: string;
}

export default function AiAssistantClient({ menus, authorId }: { menus: Menu[]; authorId: string }) {
  const [topic, setTopic] = useState('');
  const [selectedMenu, setSelectedMenu] = useState(menus[0]?.id || '');
  const [selectedSubmenu, setSelectedSubmenu] = useState('');
  const [tone, setTone] = useState<'factual' | 'analysis' | 'investigation'>('factual');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'searching' | 'writing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Résultat généré & sélection d'illustration
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setGeneratedResult(null);

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

      setGeneratedResult(data);
      setSelectedImage(data.coverImage);
      setStatus('success');
    } catch (error: any) {
      clearTimeout(writingTimer);
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectImage = async (imageUrl: string) => {
    if (!generatedResult || imageUrl === selectedImage) return;

    setSelectedImage(imageUrl);
    setIsUpdatingImage(true);

    try {
      await updateArticleCoverImage(generatedResult.articleId, imageUrl);
    } catch (err) {
      console.error('Erreur mise à jour image:', err);
    } finally {
      setIsUpdatingImage(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Formulaire de configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
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
              L&apos;IA effectue une recherche en ligne en temps réel pour collecter les faits vérifiés et vous proposera plusieurs illustrations HD.
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
            className="w-full flex justify-center items-center gap-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20 text-sm tracking-wide cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <PenTool className="w-5 h-5" />
            )}
            {isLoading ? 'Génération du dossier en cours...' : 'Générer le brouillon journalistique'}
          </button>

          {/* Indicateurs de progression interactifs */}
          {status !== 'idle' && status !== 'success' && (
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
                      <strong>Étape 2/3 :</strong> Rédaction de l&apos;article et recherche des illustrations Unsplash...
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

      {/* SECTION DU CHOIX D'ILLUSTRATION & VALIDATION (Apparaît dès que l'article est prêt) */}
      {generatedResult && (
        <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full mb-2">
                <CheckCircle className="w-4 h-4" /> Brouillon rédigé avec succès
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                {generatedResult.titre}
              </h2>
            </div>
            <button
              onClick={() => router.push(`/journalist/articles/edit/${generatedResult.articleId}`)}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50 flex-shrink-0"
            >
              <span>Ouvrir dans l&apos;éditeur</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Choix de l'illustration */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  Choisissez votre illustration de couverture :
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cliquez sur l&apos;image que vous préférez parmi les suggestions Unsplash trouvées pour ce sujet :
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 self-start sm:self-auto hover:underline"
              >
                <Search className="w-3.5 h-3.5" /> Chercher d&apos;autres photos
              </button>
            </div>

            {/* Grille des photos candidates */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
              {(generatedResult.candidateImages || []).map((img) => {
                const isSelected = selectedImage === img.url;
                return (
                  <div
                    key={img.id}
                    onClick={() => handleSelectImage(img.url)}
                    className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-[16/10] bg-slate-950 ${
                      isSelected
                        ? 'border-emerald-500 ring-4 ring-emerald-500/20 scale-[1.02] shadow-xl'
                        : 'border-slate-800 hover:border-slate-600 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <SafeImage
                      src={img.thumb || img.url}
                      alt="Illustration candidate"
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />

                    {/* Badge de sélection */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 p-1.5 bg-emerald-500 text-slate-950 rounded-full shadow-lg z-10 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Photographe */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] text-slate-300 truncate">
                      Photo : {img.photographer}
                    </div>
                  </div>
                );
              })}
            </div>

            {isUpdatingImage && (
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                Mise à jour de l&apos;illustration de l&apos;article...
              </p>
            )}
          </div>

          {/* Bouton bas de validation */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => router.push(`/journalist/articles/edit/${generatedResult.articleId}`)}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-950/50"
            >
              <span>Valider cette illustration et passer à la relecture</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de recherche manuelle supplémentaire Unsplash */}
      <UnsplashImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectImage={(url) => handleSelectImage(url)}
        defaultQuery={generatedResult?.imageQuery || topic}
      />
    </div>
  );
}
