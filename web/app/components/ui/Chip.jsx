/**
 * Selectable chip (docs/02 §7). Selected chips show a gold point at the left.
 * Uses aria-pressed for a toggle. Do not use it to show unavailable times (docs/02 §7).
 * @param {{ selected?: boolean, children: import('react').ReactNode, className?: string } & Record<string, unknown>} props
 */
export function Chip({ selected = false, children, className = '', ...rest }) {
  return (
    <button
      type="button"
      className={`chip ${className}`.trim()}
      aria-pressed={selected}
      {...rest}
    >
      <span className="chip-point" aria-hidden="true" />
      {children}
    </button>
  );
}
