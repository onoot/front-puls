import { useEffect, useState } from 'react';

interface ProgressiveImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
}

export function ProgressiveImage({ src, alt = '', className = '', style, loading = 'lazy' }: ProgressiveImageProps) {
  const [fullReady, setFullReady] = useState(false);

  useEffect(() => {
    setFullReady(false);
    if (!src.startsWith('/uploads/')) {
      setFullReady(true);
      return;
    }
    const img = new Image();
    img.onload = () => setFullReady(true);
    img.src = `${src}?type=full`;
    return () => { img.onload = null; };
  }, [src]);

  const thumbSrc = src.startsWith('/uploads/') ? `${src}?type=thumb` : src;
  const shown = fullReady ? src : thumbSrc;

  return (
    <img
      src={shown}
      alt={alt}
      loading={loading}
      decoding="async"
      className={fullReady ? className : `${className} img-preview`.trim()}
      style={style}
    />
  );
}
