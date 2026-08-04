import styles from './ArtBackdrop.module.css';

type Props = {
  /** Basename in public/art — resolves to {name}-{desktop|mobile}.{avif,webp,jpg}. */
  name: 'doacao' | 'hero' | 'manifesto';
  alt: string;
  /** Set on the first board so it is not lazy-loaded behind the fold check. */
  priority?: boolean;
};

/**
 * Full-bleed section artwork, art-directed at 768px.
 *
 * A plain <picture> rather than next/image: these are three fixed boards with
 * two fixed crops, so the whole responsive-srcset machinery buys nothing. The
 * browser downloads exactly one file, straight from the CDN, with no optimizer
 * round-trip on the first request.
 */
export function ArtBackdrop({ name, alt, priority = false }: Props) {
  const base = `/art/${name}`;
  return (
    <picture className={styles.picture}>
      <source media="(min-width: 48rem)" type="image/avif" srcSet={`${base}-desktop.avif`} />
      <source media="(min-width: 48rem)" type="image/webp" srcSet={`${base}-desktop.webp`} />
      <source media="(min-width: 48rem)" srcSet={`${base}-desktop.jpg`} />
      <source type="image/avif" srcSet={`${base}-mobile.avif`} />
      <source type="image/webp" srcSet={`${base}-mobile.webp`} />
      <img
        className={styles.img}
        src={`${base}-mobile.jpg`}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        width={600}
        height={899}
      />
    </picture>
  );
}
