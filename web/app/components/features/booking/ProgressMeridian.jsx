/**
 * Progress along the meridian: five points, the current one is filled gold (docs/05 Phase 5).
 * @param {{ current: number, total: number }} props
 */
export function ProgressMeridian({ current, total }) {
  return (
    <ol className="progress-meridian" aria-label={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <li key={i} className={`progress-point ${i <= current ? 'is-past' : ''} ${i === current ? 'is-current' : ''}`.trim()} aria-hidden="true" />
      ))}
    </ol>
  );
}
