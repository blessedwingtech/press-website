'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, X, Check, Image as ImageIcon } from 'lucide-react';
import SafeImage from './SafeImage';

interface UnsplashPhoto {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

interface UnsplashImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  defaultQuery?: string;
}

export default function UnsplashImageModal({
  isOpen,
  onClose,
  onSelectImage,
  defaultQuery = '',
}: UnsplashImageModalProps) {
  const [query, setQuery] = useState(defaultQuery);
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPhotos = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/ai/unsplash-search?q=${encodeURIComponent(searchQuery)}&per_page=8`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la recherche.');
      }

      setPhotos(data.images || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Impossible de charger les images Unsplash.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const q = defaultQuery.trim() || 'journalisme actualités';
      setQuery(q);
      searchPhotos(q);
    }
  }, [isOpen, defaultQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Choisir une illustration Unsplash</h3>
              <p className="text-xs text-slate-400">Photos gratuites et libres de droits en haute définition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-slate-950/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchPhotos(query);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-grow">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher des images (ex: sport, économie, technologie, paris...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Rechercher</span>
            </button>
          </form>
        </div>

        {/* Photos Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {error && (
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-xs mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-xs">Recherche des photos en cours...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              Aucune image trouvée pour cette recherche. Essayez d&apos;autres mots-clés.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => {
                    onSelectImage(photo.url);
                    onClose();
                  }}
                  className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 hover:border-emerald-500/80 cursor-pointer transition-all hover:scale-[1.02] shadow-md aspect-[16/10]"
                >
                  <SafeImage
                    src={photo.thumb}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="self-end p-1 bg-emerald-500 text-slate-950 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-[10px] text-slate-300 truncate">
                      Photo : {photo.photographer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-between items-center text-[11px] text-slate-500">
          <span>Photos fournies par Unsplash</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 transition text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
