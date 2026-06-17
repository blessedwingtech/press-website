'use client';

import { useState } from 'react';
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
  console.log('🔵 SafeImage reçoit src =', src, 'fill =', fill);
  const [imgSrc, setImgSrc] = useState(src);

  // Si c'est une image uploadée (servie par Nginx), on utilise <img>
  if (src && src.startsWith('/uploads/')) {
    // On construit un style pour imiter le comportement de `fill`
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
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          }
        }}
        {...(rest as any)}
      />
    );
  }

  // Pour les autres images (externes ou dans /public), on garde next/image
  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt}
      fill={fill}           
      sizes={sizes} 
      unoptimized={true} 
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
};

export default SafeImage;
