import { Picture } from '../ui/Picture.jsx';

/** The photographs we have cleared for use (faces blurred, see assets/photos/manifest.json). */
export const GALLERY_IDS = [
  'clinic-treatment-room',
  'treatment-lower-leg',
  'treatment-abdomen-ring',
  'treatment-leg-sterile-needles',
  'treatment-scalp-points',
];

/**
 * A plain photo gallery of the clinic. Three columns on desktop, a swipe strip on phones. Every
 * frame is the same 4:5 shape so the pictures read as a set rather than as one large image.
 * Images carry no captions because the photographs do not show the specific treatment named in them.
 * @param {{ ids?: string[] }} props
 */
export function Gallery({ ids = GALLERY_IDS }) {
  return (
    <div className="gallery" role="list" tabIndex={0} aria-label="Photographs of the clinic. Scroll sideways to see more.">
      <div className="gallery-item" role="listitem" data-reveal style={{ '--i': 0 }}>
        <figure className="pic">
          <div className="pic-frame" style={{ aspectRatio: '4 / 5' }}>
            <img
              src="/stock/spa-treatment-abuja.jpg"
              width="1200"
              height="800"
              alt="Illustrative stock photo: a woman relaxing on a treatment bed with eye pads on."
              loading="lazy"
              decoding="async"
              style={{ objectPosition: '70% 50%' }}
            />
          </div>
        </figure>
      </div>
      {ids.map((id, i) => (
        <div className="gallery-item" role="listitem" key={id} data-reveal style={{ '--i': i % 3 }}>
          <Picture id={id} sizes="(min-width: 1024px) 380px, (min-width: 768px) 33vw, 74vw" />
        </div>
      ))}
    </div>
  );
}
