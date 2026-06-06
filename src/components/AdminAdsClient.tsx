'use client';

import { useState } from 'react';
import { saveAd, deleteAd, saveAdSetting } from '@/app/admin/ads/actions';
import {
  Plus,
  Trash2,
  Edit2,
  Landmark,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  Settings,
  RefreshCw,
} from 'lucide-react';

interface AdData {
  id: string;
  titre: string;
  imageUrl: string;
  lien: string;
  position: string;
  active: boolean;
}

interface AdSettingData {
  position: string;
  limit: number;
  interval: number;
}

interface AdminAdsProps {
  ads: AdData[];
  adSettings: AdSettingData[];
}

export default function AdminAdsClient({ ads, adSettings }: AdminAdsProps) {
  const [adId, setAdId] = useState<string | undefined>(undefined);
  const [titre, setTitre] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [lien, setLien] = useState('');
  const [position, setPosition] = useState('sidebar');
  const [active, setActive] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // States for Ad Rotation Settings
  const [settingPosition, setSettingPosition] = useState('sidebar');
  const [settingLimit, setSettingLimit] = useState(5);
  const [settingInterval, setSettingInterval] = useState(10);
  const [settingLoading, setSettingLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        setSuccess('Image chargée avec succès.');
      } else {
        setError(data.error || 'Erreur lors du téléversement de la publicité.');
      }
    } catch (err) {
      setError('Erreur réseau lors de l’upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!titre || !imageUrl || !lien) {
      setError('Veuillez remplir l’ensemble des champs obligatoires.');
      setLoading(false);
      return;
    }

    if (!confirm(adId ? 'Enregistrer les modifications de cette publicité ?' : 'Créer cette nouvelle publicité ?')) {
      setLoading(false);
      return;
    }

    try {
      await saveAd(adId, { titre, imageUrl, lien, position, active });
      setSuccess(adId ? 'Publicité mise à jour.' : 'Publicité ajoutée avec succès.');
      setAdId(undefined);
      setTitre('');
      setImageUrl('');
      setLien('');
      setPosition('sidebar');
      setActive(true);
    } catch (err: any) {
      setError(err.message || 'Erreur serveur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ad: AdData) => {
    setAdId(ad.id);
    setTitre(ad.titre);
    setImageUrl(ad.imageUrl);
    setLien(ad.lien);
    setPosition(ad.position);
    setActive(ad.active);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingLoading(true);
    setError(null);
    setSuccess(null);

    if (!confirm(`Confirmer la configuration de rotation pour l'emplacement "${settingPosition}" ?`)) {
      setSettingLoading(false);
      return;
    }

    try {
      await saveAdSetting(settingPosition, settingLimit, settingInterval);
      setSuccess('Configuration de rotation enregistrée.');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde des paramètres.');
    } finally {
      setSettingLoading(false);
    }
  };

  // Pre-fill rotation settings values when position dropdown changes
  const handleSettingPositionChange = (pos: string) => {
    setSettingPosition(pos);
    const existing = adSettings.find((s) => s.position === pos);
    if (existing) {
      setSettingLimit(existing.limit);
      setSettingInterval(existing.interval);
    } else {
      setSettingLimit(5);
      setSettingInterval(10);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
          Gestion des Emplacements Publicitaires (Ads)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajoutez de nouvelles publicités, configurez le nombre d'annonces rotatives par espace et gérez leur défilement automatique toutes les X secondes.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-xs font-semibold text-rose-455">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-xs font-semibold text-emerald-400">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Liste des publicités */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-5 shadow-2xl">
            <h2 className="text-xs font-black uppercase tracking-wider text-white border-b border-slate-800/60 pb-3 mb-4 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-amber-455" />
              Campagnes de sponsoring actives
            </h2>

            {ads.length === 0 ? (
              <p className="text-xs text-slate-550 text-center py-8">
                Aucun affichage publicitaire enregistré dans la base.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="border border-slate-800/80 bg-slate-950/20 rounded-xl p-4 flex flex-col justify-between hover:border-slate-750 transition-colors"
                  >
                    <div>
                      {/* Aperçu miniature de l'image */}
                      <div className="w-full h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 mb-3 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ad.imageUrl}
                          alt={ad.titre}
                          className="w-full h-full object-cover select-none"
                        />
                        <span className="absolute top-2 right-2 bg-slate-955/80 backdrop-blur-sm text-[8px] font-black uppercase px-2 py-0.5 rounded border border-slate-850 text-amber-400 select-none">
                          {ad.position}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 leading-none">
                        {ad.titre}
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate mt-1">
                        Lien:{' '}
                        <a
                          href={ad.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          {ad.lien}
                        </a>
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-800/50 pt-3 mt-3 text-xs">
                      <div className="flex items-center">
                        {ad.active ? (
                          <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 select-none">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold text-slate-550 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1 select-none">
                            <XCircle className="w-3.5 h-3.5 text-slate-500" /> Inactive
                          </span>
                        )}
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-1.5 text-slate-400 hover:text-cyan-455 hover:bg-slate-850 rounded transition-colors cursor-pointer"
                          title="Modifier la publicité"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              confirm(
                                `Voulez-vous supprimer définitivement la publicité "${ad.titre}" ?`
                              )
                            ) {
                              await deleteAd(ad.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                          title="Supprimer la publicité"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulaires d'édition */}
        <div className="lg:col-span-1 space-y-6">
          {/* Formulaire de création / édition de pub */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-5 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-455 mb-4 border-b border-slate-800/60 pb-2">
              {adId ? 'Éditer la Pub' : 'Nouvelle Pub'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Titre du sponsor
                </label>
                <input
                  type="text"
                  required
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  placeholder="Ex: Nike Promo 2026..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Position sur le site
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-350 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="header">Header Banner (Haut de page)</option>
                  <option value="sidebar">Sidebar Widget (Droit / Latéral)</option>
                  <option value="footer">Footer Banner (Bas de page)</option>
                  <option value="left-sidebar">Left Sidebar (Espace Gauche)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  URL de redirection (Lien)
                </label>
                <input
                  type="url"
                  required
                  value={lien}
                  onChange={(e) => setLien(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                  placeholder="https://nike.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Image publicitaire (Bannière)
                </label>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                    placeholder="Saisir l'URL de l'image"
                  />

                  <div className="flex items-center gap-3">
                    <label className="flex-grow flex justify-center items-center gap-1.5 py-2.5 px-3 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-850 hover:text-white transition-colors cursor-pointer">
                      {uploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-200" />{' '}
                          Téléversement...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5 text-slate-400" /> Charger un fichier
                          local
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1 select-none">
                <input
                  id="active"
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 border-slate-800 bg-slate-955 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label
                  htmlFor="active"
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer"
                >
                  Activer la publicité
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="flex-grow flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-bold bg-amber-500 text-slate-955 hover:bg-amber-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-955" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-slate-955" />
                  )}
                  {adId ? 'Enregistrer' : 'Ajouter'}
                </button>
                {adId && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdId(undefined);
                      setTitre('');
                      setImageUrl('');
                      setLien('');
                      setPosition('sidebar');
                      setActive(true);
                    }}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Formulaire des paramètres de rotation publicitaire */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-5 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 border-b border-slate-800/60 pb-2 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-cyan-400" />
              Rotation des Publicités
            </h3>

            <form onSubmit={handleSaveSetting} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Emplacement ciblé
                </label>
                <select
                  value={settingPosition}
                  onChange={(e) => handleSettingPositionChange(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-355 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="header">Header Banner</option>
                  <option value="sidebar">Sidebar Widget</option>
                  <option value="footer">Footer Banner</option>
                  <option value="left-sidebar">Left Sidebar</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Nombre max à faire tourner
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={20}
                  value={settingLimit}
                  onChange={(e) => setSettingLimit(parseInt(e.target.value) || 5)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Intervalle de rotation (sec)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={300}
                  value={settingInterval}
                  onChange={(e) => setSettingInterval(parseInt(e.target.value) || 10)}
                  className="block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={settingLoading}
                className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {settingLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
                )}
                Enregistrer la configuration
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
