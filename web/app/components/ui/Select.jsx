import { useId } from 'react';
import { Icon } from './Icon.jsx';

/**
 * Native select with the same floating label. The label always floats because a value is always shown.
 * @param {{
 *   id?: string, label: string, options: { value: string, label: string }[], error?: string,
 *   className?: string, ref?: import('react').Ref<HTMLSelectElement>
 * } & import('react').SelectHTMLAttributes<HTMLSelectElement>} props
 */
export function Select({ id, label, options, error, className = '', ref, ...rest }) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const errorId = `${selectId}-error`;

  return (
    <div className={`field ${className}`.trim()}>
      <select
        ref={ref}
        id={selectId}
        className="field-input is-floated"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <label htmlFor={selectId} className="field-label is-floated">
        {label}
      </label>
      {error ? (
        <p id={errorId} className="field-error">
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
