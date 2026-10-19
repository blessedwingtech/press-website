'use client';

import React, { useState } from 'react';
import { Copy, Check, ShieldCheck, Sparkles, FileText } from 'lucide-react';

interface FormattedAiDraftProps {
  content: string;
  onCopySuccess?: () => void;
  showActions?: boolean;
}

export default function FormattedAiDraft({
  content,
  onCopySuccess,
  showActions = true,
}: FormattedAiDraftProps) {
  const [copiedType, setCopiedType] = useState<'text' | 'html' | null>(null);

  // Nettoyage et copie dans le presse-papier
  const handleCopyCleanText = async () => {
    // Nettoyer les balises Markdown brutes pour obtenir un texte fluide et élégant
    const cleanText = content
      .replace(/^#+\s+/gm, '') // Enlever les #
      .replace(/\*\*(.*?)\*\*/g, '$1') // Enlever les **
      .replace(/\*(.*?)\*/g, '$1') // Enlever les *
      .replace(/^>\s+/gm, '') // Enlever les >
      .replace(/^[*-]\s+/gm, '• ') // Remplacer par des puces propres
      .replace(/^(---|___|\*\*\*)$/gm, '') // Enlever les séparateurs
      .trim();

    await navigator.clipboard.writeText(cleanText);
    setCopiedType('text');
    onCopySuccess?.();
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyRichText = async () => {
    // Si ClipboardItem est supporté, copier en HTML riche pour préserver le formattage
    try {
      const htmlContent = generateHtmlPreview(content);
      const cleanText = content.replace(/^#+\s+/gm, '').replace(/\*\*(.*?)\*\*/g, '$1');
      
      if (typeof ClipboardItem !== 'undefined') {
        const textBlob = new Blob([cleanText], { type: 'text/plain' });
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(cleanText);
      }
      setCopiedType('html');
      onCopySuccess?.();
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      handleCopyCleanText();
    }
  };

  // Convertit les balises en ligne (gras, italique)
  const formatInlineText = (text: string): React.ReactNode[] => {
    // Découpage simple pour **gras** et *italique*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic text-amber-200/90">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  // Parseur de blocs Markdown structurés
  const renderMarkdownBlocks = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentQuote: string[] = [];
    let isInsideChapeau = false;
    let chapeauLines: string[] = [];

    const flushQuote = (key: string) => {
      if (currentQuote.length > 0) {
        const quoteText = currentQuote.join(' ');
        elements.push(
          <blockquote
            key={`quote-${key}`}
            className="my-3 pl-4 border-l-3 border-amber-500 bg-amber-500/5 py-2.5 pr-3 rounded-r-xl text-xs text-amber-100/95 italic leading-relaxed shadow-sm"
          >
            {formatInlineText(quoteText)}
          </blockquote>
        );
        currentQuote = [];
      }
    };

    const flushChapeau = (key: string) => {
      if (chapeauLines.length > 0) {
        elements.push(
          <div
            key={`chapeau-${key}`}
            className="my-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-1 shadow-inner"
          >
            <span className="block text-[10px] font-black uppercase tracking-wider text-amber-400">
              Chapeau Synthétique
            </span>
            <p className="italic font-medium">{formatInlineText(chapeauLines.join(' '))}</p>
          </div>
        );
        chapeauLines = [];
        isInsideChapeau = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Traitement des citations groupées (> ...)
      if (trimmed.startsWith('>')) {
        currentQuote.push(trimmed.replace(/^>\s?/, ''));
        return;
      } else if (currentQuote.length > 0) {
        flushQuote(`flush-${index}`);
      }

      // Traitement du Chapeau
      if (trimmed.toUpperCase() === '**CHAPEAU**' || trimmed.toUpperCase() === 'CHAPEAU') {
        isInsideChapeau = true;
        return;
      }

      if (isInsideChapeau) {
        if (trimmed.startsWith('##') || trimmed.startsWith('---') || trimmed.startsWith('***')) {
          flushChapeau(`chapeau-${index}`);
        } else if (trimmed) {
          chapeauLines.push(trimmed);
          return;
        }
      }

      // Détection de la note déontologique au journaliste
      if (
        trimmed.startsWith('*Note à l\'attention du journaliste') ||
        trimmed.startsWith('Note à l\'attention du journaliste') ||
        trimmed.startsWith('*Note :')
      ) {
        const cleanNote = trimmed.replace(/^\*+|\*+$/g, '');
        elements.push(
          <div
            key={`note-${index}`}
            className="p-3 mb-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-200/90 leading-relaxed"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{cleanNote}</span>
          </div>
        );
        return;
      }

      // Séparateurs horizontaux (--- ou ***)
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        flushChapeau(`hr-chap-${index}`);
        elements.push(
          <div key={`hr-${index}`} className="my-4 border-t border-slate-800/80" />
        );
        return;
      }

      // Titre Principal H1 (# ...)
      if (trimmed.startsWith('# ')) {
        flushChapeau(`h1-chap-${index}`);
        const titleText = trimmed.replace(/^#\s+/, '');
        elements.push(
          <h2
            key={`h1-${index}`}
            className="text-base sm:text-lg font-black text-white tracking-tight mt-2 mb-3 leading-snug"
          >
            {formatInlineText(titleText)}
          </h2>
        );
        return;
      }

      // Intertitre H2 (## ...)
      if (trimmed.startsWith('## ')) {
        flushChapeau(`h2-chap-${index}`);
        const subTitle = trimmed.replace(/^##\s+/, '');
        elements.push(
          <h3
            key={`h2-${index}`}
            className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider mt-5 mb-2 pb-1 border-b border-slate-800/60 flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            {formatInlineText(subTitle)}
          </h3>
        );
        return;
      }

      // Sous-titre H3 (### ...)
      if (trimmed.startsWith('### ')) {
        flushChapeau(`h3-chap-${index}`);
        const h3Text = trimmed.replace(/^###\s+/, '');
        elements.push(
          <h4
            key={`h3-${index}`}
            className="text-xs font-bold text-slate-200 mt-3 mb-1"
          >
            {formatInlineText(h3Text)}
          </h4>
        );
        return;
      }

      // Éléments de liste à puces (- ou *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        flushChapeau(`li-chap-${index}`);
        const bulletText = trimmed.replace(/^[-*]\s+/, '');
        elements.push(
          <div key={`li-${index}`} className="flex items-start gap-2 my-1 text-xs text-slate-300 leading-relaxed pl-2">
            <span className="text-amber-400 font-bold mt-0.5">•</span>
            <span>{formatInlineText(bulletText)}</span>
          </div>
        );
        return;
      }

      // Paragraphes normaux
      if (trimmed) {
        elements.push(
          <p key={`p-${index}`} className="text-xs text-slate-300 leading-relaxed my-2 font-sans select-text">
            {formatInlineText(trimmed)}
          </p>
        );
      }
    });

    flushQuote('final');
    flushChapeau('final');

    return elements;
  };

  return (
    <div className="space-y-4">
      {/* Barre d'action supérieure */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Formatage éditorial appliqué</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCleanText}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Copier le texte fluide sans caractères bruts"
            >
              {copiedType === 'text' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">Texte copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  Copier le texte épuré
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyRichText}
              className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/30"
              title="Copier avec les titres, gras et citations pour coller dans un traitement de texte"
            >
              {copiedType === 'html' ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  Mise en page copiée !
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Copier formaté
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Contenu rendu sous forme enrichie */}
      <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner select-text">
        {renderMarkdownBlocks()}
      </div>
    </div>
  );
}

// Générateur d'aperçu HTML propre pour presse-papier riche
function generateHtmlPreview(markdown: string): string {
  let html = markdown
    .replace(/^# (.*$)/gim, '<h1 style="font-size:20px; font-weight:bold; margin-bottom:12px;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size:16px; font-weight:bold; color:#f59e0b; margin-top:20px; margin-bottom:8px;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="font-size:14px; font-weight:bold; margin-top:14px; margin-bottom:6px;">$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^> (.*$)/gim, '<blockquote style="border-left:4px solid #f59e0b; padding-left:12px; margin:14px 0; font-style:italic; color:#e2e8f0;">$1</blockquote>')
    .replace(/\n\n/gim, '</p><p style="margin: 10px 0; line-height: 1.6; font-size:14px;">')
    .replace(/---|\*\*\*/gim, '<hr style="border:none; border-top:1px solid #334155; margin:18px 0;" />');

  return `<div style="font-family: system-ui, -apple-system, sans-serif; color: #f8fafc; line-height: 1.6;"><p style="margin: 10px 0;">${html}</p></div>`;
}
