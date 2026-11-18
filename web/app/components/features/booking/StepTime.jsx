import { useEffect, useMemo, useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { formatDayDate, formatTime, clinicDateKey } from '@happyday/shared/time';
import { Chip } from '../../ui/Chip.jsx';
import { Button } from '../../ui/Button.jsx';

const PERIODS = [
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening', label: 'Evening' },
];

/**
 * Step 3: pick a time (docs/03 booking step 3). A week strip with the month label, then times grouped by
 * period. Days with no times say so and jump to the next available day. Unavailable times are never shown.
 * @param {{ typeSlug: string, value: string | null, onChoose: (iso: string) => void, onBack: () => void }} props
 */
export function StepTime({ typeSlug, value, onChoose, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [dayKey, setDayKey] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const today = clinicDateKey(Date.now());
    api(`/public/slots?type=${encodeURIComponent(typeSlug)}&from=${today}&days=14`, { signal: controller.signal })
      .then((res) => {
        setData(res);
        const firstWithSlots = res.days.find((d) => d.slots.length > 0);
        setDayKey((prev) => prev ?? firstWithSlots?.date ?? res.days[0]?.date ?? null);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err instanceof ApiError ? err.message : 'Could not load times.');
      });
    return () => controller.abort();
  }, [typeSlug]);

  const day = useMemo(() => data?.days.find((d) => d.date === dayKey) ?? null, [data, dayKey]);
  const monthLabel = day ? new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'Africa/Lagos' }).format(new Date(`${day.date}T12:00:00+01:00`)) : '';

  function jumpToNext() {
    const next = data?.days.find((d) => d.slots.length > 0);
    if (next) setDayKey(next.date);
  }

  return (
    <section className="booking-step" aria-labelledby="time-title">
      <h1 id="time-title" className="type-display-m">
        Pick a time
      </h1>
      {error ? <p className="field-error">{error}</p> : null}
      {!data && !error ? <div className="skeleton" aria-label="Loading times" /> : null}
      {data ? (
        <>
          <p className="label" aria-live="polite">{monthLabel}</p>
          <div className="week-strip" role="tablist" aria-label="Days">
            {data.days.map((d) => {
              const label = formatDayDate(`${d.date}T12:00:00+01:00`);
              const selected = d.date === dayKey;
              return (
                <button
                  key={d.date}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`day-chip ${selected ? 'is-selected' : ''} ${d.slots.length === 0 ? 'is-empty' : ''}`.trim()}
                  onClick={() => setDayKey(d.date)}
                >
                  <span className="label">{label.split(' ')[0].slice(0, 3)}</span>
                  <span>{Number(d.date.slice(8))}</span>
                </button>
              );
            })}
          </div>
          {day && day.slots.length === 0 ? (
            <p className="type-body">
              No times left on this day.{' '}
              <button type="button" className="link-underline" onClick={jumpToNext}>
                Try the next available day →
              </button>
            </p>
          ) : null}
          {PERIODS.map((p) => {
            const slots = (day?.slots ?? []).filter((s) => s.period === p.key);
            if (slots.length === 0) return null;
            return (
              <div key={p.key} className="period-group">
                <h2 className="label">{p.label}</h2>
                <div className="chip-grid" role="group" aria-label={`${p.label} times`}>
                  {slots.map((s) => (
                    <Chip key={s.start} selected={value === s.start} onClick={() => onChoose(s.start)}>
                      {formatTime(s.start)}
                    </Chip>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      ) : null}
      <div className="step-nav">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
      </div>
    </section>
  );
}
