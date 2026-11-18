// Hero intro choreography (docs/02 §6): the H1 rises line by line through a mask, then the lead,
// the CTAs and the needle field arrive in sequence. Under reduced motion it is only a short fade.
import { prefersReducedMotion, EASE_OUT_EXPO } from '../../lib/motion.js';

/**
 * @param {typeof import('../../lib/gsap-bundle.js')} g the loaded GSAP module
 * @param {HTMLElement} root the hero section
 * @returns {() => void} cleanup
 */
export function heroIntro(g, root) {
  const { gsap, SplitText } = g;
  const title = root.querySelector('.hero-title');
  const lead = root.querySelector('.hero-lead');
  const actions = root.querySelector('.hero-actions');
  const field = root.querySelector('.hero-field');
  const label = root.querySelector('.hero-label');
  const facts = root.querySelector('.hero-facts');

  if (prefersReducedMotion()) {
    const tween = gsap.from([label, title, lead, actions, facts, field], {
      opacity: 0,
      duration: 0.2,
      stagger: 0.04,
      ease: 'none',
    });
    return () => tween.kill();
  }

  const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
  const tl = gsap.timeline({ defaults: { ease: EASE_OUT_EXPO } });
  tl.from(label, { opacity: 0, y: 8, duration: 0.6 }, 0)
    .from(split.lines, { yPercent: 110, duration: 1.1, stagger: 0.09 }, 0.1)
    .from(lead, { opacity: 0, duration: 0.7 }, 0.45)
    .from(actions, { opacity: 0, y: 14, duration: 0.7 }, 0.6)
    .from(facts, { opacity: 0, duration: 0.6 }, 0.8)
    .from(field, { opacity: 0, duration: 0.9 }, 0.25);

  return () => {
    tl.kill();
    split.revert();
  };
}
