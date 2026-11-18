import { useEffect, useRef, useState } from 'react';
import { Picture } from '../ui/Picture.jsx';

/**
 * "Inside the clinic": a horizontal rail of photos (docs/03 home §7, docs/02 §5.7). Every frame shows the
 * duotone version, and the colour version fades in as the frame reaches the centre of the rail. Only photos from
 * assets/photos are used, with the faces already blurred. Captions describe what is shown.
 */
export const STRIP = [
  { id: 'clinic-treatment-room', caption: 'The treatment room.', sizes: '80vw' },
  { id: 'treatment-leg-sterile-needles', caption: 'Single-use needles, opened for you.', sizes: '60vw' },
  { id: 'treatment-scalp-points', caption: 'Fine needles, placed one at a time.', sizes: '60vw' },
  { id: 'sterile-needle-pack', caption: 'A sterile, single-use pack.', sizes: '50vw' },
  { id: 'treatment-lower-leg', caption: 'Needles placed along the lower leg.', sizes: '60vw' },
];

/** One frame: duotone underneath, colour on top, with the colour opacity driven by the strip's scroll position. */
function DuoFrame({ item, root }) {
  const ref = useRef(null);
  const [colour, setColour] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !root) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setColour(1);
      return undefined;
    }
    // A band in the middle of the rail counts as centred.
    const io = new IntersectionObserver(
      ([entry]) => {
        setColour(entry.intersectionRatio > 0.5 ? 1 : 0);
      },
      { root, rootMargin: '0px -30% 0px -30%', threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [root]);

  const duoId = `${item.id}-duotone`;
  return (
    <div className="duo-frame" ref={ref}>
      <div className="duo-layer duo-base" aria-hidden="true">
        <Picture id={duoId} sizes={item.sizes} reveal={false} alt="" />
      </div>
      <div className="duo-layer duo-colour" style={{ opacity: colour }}>
        <Picture id={item.id} sizes={item.sizes} caption={item.caption} reveal={false} />
      </div>
    </div>
  );
}

export function PhotoStrip() {
  const stripRef = useRef(null);
  const [root, setRoot] = useState(null);
  useEffect(() => {
    setRoot(stripRef.current);
  }, []);

  return (
    <div
      className="photo-strip"
      ref={stripRef}
      role="list"
      tabIndex={0}
      aria-label="Photos from inside the clinic. Scroll sideways to see more."
    >
      {STRIP.map((item) => (
        <div key={item.id} className="photo-strip-item" role="listitem">
          <DuoFrame item={item} root={root} />
        </div>
      ))}
    </div>
  );
}
