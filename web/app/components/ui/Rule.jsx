/**
 * A full-width hairline with an optional label sitting on the line (docs/02 §5.1).
 * @param {{ label?: import('react').ReactNode, dark?: boolean, className?: string }} props
 */
export function Rule({ label, dark = false, className = '' }) {
  const style = { '--rule-bg': dark ? 'var(--color-forest-900)' : 'var(--color-paper)' };
  return (
    <div className={`rule ${dark ? 'rule-dark' : ''} ${className}`.trim()} style={style} role="presentation">
      {label ? <span className="rule-label">{label}</span> : null}
    </div>
  );
}
