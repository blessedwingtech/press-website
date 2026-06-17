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
  const [imgSrc, setImgSrc] = useState(src);

  // Synchroniser imgSrc avec la prop src
  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  // Images uploadées localement
  if (src && src.startsWith('/uploads/')) {
    const imgStyle = fill
      ? { objectFit: 'cover', width: '100%', height: '100%', ...(style as object) }
      : style;

    return (
      <img
        src={imgSrc}
        alt={alt}
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
      alt={alt}
      fill={fill}
      sizes={sizes}
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
