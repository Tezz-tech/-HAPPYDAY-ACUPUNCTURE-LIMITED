import { useId } from 'react';
import { Icon } from './Icon.jsx';

/**
 * Text input with a floating label, 52 px tall (docs/02 §7). The label is linked by id,
 * and errors and hints are announced through aria-describedby.
 * @param {{
 *   id?: string, label: string, error?: string, hint?: string, className?: string,
 *   ref?: import('react').Ref<HTMLInputElement>
 * } & import('react').InputHTMLAttributes<HTMLInputElement>} props
 */
export function Input({ id, label, error, hint, className = '', ref, ...rest }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${className}`.trim()}>
      <input
        ref={ref}
        id={inputId}
        placeholder=" "
        className="field-input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      {hint && !error ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="field-error">
          <Icon name="alert" size={16} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
