'use client';

import { useState } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';
import { trackArticleShare } from '@/app/articles/actions';

interface ShareButtonProps {
  articleId: string;
  title: string;
  url: string;
  mediaUrl?: string;
}

export default function ShareButton({ articleId, title, url, mediaUrl }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const shareText = `PressTonik | Découvrez l'actualité : "${title}" - ${fullUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      await trackArticleShare(articleId, 'copy_link');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async (platform: string) => {
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'noopener,noreferrer');
      await trackArticleShare(articleId, platform);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-lg text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md active:scale-95"
      >
        <Share2 className="w-4 h-4 text-emerald-400" />
        Partager l'article
      </button>

      {isOpen && (
        <>
          {/* Overlay to close */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2.5 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl ring-1 ring-black ring-opacity-5 z-40 p-2 divide-y divide-slate-800/60 transform origin-top-right transition-all duration-300 animate-in fade-in slide-in-from-top-2">
            
            {/* Header / Info */}
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              Partager sur PressTonik
            </div>

            {/* Sharing platforms */}
            <div className="py-1.5 space-y-1">
              <button
                onClick={() => {
                  handleShare('twitter');
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Partager sur X (Twitter)
              </button>

              <button
                onClick={() => {
                  handleShare('facebook');
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
                Partager sur Facebook
              </button>

              <button
                onClick={() => {
                  handleShare('whatsapp');
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                Partager sur WhatsApp
              </button>
            </div>

            {/* Link Copy section */}
            <div className="pt-2 pb-1">
              <button
                onClick={handleCopy}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-emerald-400 hover:bg-emerald-950/20 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Lien copié !' : 'Copier le lien'}
                </span>
                {copied && <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Copié</span>}
              </button>
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}
