import { useEffect, useState } from 'react';
import { useInView } from '../../hooks/useInView.js';
import { prefersReducedMotion } from '../../lib/motion.js';
import { Button } from '../ui/Button.jsx';

/**
 * "Thinner than you think" (docs/02 §5.5). Bars are drawn to true relative scale and labelled.
 * On scroll-in they grow in turn (120 ms apart) and the millimetre values count up with tabular numerals.
 * The magnify toggle draws the same sizes 40x in thickness. Figures are typical, not medical specifications.
 */
export const NEEDLE_SIZES = [
  { id: 'hair', label: 'Human hair', mm: 0.07, hollow: false },
  { id: 'acupuncture', label: 'Acupuncture needle', mm: 0.25, hollow: false },
  { id: 'injection', label: 'Injection needle (21G)', mm: 0.8, hollow: true },
];

/** Bar length: 0.8 mm (the widest) fills the track. */
const LENGTH_FOR = (mm) => `${Math.max(3, (mm / 0.8) * 100)}%`;
/** Magnified thickness: 40x true size, 2 px per mm of screen. */
const THICKNESS_FOR = (mm) => Math.max(2, mm * 40 * 2);

/** Counts from 0 to target once `active` turns true. Reduced motion shows the value at once. */
function useCountUp(target, active, duration = 900) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (!active || prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    setValue(0);
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);
  return value;
}

function SizeRow({ n, index, magnified, active }) {
  const value = useCountUp(n.mm, active);
  return (
    <li className="needle-row">
      <span className="needle-cross" aria-hidden="true">
        <svg width="44" height="44" viewBox="0 0 44 44">
          {n.hollow ? (
            <circle cx="22" cy="22" r="16" fill="none" stroke="var(--color-gold-400)" strokeWidth="4" />
          ) : (
            <circle cx="22" cy="22" r={Math.max(2, n.mm * 40)} fill="var(--color-gold-400)" />
          )}
        </svg>
      </span>
      <span className="needle-bar-track">
        <span
          className={`needle-bar ${active ? 'is-grown' : ''}`.trim()}
          style={
            magnified
              ? { width: '100%', height: `${THICKNESS_FOR(n.mm)}px`, maxWidth: 'none' }
              : { width: active ? LENGTH_FOR(n.mm) : '0%', transitionDelay: `${index * 120}ms` }
          }
        />
      </span>
      <span className="needle-value">
        <span className="needle-mm">{value.toFixed(2)}</span> mm
        <span className="needle-label">{n.label}</span>
      </span>
    </li>
  );
}

/** @param {{ magnifiable?: boolean }} props */
export function NeedleScale({ magnifiable = true }) {
  const [magnified, setMagnified] = useState(false);
  const { ref, inView } = useInView({ threshold: 0.35, once: true });
  return (
    <figure className="needle-scale" ref={ref}>
      {magnifiable ? (
        <div className="needle-scale-tools">
          <Button variant="ghost" onClick={() => setMagnified((m) => !m)} aria-pressed={magnified}>
            {magnified ? 'Actual size' : 'Magnify 40×'}
          </Button>
        </div>
      ) : null}
      <ul className="needle-scale-list">
        {NEEDLE_SIZES.map((n, i) => (
          <SizeRow key={n.id} n={n} index={i} magnified={magnified} active={inView} />
        ))}
      </ul>
      <figcaption className="needle-footnote">
        Typical sizes. Acupuncture needles usually range from 0.16 to 0.30 mm. These are approximate, not medical
        specifications.
      </figcaption>
    </figure>
  );
}
