import { useEffect, useRef } from 'react';
import { useGsap } from '../../hooks/useGsap.js';
import { prefersReducedMotion } from '../../lib/motion.js';

/**
 * The four steps of a first visit (docs/03 home §4). On desktop the section pins for 150 vh of scroll and the
 * steps slide across (docs/02 §6). On phones they reveal down a timeline. The compact variant (treatment pages) is static.
 */
export const VISIT_STEPS = [
  {
    n: 1,
    title: 'Talk.',
    body: "We start with your story: what's wrong, how long it's been going on, what you've already tried, and what you want to get back to.",
  },
  {
    n: 2,
    title: 'Look and feel.',
    body: 'A traditional tongue and pulse assessment. It takes a few minutes and does not hurt.',
  },
  {
    n: 3,
    title: 'Treat.',
    body: 'Hair-fine, sterile needles are placed at chosen points. You rest for 20 to 30 minutes. Most people find it deeply relaxing.',
  },
  {
    n: 4,
    title: 'Plan.',
    body: 'You leave knowing what we found, how many sessions we suggest, and what you can do at home.',
  },
];

/** @param {{ compact?: boolean }} props */
export function VisitSteps({ compact = false }) {
  const ref = useRef(null);
  const g = useGsap();

  useEffect(() => {
    if (!g || compact || prefersReducedMotion() || !ref.current) return undefined;
    const { gsap } = g;
    const root = ref.current;
    const track = root.querySelector('.visit-steps');
    const steps = Array.from(root.querySelectorAll('.visit-step'));
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
      gsap.to(track, {
        x: () => -Math.max(0, track.scrollWidth - root.clientWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          pin: true,
          scrub: 0.6,
          start: 'top 20%',
          end: () => `+=${Math.round(window.innerHeight * 1.5)}`,
          invalidateOnRefresh: true,
        },
      });
      // Text stays at full contrast throughout; only the track moves.
    });

    mm.add('(max-width: 1023px)', () => {
      gsap.from(steps, {
        opacity: 0,
        y: 24,
        stagger: 0.12,
        duration: 0.7,
        ease: 'expo.out',
        scrollTrigger: { trigger: root, start: 'top 75%', once: true },
      });
    });

    return () => mm.revert();
  }, [g, compact]);

  return (
    <div className={`visit-pin ${compact ? 'is-compact' : ''}`.trim()} ref={ref}>
      <ol className={`visit-steps ${compact ? 'is-compact' : ''}`.trim()}>
        {VISIT_STEPS.map((step) => (
          <li key={step.n} className="visit-step">
            <span className="visit-step-point" aria-hidden="true" />
            <span className="label visit-step-n">Step {step.n}</span>
            <h3 className="type-display-s">{step.title}</h3>
            <p className="type-body">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
