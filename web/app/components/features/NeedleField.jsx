import { useEffect, useRef } from 'react';
import { createNeedleField } from './needle-field/engine.js';
import { prefersReducedMotion } from '../../lib/motion.js';

/**
 * The needle field canvas (docs/02 §5.3). It is decorative (aria-hidden). It starts after first
 * paint, so it never affects LCP, and it pauses when off screen or when the tab is hidden.
 * Reduced motion gets one static frame.
 */
export function NeedleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let engine = null;
    let idle = 0;
    const init = () => {
      engine = createNeedleField(canvas, { reduced: prefersReducedMotion() });
    };
    // Lazy-init after first paint (docs/02 §5.3).
    if ('requestIdleCallback' in window) idle = window.requestIdleCallback(init, { timeout: 1200 });
    else idle = window.setTimeout(init, 300);
    return () => {
      if ('requestIdleCallback' in window) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      engine?.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="needle-field" aria-hidden="true" />;
}
