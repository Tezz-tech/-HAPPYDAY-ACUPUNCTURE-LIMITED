import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { formatTime, formatDayDate } from '@happyday/shared/time';
import { formatNaira } from '@happyday/shared/money';
import { confirmPatient, remindPatient } from '@happyday/shared/whatsapp';
import { displayNgPhone } from '@happyday/shared/phone';
import { ADDRESS } from '../../../lib/site.js';
import { BookingActions } from './BookingActions.jsx';

/**
 * Today: bookings for today and the next day, with "Needs checking" (payment_submitted) at the top (docs/04 admin screen 1).
 * Each row has Call, WhatsApp, Send reminder, and the status actions.
 */
export function AdminToday({ onError }) {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await api('/admin/today?days=2'));
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not load today.');
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) return <p className="type-small">Loading…</p>;

  return (
    <div className="admin-stack">
      <section aria-labelledby="needs-title">
        <h2 id="needs-title" className="label admin-heading admin-heading-alert">
          Needs checking ({data.needsChecking.length})
        </h2>
        {data.needsChecking.length === 0 ? <p className="type-small">Nothing waiting for a payment check.</p> : null}
        {data.needsChecking.map((b) => (
          <BookingRow key={b.id} b={b} onChanged={load} onError={onError} />
        ))}
      </section>
      <section aria-labelledby="today-title">
        <h2 id="today-title" className="label admin-heading">
          Today and tomorrow
        </h2>
        {data.bookings.length === 0 ? <p className="type-small">No bookings in this period.</p> : null}
        {data.bookings.map((b) => (
          <BookingRow key={b.id} b={b} onChanged={load} onError={onError} />
        ))}
      </section>
    </div>
  );
}

/** One booking as a row: time, name, type, status, and the quick actions. */
export function BookingRow({ b, onChanged, onError }) {
  const first = b.name.split(' ')[0];
  const tel = `tel:${b.phone}`;
  const wa = confirmPatient(b.phone, { firstName: first, day: formatDayDate(b.start).split(' ')[0], date: formatDayDate(b.start), time: formatTime(b.start), address: ADDRESS });
  const reminder = remindPatient(b.phone, { firstName: first, date: formatDayDate(b.start), time: formatTime(b.start) });
  return (
    <article className={`admin-row ${b.status === 'payment_submitted' ? 'is-alert' : ''}`.trim()}>
      <div className="admin-row-main">
        <p className="admin-time tabular">
          {formatDayDate(b.start)}, {formatTime(b.start)}
        </p>
        <p className="admin-name">
          {b.name} <span className="type-small">· {b.type}</span>
        </p>
        <p className="type-small">
          {b.ref} · {displayNgPhone(b.phone)} · {b.status.replace('_', ' ')}
          {b.amountDue !== null ? ` · ${formatNaira(b.amountDue)}` : ''}
        </p>
      </div>
      <div className="admin-row-actions">
        <a className="admin-link" href={tel}>
          Call
        </a>
        <a className="admin-link" href={wa}>
          WhatsApp
        </a>
        <a className="admin-link" href={reminder}>
          Send reminder
        </a>
        <BookingActions booking={b} onChanged={onChanged} onError={onError} />
      </div>
    </article>
  );
}
