'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { saveArticle } from '@/app/journalist/actions';
import { ArrowLeft, Save, Sparkles, Upload, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

// Chargement dynamique de ReactQuill pour éviter les erreurs SSR de compilation
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    await import('react-quill/dist/quill.snow.css');
    return RQ;
  },
  { ssr: false, loading: () => <div className="h-64 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-xs">Chargement de l'éditeur de texte...</div> }
);

interface SubMenuData {
  id: string;
  nom: string;
  slug: string;
  menuId: string;
}

interface MenuData {
  id: string;
  nom: string;
  slug: string;
  submenus: SubMenuData[];
}

interface ArticleFormProps {
  menus: MenuData[];
  initialData?: {
    id: string;
    titre: string;
    contenu: string;
    imagePrincipale: string;
    menuId: string;
    submenuId: string | null;
  };
}

export default function ArticleForm({ menus, initialData }: ArticleFormProps) {
  const router = useRouter();
  const quillRef = useRef<any>(null);

  const [titre, setTitre] = useState(initialData?.titre || '');
  const [contenu, setContenu] = useState(initialData?.contenu || '');
  const [imagePrincipale, setImagePrincipale] = useState(initialData?.imagePrincipale || '');
  const [menuId, setMenuId] = useState(initialData?.menuId || '');
  const [submenuId, setSubmenuId] = useState(initialData?.submenuId || '');
  
  const [uploadingMain, setUploadingMain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [autosaved, setAutosaved] = useState(false);

  // Filtrer les sous-menus en fonction du menu sélectionné
  const availableSubmenus = useMemo(() => {
    const selectedMenu = menus.find((m) => m.id === menuId);
    return selectedMenu ? selectedMenu.submenus : [];
  }, [menuId, menus]);

  // Si le menu change et que le sous-menu actuel n'y appartient pas, on le réinitialise
  useEffect(() => {
    if (menuId && availableSubmenus.length > 0) {
      const isStillValid = availableSubmenus.some((sub) => sub.id === submenuId);
      if (!isStillValid) setSubmenuId('');
    } else {
      setSubmenuId('');
    }
  }, [menuId, availableSubmenus, submenuId]);

  // Détecter et proposer de restaurer un brouillon sauvegardé localement
  useEffect(() => {
    if (initialData) return; // Pas d'autosave en mode édition
    
    const savedDraft = localStorage.getItem('chronos_draft_autosave');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Si le formulaire est totalement vide, on charge ou on propose
        if (!titre && !contenu && !imagePrincipale) {
          if (confirm('Un brouillon enregistré localement a été trouvé. Souhaitez-vous le restaurer ?')) {
            setTitre(draft.titre || '');
            setContenu(draft.contenu || '');
            setImagePrincipale(draft.imagePrincipale || '');
            setMenuId(draft.menuId || '');
            setSubmenuId(draft.submenuId || '');
          } else {
            localStorage.removeItem('chronos_draft_autosave');
          }
        }
      } catch (e) {
        console.error('Failed to parse autosave draft', e);
      }
    }
  }, [initialData]);

  // Gestionnaire d'Autosave (toutes les 30 secondes)
  useEffect(() => {
    if (initialData) return; // Ne pas autosave en mode édition

    const interval = setInterval(() => {
      if (titre.trim() || contenu.trim() || imagePrincipale) {
        const draftData = { titre, contenu, imagePrincipale, menuId, submenuId };
        localStorage.setItem('chronos_draft_autosave', JSON.stringify(draftData));
        setAutosaved(true);
        setTimeout(() => setAutosaved(false), 3000);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [titre, contenu, imagePrincipale, menuId, submenuId, initialData]);

  // Gestionnaire d'upload d'images dans l'éditeur (Rich Text)
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (data.url) {
            const quill = quillRef.current?.getEditor();
            if (quill) {
              const range = quill.getSelection();
              if (range) {
                quill.insertEmbed(range.index, 'image', data.url);
              }
            }
          } else {
            alert(data.error || 'Erreur lors de l’importation de l’image');
          }
        } catch (e) {
          alert('Une erreur réseau s’est produite lors de l’upload.');
        }
      }
    };
  };

  // Options Quill Editor
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), []);

  // Upload d'image principale
  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMain(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setImagePrincipale(data.url);
      } else {
        setError(data.error || 'Impossible d’uploader l’image principale.');
      }
    } catch (err) {
      setError('Erreur réseau lors de l’upload.');
    } finally {
      setUploadingMain(false);
    }
  };

  // Envoi final
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation client simple
    if (!titre.trim() || titre.trim().length < 5) {
      setError('Le titre doit contenir au moins 5 caractères.');
      setLoading(false);
      return;
    }
    if (!contenu.trim() || contenu.trim().length < 20) {
      setError('Le contenu rédactionnel est trop court (min: 20 caractères).');
      setLoading(false);
      return;
    }
    if (!imagePrincipale) {
      setError('L’image d’illustration principale est obligatoire.');
      setLoading(false);
      return;
    }
    if (!menuId) {
      setError('Veuillez affecter l’article à un menu.');
      setLoading(false);
      return;
    }

    try {
      const res = await saveArticle(initialData?.id, {
        titre,
        contenu,
        imagePrincipale,
        menuId,
        submenuId: submenuId || null,
      });

      if (res.success) {
        setSuccess(true);
        // Supprimer le brouillon local à la soumission réussie
        if (!initialData) {
          localStorage.removeItem('chronos_draft_autosave');
        }
        setTimeout(() => {
          router.push(`/articles/${res.slug}`);
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur serveur lors de la validation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/journalist"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
              {initialData ? 'Modifier l’Article' : 'Composer un Article'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {initialData ? `Édition du contenu : ${initialData.titre}` : 'Créez un nouvel article d’information ou sportif'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {autosaved && (
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> Brouillon sauvegardé
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-xs font-semibold text-rose-400">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs font-semibold text-emerald-450">
          Enregistrement réussi ! Redirection en cours...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
          
          {/* Titre */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Titre de l'article
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Ex: Ligue 1 : Le PSG l'emporte haut la main..."
              required
            />
          </div>

          {/* Grille Catégories + Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chained Categories Selectors */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Catégorie (Menu)
                </label>
                <select
                  value={menuId}
                  onChange={(e) => setMenuId(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-350 text-sm focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  required
                >
                  <option value="">-- Choisir une rubrique --</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Sous-catégorie (Sous-menu)
                </label>
                <select
                  value={submenuId}
                  onChange={(e) => setSubmenuId(e.target.value)}
                  disabled={availableSubmenus.length === 0}
                  className="block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-350 text-sm focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="">-- Aucune (Optionnelle) --</option>
                  {availableSubmenus.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Illustration image selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Illustration Principale
              </label>
              
              <div className="bg-slate-950 border border-slate-800 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center min-h-[176px] relative overflow-hidden">
                {imagePrincipale ? (
                  <div className="absolute inset-0 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePrincipale}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer bg-slate-900 border border-slate-700 px-3.5 py-2 rounded text-xs font-bold text-white hover:bg-slate-800 transition">
                        Changer la photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <>
                    {uploadingMain ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                        <span className="text-xs text-slate-400">Upload de la photo...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-500 mb-2" />
                        <span className="text-xs text-slate-400 mb-3">Téléversez une image d'illustration</span>
                        <label className="cursor-pointer bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs font-bold text-slate-200 hover:bg-slate-850 hover:text-white transition">
                          Choisir un fichier
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleMainImageUpload}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Corps de l'éditeur */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Contenu Rédactionnel (Rich Text)
            </label>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-emerald-500/50 transition-colors">
              <ReactQuill
                ref={quillRef}
                value={contenu}
                onChange={setContenu}
                modules={quillModules}
                placeholder="Rédigez le corps de l'article ici... Vous pouvez utiliser le formattage riche, des listes et ajouter des images directement."
                className="quill-editor"
              />
            </div>
            <style jsx global>{`
              .quill-editor .ql-toolbar.ql-snow {
                background-color: #0f172a;
                border: none;
                border-bottom: 1px solid #1e293b;
              }
              .quill-editor .ql-container.ql-snow {
                border: none;
                min-height: 250px;
                background-color: #020617;
                color: #e2e8f0;
                font-family: inherit;
              }
              .quill-editor .ql-editor {
                min-height: 250px;
                font-size: 0.95rem;
                line-height: 1.625;
              }
              .quill-editor .ql-snow .ql-stroke {
                stroke: #94a3b8;
              }
              .quill-editor .ql-snow .ql-fill {
                fill: #94a3b8;
              }
              .quill-editor .ql-snow .ql-picker {
                color: #94a3b8;
              }
            `}</style>
          </div>

        </div>

        {/* Boutons d'actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/journalist"
            className="px-6 py-3 border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-7 py-3 rounded-xl text-sm font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {initialData ? 'Mettre à jour' : 'Publier l’Article'}
          </button>
        </div>

      </form>
    </div>
  );
}
