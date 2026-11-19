import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { formatTime, formatDayDate, clinicDateKey } from '@happyday/shared/time';
import { formatNaira } from '@happyday/shared/money';
import { confirmPatient, remindPatient } from '@happyday/shared/whatsapp';
import { displayNgPhone } from '@happyday/shared/phone';
import { ADDRESS } from '../../../lib/site.js';
import { BookingActions } from './BookingActions.jsx';
import { StatusChip } from './StatusChip.jsx';

/** A small figure with a label, for the stats row at the top of Today. */
function Stat({ label, value, tone = '' }) {
  return (
    <div className={`adm-stat ${tone}`.trim()} data-reveal>
      <p className="adm-stat-value tabular">{value}</p>
      <p className="adm-stat-label">{label}</p>
    </div>
  );
}

/**
 * Today: the bookings for today and tomorrow, with payments to check at the top (docs/04 admin screen 1).
 * Each card has Call, WhatsApp and Send reminder, plus the status actions.
 * @param {{ onError: (message: string) => void, onCounts?: (counts: Record<string, number>) => void }} props
 */
export function AdminToday({ onError, onCounts }) {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api('/admin/today?days=2');
      setData(res);
      onCounts?.({ today: res.needsChecking.length });
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not load today.');
    }
  }, [onError, onCounts]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) return <p className="type-small adm-loading">Loading today…</p>;

  const todayKey = clinicDateKey(Date.now());
  const isToday = (b) => clinicDateKey(Date.parse(b.start)) === todayKey;
  const todays = data.bookings.filter(isToday);
  const tomorrows = data.bookings.filter((b) => !isToday(b));
  const awaiting = data.bookings.filter((b) => b.status === 'awaiting_payment').length;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <p className="label">{formatDayDate(new Date().toISOString())}</p>
          <h1 className="type-display-s">Today</h1>
        </div>
      </header>

      <div className="adm-stats">
        <Stat label="Payments to check" value={data.needsChecking.length} tone={data.needsChecking.length ? 'is-alert' : ''} />
        <Stat label="Visits today" value={todays.length} />
        <Stat label="Visits tomorrow" value={tomorrows.length} />
        <Stat label="Awaiting payment" value={awaiting} />
      </div>

      <section className="adm-section" aria-labelledby="needs-title">
        <h2 id="needs-title" className="adm-section-title">
          Needs checking
        </h2>
        {data.needsChecking.length === 0 ? <p className="adm-empty">Nothing waiting for a payment check.</p> : null}
        <div className="adm-cards">
          {data.needsChecking.map((b) => (
            <BookingCard key={b.id} b={b} onChanged={load} onError={onError} />
          ))}
        </div>
      </section>

      <section className="adm-section" aria-labelledby="today-title">
        <h2 id="today-title" className="adm-section-title">
          Today
        </h2>
        {todays.length === 0 ? <p className="adm-empty">No visits booked for today.</p> : null}
        <div className="adm-cards">
          {todays.map((b) => (
            <BookingCard key={b.id} b={b} onChanged={load} onError={onError} />
          ))}
        </div>
      </section>

      <section className="adm-section" aria-labelledby="tomorrow-title">
        <h2 id="tomorrow-title" className="adm-section-title">
          Tomorrow
        </h2>
        {tomorrows.length === 0 ? <p className="adm-empty">No visits booked for tomorrow.</p> : null}
        <div className="adm-cards">
          {tomorrows.map((b) => (
            <BookingCard key={b.id} b={b} onChanged={load} onError={onError} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** One booking as a card: the time, the patient, the status, the quick contacts and the actions. */
export function BookingCard({ b, onChanged, onError }) {
  const first = b.name.split(' ')[0];
  const tel = `tel:${b.phone}`;
  const wa = confirmPatient(b.phone, { firstName: first, day: formatDayDate(b.start).split(' ')[0], date: formatDayDate(b.start), time: formatTime(b.start), address: ADDRESS });
  const reminder = remindPatient(b.phone, { firstName: first, date: formatDayDate(b.start), time: formatTime(b.start) });
  const alert = b.status === 'payment_submitted';
  return (
    <article className={`adm-card-booking ${alert ? 'is-alert' : ''}`.trim()} data-reveal>
      <div className="adm-time">
        <p className="adm-time-hour tabular">{formatTime(b.start)}</p>
        <p className="adm-time-day">{formatDayDate(b.start)}</p>
      </div>
      <div className="adm-booking-main">
        <div className="adm-booking-top">
          <p className="adm-booking-name">{b.name}</p>
          <StatusChip status={b.status} />
        </div>
        <p className="adm-booking-meta">
          {b.type} · {b.ref} · {displayNgPhone(b.phone)}
          {b.amountDue !== null ? ` · ${formatNaira(b.amountDue)}` : ''}
        </p>
        <div className="adm-booking-actions">
          <div className="adm-quick">
            <a className="adm-quick-link" href={tel}>
              Call
            </a>
            <a className="adm-quick-link" href={wa}>
              WhatsApp
            </a>
            <a className="adm-quick-link" href={reminder}>
              Send reminder
            </a>
          </div>
          <BookingActions booking={b} onChanged={onChanged} onError={onError} />
        </div>
      </div>
    </article>
  );
}
