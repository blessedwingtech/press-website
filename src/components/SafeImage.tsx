'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc = '/fallback.png',
  alt,
  style,
  className,
  fill,
  sizes,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  // Synchroniser imgSrc avec la prop src
  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const isContain = className?.includes('object-contain');
  const objectFitValue: 'contain' | 'cover' = isContain ? 'contain' : 'cover';

  // Images uploadées localement
  if (src && src.startsWith('/uploads/')) {
    const imgStyle: React.CSSProperties = fill
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          objectFit: objectFitValue,
          objectPosition: 'center',
          ...(style as object),
        }
      : {
          maxWidth: '100%',
          height: 'auto',
          objectFit: objectFitValue,
          ...(style as object),
        };

    return (
      <img
        src={imgSrc}
        alt={alt || ''}
        className={className}
        style={imgStyle}
        onError={() => {
          if (fallbackSrc && imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          }
        }}
        {...(rest as any)}
      />
    );
  }

  // Images externes (ou dans /public)
  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt || ''}
      fill={fill}
      sizes={sizes}
      className={className}
      style={style}
      unoptimized={true}
      onError={() => {
        if (fallbackSrc && imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
};

export default SafeImage;
