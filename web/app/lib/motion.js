// Motion helpers that do not need GSAP. GSAP itself lives in gsap-bundle.js and is loaded lazily.

/** True when the visitor has asked for less motion (docs/02 §6). Checked at call time, not at import. */
export function prefersReducedMotion() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True for mouse-style pointers. Lenis, cursor previews and the magnetic pull use this. */
export function hasFinePointer() {
  return typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches;
}

/** Easings from docs/02 §6, as GSAP ease strings. */
export const EASE_OUT_EXPO = 'expo.out';
