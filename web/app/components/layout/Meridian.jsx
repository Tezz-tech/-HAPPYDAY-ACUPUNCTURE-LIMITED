/**
 * The meridian: one hairline in a fixed left gutter that runs the full height of a long page (docs/02 §5.2).
 * Phase 3 scrubs it with DrawSVG. Here it is static, so the page reads correctly with motion off.
 * @param {{ className?: string }} props
 */
export function Meridian({ className = '' }) {
  return <div className={`meridian ${className}`.trim()} aria-hidden="true" />;
}
