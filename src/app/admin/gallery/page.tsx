'use client';

import { useState, useEffect } from 'react';
import { Trash2, Upload, Loader2 } from 'lucide-react';

interface GalleryImage {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  createdAt: string;
}

export default function GalleryAdmin() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/gallery');
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setImages(data);
    } catch {
      setError('Impossible de charger les images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Sélectionnez une image');
      return;
    }
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    try {
      const res = await fetch('/api/gallery/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur upload');
      setFile(null);
      setTitle('');
      setDescription('');
      await fetchImages();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette image ?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur suppression');
      await fetchImages();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Gestion de la Galerie</h1>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded text-rose-400 text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-600 cursor-pointer"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Titre (optionnel)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            placeholder="Ex: Équipe de dev"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Description (optionnelle)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            placeholder="Une courte description"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg hover:bg-emerald-600 transition disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Upload en cours...' : 'Ajouter à la galerie'}
        </button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Chargement...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Aucune image dans la galerie.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
              <img src={img.url} alt={img.title || 'Image'} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {img.title && <p className="text-white font-bold text-sm">{img.title}</p>}
                {img.description && <p className="text-slate-300 text-xs">{img.description}</p>}
                <button
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-500/80 rounded-lg hover:bg-rose-600 transition"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
