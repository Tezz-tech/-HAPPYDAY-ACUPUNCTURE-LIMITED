/**
 * "Thinner than you think" (docs/02 §5.5). Bars are drawn to true relative scale: 0.07 mm hair,
 * 0.25 mm solid acupuncture needle, 0.8 mm hollow injection needle (21G). Figures are typical, not specifications.
 * Phase 3 adds the scroll-in growth, the count-up and the 40x magnify toggle.
 */
export const NEEDLE_SIZES = [
  { id: 'hair', label: 'Human hair', mm: 0.07, hollow: false },
  { id: 'acupuncture', label: 'Acupuncture needle', mm: 0.25, hollow: false },
  { id: 'injection', label: 'Injection needle (21G)', mm: 0.8, hollow: true },
];

/** @param {{ magnify?: number }} props  magnify = scale factor for the bars (1 or 40) */
export function NeedleScale({ magnify = 1 }) {
  // 1 mm is drawn as 600 px of bar length at magnification 1, so 0.07 mm is ~42 px wide.
  const PX_PER_MM = 600 * magnify;
  return (
    <figure className="needle-scale">
      <ul className="needle-scale-list">
        {NEEDLE_SIZES.map((n) => (
          <li key={n.id} className="needle-row">
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
                className="needle-bar"
                style={{ width: `${Math.max(2, n.mm * PX_PER_MM)}px` }}
                data-mm={n.mm}
              />
            </span>
            <span className="needle-value">
              <span className="needle-mm">{n.mm.toFixed(2)}</span> mm
              <span className="needle-label">{n.label}</span>
            </span>
          </li>
        ))}
      </ul>
      <figcaption className="needle-footnote">
        Typical sizes. Acupuncture needles usually range from 0.16 to 0.30 mm.
      </figcaption>
    </figure>
  );
}
