import { LQIP, PHOTOS } from '../../content/photos.generated.js';
import { useInView } from '../../hooks/useInView.js';

/**
 * Responsive photo: AVIF, then WebP, then JPG, inside a fixed aspect-ratio frame with a blurred LQIP.
 * The image clip-reveals once when it enters the viewport. It never displays wider than the
 * manifest's maxDisplayWidthCss (docs/02 §5.7).
 * @param {{
 *   id: string, sizes?: string, alt?: string, caption?: string, reveal?: boolean,
 *   priority?: boolean, className?: string, maxWidth?: number
 * }} props
 */
export function Picture({ id, sizes = '100vw', alt, caption, reveal = true, priority = false, className = '', maxWidth }) {
  const photo = PHOTOS[id];
  if (!photo) throw new Error(`Unknown photo id: ${id}`);
  const { ref, inView } = useInView({ threshold: 0.15 });
  const src = (ext) => `/photos/${photo.files[ext]}`;
  const displayMax = maxWidth ? Math.min(maxWidth, photo.maxDisplayWidthCss) : photo.maxDisplayWidthCss;

  const frameClass = ['pic-frame', reveal ? 'reveal-clip' : '', inView || !reveal ? 'is-in' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <figure className={`pic ${className}`.trim()} ref={ref} style={{ maxWidth: `${displayMax}px` }}>
      <div
        className={frameClass}
        style={{
          aspectRatio: `${photo.width} / ${photo.height}`,
          backgroundImage: `url(${LQIP[id]})`,
        }}
      >
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
