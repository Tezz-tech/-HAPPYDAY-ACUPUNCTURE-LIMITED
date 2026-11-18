import { useEffect, useRef } from 'react';
import { useGsap } from '../../hooks/useGsap.js';
import { drawMeridian } from './Meridian.motion.js';

/**
 * The meridian: one gold line in the left gutter that runs the full height of the page (docs/02 §5.2).
 * It is drawn by DrawSVG, scrubbed to scroll, once GSAP has loaded. Under reduced motion it is fully drawn.
 * The path is a gentle S-curve with bends, like a channel. Decorative (aria-hidden).
 * @param {{ className?: string }} props
 */
export function Meridian({ className = '' }) {
  const ref = useRef(null);
  const g = useGsap();

  useEffect(() => {
    if (!g || !ref.current) return undefined;
    const page = ref.current.closest('.page');
    if (!page) return undefined;
    return drawMeridian(g, ref.current, page);
  }, [g]);

  return (
    <div ref={ref} className={`meridian ${className}`.trim()} aria-hidden="true">
      <svg className="meridian-svg" viewBox="0 0 20 1000" preserveAspectRatio="none">
        <path
          className="meridian-path"
          d="M10 0 C10 180 17 260 10 420 S3 640 10 780 S17 920 10 1000"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
