'use client';

import { useState } from 'react';
import { Loader2, Search, PenTool, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Menu {
  id: string;
  nom: string;
  submenus: any[];
}

export default function AiAssistantClient({ menus, authorId }: { menus: Menu[], authorId: string }) {
  const [topic, setTopic] = useState('');
  const [selectedMenu, setSelectedMenu] = useState(menus[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'searching' | 'writing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleGenerate = async () => {
    if (!topic || !selectedMenu) return;
    
    setIsLoading(true);
    setStatus('searching');
    setErrorMessage('');

    try {
      // Étape 1 : Appel à notre route API qui va orchestrer GNews + Gemini
      const response = await fetch('/api/ai/generate-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, menuId: selectedMenu, authorId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération de l\'article.');
      }

      setStatus('success');
      
      // Rediriger vers l'éditeur avec l'ID du nouvel article brouillon après 2 secondes
      setTimeout(() => {
        router.push(`/journalist/articles/edit/${data.articleId}`);
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Quel sujet souhaitez-vous couvrir ?</label>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Ex: Mercato PSG, Intelligence Artificielle, Élections..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">Catégorie (Menu)</label>
          <select
            value={selectedMenu}
            onChange={(e) => setSelectedMenu(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            disabled={isLoading}
          >
            {menus.map(menu => (
              <option key={menu.id} value={menu.id}>{menu.nom}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic || isLoading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/20"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <PenTool className="w-5 h-5" />
          )}
          {isLoading ? 'Travail en cours...' : 'Générer le brouillon de l\'article'}
        </button>

        {/* Status Indicators */}
        {status !== 'idle' && (
          <div className={`p-4 rounded-xl border ${status === 'error' ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
            <div className="flex items-center gap-3">
              {status === 'searching' && <><Loader2 className="w-4 h-4 animate-spin text-amber-500" /> <span>Étape 1/3 : Recherche des dernières actualités (GNews)...</span></>}
              {status === 'writing' && <><Loader2 className="w-4 h-4 animate-spin text-amber-500" /> <span>Étape 2/3 : Analyse et rédaction par l'IA (Gemini)...</span></>}
              {status === 'success' && <><CheckCircle className="w-4 h-4 text-emerald-500" /> <span className="text-emerald-400 font-bold">Succès ! Brouillon créé. Redirection vers l'éditeur...</span></>}
              {status === 'error' && <><AlertTriangle className="w-4 h-4" /> <span>{errorMessage}</span></>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
