// Meridian motion (docs/02 §5.2): the line draws with scroll, and each section's point rings once when the section
// reaches 60% of the viewport.
import { prefersReducedMotion } from '../../lib/motion.js';

/**
 * @param {typeof import('../../lib/gsap-bundle.js')} g the loaded GSAP module
 * @param {HTMLElement} meridian the .meridian element
 * @param {HTMLElement} page the .page element the line runs down
 * @returns {() => void} cleanup
 */
export function drawMeridian(g, meridian, page) {
  const { gsap, ScrollTrigger } = g;
  const path = meridian.querySelector('.meridian-path');
  if (!path) return undefined;
  if (prefersReducedMotion()) {
    gsap.set(path, { drawSVG: '100%' });
    return undefined;
  }
  const tween = gsap.fromTo(
    path,
    { drawSVG: '0%' },
    {
      drawSVG: '100%',
      ease: 'none',
      scrollTrigger: { trigger: page, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
    },
  );
  const points = pulseSectionPoints(ScrollTrigger, page);
  return () => {
    points.forEach((st) => st.kill());
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

/**
 * Adds .is-on to each section point once it is 60% into the viewport. CSS plays the ring once.
 * @param {any} ScrollTrigger the ScrollTrigger class from the loaded GSAP module
 * @param {HTMLElement} page
 */
export function pulseSectionPoints(ScrollTrigger, page) {
  if (prefersReducedMotion()) return [];
  return Array.from(page.querySelectorAll('.section-point')).map((el) =>
    ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      once: true,
      onEnter: () => el.classList.add('is-on'),
    }),
  );
}
