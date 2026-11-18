import { useEffect, useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { formatNaira } from '@happyday/shared/money';
import { Button } from '../../ui/Button.jsx';

/**
 * Step 2: choose the appointment (docs/03). New visitors get "First consultation" preselected; returning
 * visitors (localStorage.returning) get the follow-up. Fees show "Fee confirmed on booking" when unset.
 * @param {{
 *   value: string | null, types: any[] | null, setTypes: (t: any[]) => void,
 *   onChoose: (t: any) => void, onBack: () => void
 * }} props
 */
export function StepType({ value, types, setTypes, onChoose, onBack }) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (types) return undefined;
    const controller = new AbortController();
    api('/public/config', { signal: controller.signal })
      .then((cfg) => setTypes(cfg.appointmentTypes))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err instanceof ApiError ? err.message : 'Could not load appointments.');
      });
    return () => controller.abort();
  }, [types, setTypes]);

  let returning = false;
  try {
    returning = localStorage.getItem('returning') === 'true';
  } catch {
    returning = false;
  }

  return (
    <section className="booking-step" aria-labelledby="type-title">
      <h1 id="type-title" className="type-display-m">
        Choose your appointment
      </h1>
      {error ? <p className="field-error">{error}</p> : null}
      {!types && !error ? <p className="type-small">Loading appointments…</p> : null}
      <ul className="type-cards">
        {(types ?? []).map((t) => {
          const preselect = value === t.slug || (!value && (returning ? t.slug === 'follow-up' : t.isFirstVisit && t.slug === 'first-consultation'));
          return (
            <li key={t.slug}>
              <button
                type="button"
                className={`type-card ${preselect ? 'is-selected' : ''}`.trim()}
                aria-pressed={preselect}
                onClick={() => onChoose(t)}
              >
                <span className="type-card-name type-display-s">{t.name}</span>
                <span className="type-small">{t.summary}</span>
                <span className="type-card-meta label">
                  About {t.durationMinutes} minutes · {formatNaira(t.priceNaira)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="step-nav">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
      </div>
    </section>
  );
}
