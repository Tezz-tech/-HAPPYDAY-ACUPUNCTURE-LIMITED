import { useId } from 'react';
import { Icon } from './Icon.jsx';

/**
 * Checkbox with a text label. The whole label row is the hit target (44 px minimum).
 * @param {{ id?: string, children: import('react').ReactNode, error?: string } & import('react').InputHTMLAttributes<HTMLInputElement>} props
 */
export function Checkbox({ id, children, error, ...rest }) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className="checkbox-wrap">
      <label htmlFor={inputId} className="checkbox">
        <input
          id={inputId}
          type="checkbox"
          className="checkbox-input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          {...rest}
        />
        <span className="checkbox-text">{children}</span>
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
