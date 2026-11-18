import { useEffect } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../lib/motion.js';

/**
 * Magnetic pull for the hero's primary CTA (docs/02 §6): the element drifts toward the pointer by at most 6 px.
 * Fine pointers only, and never with reduced motion.
 * @param {import('react').RefObject<HTMLElement | null>} ref
 */
export function useMagnetic(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return undefined;
    const MAX = 6;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const x = Math.max(-MAX, Math.min(MAX, dx * 0.15));
      const y = Math.max(-MAX, Math.min(MAX, dy * 0.15));
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    const onLeave = () => {
      el.style.transform = '';
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [ref]);
}
