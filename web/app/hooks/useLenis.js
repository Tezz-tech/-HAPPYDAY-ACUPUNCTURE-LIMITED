import { useEffect } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../lib/motion.js';

/**
 * Smooth scrolling with Lenis (docs/02 §6). Only for fine pointers, never with reduced motion. The caller turns it
 * off on forms (/admin, /book) where native scroll matters. Lenis is loaded after first paint, like GSAP.
 * @param {boolean} enabled
 */
export function useLenis(enabled) {
  useEffect(() => {
    if (!enabled || !hasFinePointer() || prefersReducedMotion()) return undefined;
    let lenis = null;
    let frame = 0;
    let cancelled = false;
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      lenis = new Lenis({ lerp: 0.1 });
      const loop = (time) => {
        lenis.raf(time);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, [enabled]);
}
