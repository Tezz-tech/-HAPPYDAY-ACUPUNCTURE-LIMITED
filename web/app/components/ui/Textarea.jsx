import { useId } from 'react';
import { Icon } from './Icon.jsx';

/**
 * Multi-line input with the same floating label as Input.
 * @param {{
 *   id?: string, label: string, error?: string, hint?: string, className?: string,
 *   ref?: import('react').Ref<HTMLTextAreaElement>
 * } & import('react').TextareaHTMLAttributes<HTMLTextAreaElement>} props
 */
export function Textarea({ id, label, error, hint, className = '', ref, ...rest }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field ${className}`.trim()}>
      <textarea
        ref={ref}
        id={fieldId}
        placeholder=" "
        className="field-input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      <label htmlFor={fieldId} className="field-label">
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
