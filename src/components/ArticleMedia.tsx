'use client';

import Image from 'next/image';

interface ArticleMediaProps {
  src: string;
  alt: string;
  mode?: 'preview' | 'full' | 'thumbnail';
}

export default function ArticleMedia({ src, alt, mode = 'preview' }: ArticleMediaProps) {
  const mediaSrc = src || '/fallback.png';

  const isVideo =
    mediaSrc.endsWith('.mp4') ||
    mediaSrc.endsWith('.webm') ||
    mediaSrc.endsWith('.ogg') ||
    mediaSrc.endsWith('.mov') ||
    mediaSrc.includes('video');

  // thumbnail style (minimalistic, small, square or tiny rect for tables)
  if (mode === 'thumbnail') {
    if (isVideo) {
      return (
        <div className="w-full h-full bg-slate-950 relative flex items-center justify-center">
          <video src={mediaSrc} muted className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[9px] bg-slate-900/90 text-cyan-400 font-extrabold px-1 py-0.5 rounded border border-slate-700">VIDEO</span>
          </div>
        </div>
      );
    }
    return (
      <div className="relative w-full h-full">
        <Image src={mediaSrc} alt={alt} fill sizes="60px" className="object-cover" />
      </div>
    );
  }

  // Preview & Full views: Blurred background with object-contain on top to prevent deformation (YouTube-like professional display)
  const isFull = mode === 'full';
  const containerClasses = isFull
    ? 'w-full h-64 sm:h-[450px] relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center shadow-xl'
    : 'w-full h-full relative flex items-center justify-center bg-slate-950';

  return (
    <div className={containerClasses}>
      {/* 1. Blurred background layer (fills space without deforming) */}
      <div className="absolute inset-0 opacity-30 blur-2xl scale-110 pointer-events-none select-none">
        {isVideo ? (
          <video src={mediaSrc} muted loop className="w-full h-full object-cover" />
        ) : (
          <Image src={mediaSrc} alt="" fill sizes="10vw" className="object-cover" />
        )}
      </div>

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-slate-950/20" />

      {/* 2. Main layer (contains and keeps exact ratio, never deforms) */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {isVideo ? (
          <video
            src={mediaSrc}
            controls={isFull}
            muted={!isFull}
            autoPlay={!isFull}
            loop={!isFull}
            playsInline
            className="w-full h-full object-contain max-h-full"
          />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={mediaSrc}
              alt={alt}
              fill
              sizes={isFull ? '(max-w-1024px) 100vw, 75vw' : '(max-w-768px) 100vw, 33vw'}
              className="object-contain max-h-full"
              priority={isFull}
            />
          </div>
        )}
      </div>

      {/* Badge showing media type for preview videos */}
      {isVideo && !isFull && (
        <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-[8px] font-extrabold text-cyan-400 uppercase tracking-widest px-2 py-0.5 rounded shadow z-20">
          Vidéo
        </div>
      )}
    </div>
  );
}
