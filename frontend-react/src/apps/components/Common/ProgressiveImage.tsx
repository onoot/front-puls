import { useMemo } from 'react';

interface ProgressiveImageProps {
  src: string;
  mobileSrc?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

const WIDTHS = [480, 768, 992, 1280, 1920, 2560];

function buildSrcSet(src: string): string {
  if (!src.startsWith('/uploads/')) return src;
  return WIDTHS.map(w => `${src}?w=${w} ${w}w`).join(', ');
}

export function ProgressiveImage({ src, mobileSrc, alt = '', className = '', style, loading = 'lazy', sizes = '100vw' }: ProgressiveImageProps) {
  const desktopSet = useMemo(() => buildSrcSet(src), [src]);
  const mobileSet = useMemo(() => (mobileSrc ? buildSrcSet(mobileSrc) : ''), [mobileSrc]);

  if (mobileSet) {
    return (
      <picture>
        <source media="(max-width: 767px)" srcSet={mobileSet} sizes={sizes} />
        <img
          src={src}
          srcSet={desktopSet}
          sizes={sizes}
          alt={alt}
          loading={loading}
          decoding="async"
          className={className}
          style={style}
        />
      </picture>
    );
  }

  return (
    <img
      src={src}
      srcSet={desktopSet}
      sizes={sizes}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      style={style}
    />
  );
}
