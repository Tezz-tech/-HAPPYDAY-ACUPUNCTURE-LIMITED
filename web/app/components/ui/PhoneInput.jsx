import { useState } from 'react';
import { normalizeNgPhone } from '@happyday/shared/phone';
import { Input } from './Input.jsx';

/**
 * Nigerian phone field. Accepts 080…, +234… and 234… (docs/03 Contact). Validates on blur,
 * and reports the normalised E.164 value through onNormalized.
 * @param {{
 *   value: string, onChange: (value: string) => void,
 *   onNormalized?: (e164: string | null) => void, error?: string, label?: string
 * } & Omit<import('react').InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>} props
 */
export function PhoneInput({
  value,
  onChange,
  onNormalized,
  error,
  label = 'Phone number',
  ...rest
}) {
  const [localError, setLocalError] = useState('');

  function handleBlur() {
    if (!value) {
      setLocalError('');
      onNormalized?.(null);
      return;
    }
    const e164 = normalizeNgPhone(value);
    setLocalError(e164 ? '' : 'Enter a Nigerian mobile number, e.g. 0803 640 4321');
    onNormalized?.(e164);
  }

  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={handleBlur}
      error={error || localError || undefined}
      hint="Nigerian mobile, for example 0803 640 4321"
      {...rest}
    />
  );
}
