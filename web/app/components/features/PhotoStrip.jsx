import { Picture } from '../ui/Picture.jsx';

/**
 * "Inside the clinic": a horizontal rail of colour photos (docs/03 home §7). Only photos from
 * assets/photos are used, and only with the faces already blurred. Captions describe what is shown.
 */
export const STRIP = [
  { id: 'clinic-treatment-room', caption: 'The treatment room.', sizes: '80vw' },
  { id: 'treatment-leg-sterile-needles', caption: 'Single-use needles, opened for you.', sizes: '60vw' },
  { id: 'treatment-scalp-points', caption: 'Fine needles, placed one at a time.', sizes: '60vw' },
  { id: 'sterile-needle-pack', caption: 'A sterile, single-use pack.', sizes: '50vw' },
  { id: 'treatment-lower-leg', caption: 'Needles placed along the lower leg.', sizes: '60vw' },
];

export function PhotoStrip() {
  return (
    <div className="photo-strip" role="list" aria-label="Photos from inside the clinic">
      {STRIP.map((item) => (
        <div key={item.id} className="photo-strip-item" role="listitem">
          <Picture id={item.id} sizes={item.sizes} caption={item.caption} className="photo-strip-pic" />
        </div>
      ))}
    </div>
  );
}
