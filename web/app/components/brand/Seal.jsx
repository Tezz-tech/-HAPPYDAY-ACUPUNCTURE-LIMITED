import { SEAL_GLYPH_JIU, SEAL_GLYPH_ZHEN } from './seal-glyphs.generated.js';

/**
 * A rough, hand-carved outline: each edge gets a few deterministic wobbles, so the square looks
 * stamped rather than drawn. The seal is used only in three places (docs/02 §5.6).
 * @returns {string} SVG path data in a 100 x 100 viewBox
 */
function sealBody() {
  const corners = [
    [3, 3],
    [97, 3],
    [97, 97],
    [3, 97],
  ];
  const points = [];
  for (let edge = 0; edge < 4; edge += 1) {
    const [x0, y0] = corners[edge];
    const [x1, y1] = corners[(edge + 1) % 4];
    for (let step = 0; step < 6; step += 1) {
      const t = step / 6;
      const wobble = 0.7 * Math.sin(edge * 2.3 + step * 1.7) * (step === 0 ? 0 : 1);
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      const horizontal = y0 === y1;
      points.push([horizontal ? x : x + wobble, horizontal ? y + wobble : y]);
    }
  }
  return `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`;
}

const BODY = sealBody();

/**
 * The cinnabar seal with 针灸 (zhēnjiǔ) in paper. Stamping is a CSS animation, skipped under reduced motion.
 * @param {{ size?: number, stamp?: boolean, className?: string }} props
 */
export function Seal({ size = 72, stamp = false, className = '' }) {
  return (
    <svg
      className={`seal ${stamp ? 'seal-stamp' : ''} ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Seal with the characters for acupuncture, zhēnjiǔ"
      focusable="false"
    >
      <path d={BODY} fill="var(--color-cinnabar)" />
      <path d={SEAL_GLYPH_ZHEN} fill="var(--color-paper)" />
      <path d={SEAL_GLYPH_JIU} fill="var(--color-paper)" />
    </svg>
  );
}
