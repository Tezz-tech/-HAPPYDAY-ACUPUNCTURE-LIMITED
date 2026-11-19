import { PHOTOS } from '../../content/photos.generated.js';

/**
 * Responsive photo: AVIF, then WebP, then JPG, inside a fixed aspect-ratio frame. The frame has a flat
 * background and the image fades in with CSS, so it never shows as fragments and never gets stuck hidden.
 * It never displays wider than the manifest's maxDisplayWidthCss (docs/02 §5.7).
 * @param {{
 *   id: string, sizes?: string, alt?: string, caption?: string, priority?: boolean,
 *   className?: string, maxWidth?: number
 * }} props
 */
export function Picture({ id, sizes = '100vw', alt, caption, priority = false, className = '', maxWidth }) {
  const photo = PHOTOS[id];
  if (!photo) throw new Error(`Unknown photo id: ${id}`);
  const src = (ext) => `/photos/${photo.files[ext]}`;
  const displayMax = maxWidth ? Math.min(maxWidth, photo.maxDisplayWidthCss) : photo.maxDisplayWidthCss;

  return (
    <figure className={`pic ${className}`.trim()} style={{ maxWidth: `${displayMax}px` }}>
      <div className="pic-frame" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
        <picture>
          <source type="image/avif" srcSet={src('avif')} sizes={sizes} />
          <source type="image/webp" srcSet={src('webp')} sizes={sizes} />
          <img
            src={src('jpg')}
            width={photo.width}
            height={photo.height}
            alt={alt ?? photo.alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : undefined}
          />
        </picture>
      </div>
      {caption ? <figcaption className="pic-caption">{caption}</figcaption> : null}
    </figure>
  );
}
