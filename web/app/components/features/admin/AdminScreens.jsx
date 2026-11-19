import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { formatDayDate, formatTime } from '@happyday/shared/time';
import { formatNaira } from '@happyday/shared/money';
import { Button } from '../../ui/Button.jsx';
import { Input } from '../../ui/Input.jsx';
import { useToast } from '../../../hooks/useToast.js';
import { StatusChip } from './StatusChip.jsx';

/** Shared loader: fetches once, shows errors through the caller. */
function useFetch(path, onError) {
  const [data, setData] = useState(null);
  const load = useCallback(async () => {
    try {
      setData(await api(path));
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not load.');
    }
  }, [path, onError]);
  useEffect(() => {
    load();
  }, [load]);
  return [data, load];
}

/** A page heading with a short line under it, used by every admin screen. */
function PageHead({ kicker, title, lead }) {
  return (
    <header className="adm-head">
      <div>
        {kicker ? <p className="label">{kicker}</p> : null}
        <h1 className="type-display-s">{title}</h1>
        {lead ? <p className="type-small adm-lead">{lead}</p> : null}
      </div>
    </header>
  );
}

const FILTERS = [
  ['', 'All'],
  ['awaiting_payment', 'Awaiting payment'],
  ['payment_submitted', 'Payment sent'],
  ['confirmed', 'Confirmed'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
  ['no_show', 'No-show'],
  ['expired', 'Expired'],
];

/** Bookings with status filters and search (docs/04 admin screen 2). CSV export is a gap for Phase 7. */
export function AdminBookings({ onError }) {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [data, load] = useFetch(`/admin/bookings?status=${status}&q=${encodeURIComponent(q)}`, onError);
  return (
    <div className="adm-page">
      <PageHead kicker="All visits" title="Bookings" lead="Search by name or reference, or filter by where each booking is up to." />
      <form
        className="adm-search"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <label className="visually-hidden" htmlFor="admin-q">
          Search by name or reference
        </label>
        <input id="admin-q" className="adm-input" placeholder="Name or HD- reference" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
      <div className="adm-filters" role="group" aria-label="Filter by status">
        {FILTERS.map(([value, label]) => (
          <button key={value || 'all'} type="button" className="adm-filter" aria-pressed={status === value} onClick={() => setStatus(value)}>
            {label}
          </button>
        ))}
      </div>
      {!data ? <p className="type-small adm-loading">Loading bookings…</p> : null}
      {data?.items.length === 0 ? <p className="adm-empty">No bookings match.</p> : null}
      <div className="adm-table-wrap">
        {data?.items.length ? (
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Patient</th>
                <th scope="col">Visit</th>
                <th scope="col">Status</th>
                <th scope="col" className="adm-num">
                  Paid
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((b) => (
                <tr key={b.id} data-reveal>
                  <td>
                    <span className="tabular">{formatDayDate(b.start)}</span>
                    <span className="adm-muted"> {formatTime(b.start)}</span>
                  </td>
                  <td>
                    <span className="adm-strong">{b.name}</span>
                    <span className="adm-muted"> · {b.ref}</span>
                  </td>
                  <td>{b.type}</td>
                  <td>
                    <StatusChip status={b.status} />
                  </td>
                  <td className="adm-num tabular">
                    {b.amountPaid !== null ? formatNaira(b.amountPaid) : b.amountDue !== null ? `due ${formatNaira(b.amountDue)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}

/** Closures: block a day off, or reopen it (docs/04 admin screen 5). Staff can manage these. */
export function AdminClosures({ onError }) {
  const toast = useToast();
  const [data, load] = useFetch('/admin/exceptions', onError);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  async function add(e) {
    e.preventDefault();
    try {
      await api(`/admin/exceptions/${date}`, { method: 'PUT', body: { closed: true, note } });
      toast.show(`Closed ${date}. No times will be offered that day.`);
      setDate('');
      setNote('');
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not close that day.');
    }
  }

  async function remove(d) {
    try {
      await api(`/admin/exceptions/${d}`, { method: 'DELETE' });
      toast.show(`Reopened ${d}.`);
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not reopen that day.');
    }
  }

  return (
    <div className="adm-page">
      <PageHead kicker="Days off" title="Closures" lead="Close a day and no times are offered to patients. Reopen it any time." />
      <form className="adm-panel adm-panel-row" onSubmit={add}>
        <label className="adm-field">
          Date
          <input className="adm-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label className="adm-field">
          Note (optional)
          <input className="adm-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="For example, public holiday" />
        </label>
        <Button type="submit" variant="primary" disabled={!date}>
          Close this day
        </Button>
      </form>
      <h2 className="adm-section-title">Closed days</h2>
      {(data?.items ?? []).length === 0 ? <p className="adm-empty">No days are closed.</p> : null}
      <div className="adm-cards">
        {(data?.items ?? []).map((ex) => (
          <div key={ex.date} className="adm-card-booking adm-card-slim" data-reveal>
            <div className="adm-time">
              <p className="adm-time-day tabular">{ex.date}</p>
            </div>
            <div className="adm-booking-main">
              <p className="adm-booking-name">{ex.closed ? 'Closed' : 'Custom hours'}</p>
              {ex.note ? <p className="adm-booking-meta">{ex.note}</p> : null}
            </div>
            <Button variant="ghost" onClick={() => remove(ex.date)}>
              Reopen
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Inquiries inbox with status and reply shortcuts (docs/04 admin screen 7). */
export function AdminInquiries({ onError }) {
  const toast = useToast();
  const [data, load] = useFetch('/admin/inquiries', onError);
  async function setStatus(id, status) {
    try {
      await api(`/admin/inquiries/${id}`, { method: 'PATCH', body: { status } });
      toast.show(status === 'replied' ? 'Marked as replied.' : 'Inquiry closed.');
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not update that.');
    }
  }
  return (
    <div className="adm-page">
      <PageHead kicker="Contact form" title="Inquiries" lead="Messages from the website. Reply on WhatsApp, phone or email, then mark it replied." />
      {!data ? <p className="type-small adm-loading">Loading inquiries…</p> : null}
      {data?.items.length === 0 ? <p className="adm-empty">No inquiries yet.</p> : null}
      <div className="adm-cards">
        {(data?.items ?? []).map((i) => (
          <article key={i._id} className="adm-panel adm-inquiry" data-reveal>
            <div className="adm-booking-top">
              <p className="adm-booking-name">
                {i.name} <span className="adm-muted">· {i.topic}</span>
              </p>
              <span className={`adm-chip ${i.status === 'replied' ? 'adm-chip-green' : i.status === 'closed' ? 'adm-chip-quiet' : 'adm-chip-gold'}`}>
                {i.status}
              </span>
            </div>
            <p className="adm-message-text">{i.message}</p>
            <p className="adm-muted">Reply by {i.replyVia}</p>
            <div className="adm-quick">
              <Button variant="secondary" onClick={() => setStatus(i._id, 'replied')}>
                Mark replied
              </Button>
              <Button variant="ghost" onClick={() => setStatus(i._id, 'closed')}>
                Close
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/** Appointment types: name, duration, price and deposit (docs/04 admin screen 6, owner only). */
export function AdminPrices({ onError }) {
  const toast = useToast();
  const [data, load] = useFetch('/admin/appointment-types', onError);
  if (!data) return <p className="type-small adm-loading">Loading prices…</p>;

  async function update(slug, name, patch) {
    try {
      await api(`/admin/appointment-types/${slug}`, { method: 'PATCH', body: patch });
      toast.show(`${name} saved.`);
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not save that.');
    }
  }

  return (
    <div className="adm-page">
      <PageHead kicker="Owner only" title="Prices" lead="Leave a price empty and the site says “Fee confirmed on booking”. Existing bookings keep the price they were made at." />
      <div className="adm-cards adm-cards-grid">
        {data.items.map((t) => (
          <form
            key={t.slug}
            className="adm-panel adm-price"
            data-reveal
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const num = (k) => (f.get(k) === '' ? null : Number(f.get(k)));
              update(t.slug, t.name, { priceNaira: num('priceNaira'), depositNaira: num('depositNaira'), durationMinutes: Number(f.get('durationMinutes')) });
            }}
          >
            <p className="adm-booking-name">{t.name}</p>
            <p className="adm-muted">Showing now: {t.priceNaira === null ? 'Fee confirmed on booking' : formatNaira(t.priceNaira)}</p>
            <div className="adm-price-fields">
              <label className="adm-field">
                Price (₦)
                <input className="adm-input" name="priceNaira" inputMode="numeric" defaultValue={t.priceNaira ?? ''} />
              </label>
              <label className="adm-field">
                Deposit (₦)
                <input className="adm-input" name="depositNaira" inputMode="numeric" defaultValue={t.depositNaira ?? ''} />
              </label>
              <label className="adm-field">
                Minutes
                <input className="adm-input" name="durationMinutes" inputMode="numeric" defaultValue={t.durationMinutes} />
              </label>
            </div>
            <Button type="submit" variant="secondary">
              Save {t.name.toLowerCase()}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}

/** Bank details, payment mode, cancellation notice and the placeholder-hours flag (docs/04 admin screen 9, owner only). */
export function AdminSettings({ onError }) {
  const toast = useToast();
  const [data, load] = useFetch('/admin/settings', onError);
  const [draft, setDraft] = useState(null);
  const value = draft ?? data;
  if (!value) return <p className="type-small adm-loading">Loading settings…</p>;
  const bank = value.bank ?? {};

  async function save(e) {
    e.preventDefault();
    try {
      await api('/admin/settings', { method: 'PUT', body: { ...value, bank, cancellationNoticeHours: Number(value.cancellationNoticeHours), unpaidHoldMinutes: Number(value.unpaidHoldMinutes) } });
      toast.show('Settings saved.');
      setDraft(null);
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not save.');
    }
  }

  return (
    <div className="adm-page">
      <PageHead kicker="Owner only" title="Settings" lead="Changes apply straight away to new bookings." />
      <form className="adm-settings" onSubmit={save} noValidate>
        <section className="adm-panel" aria-labelledby="bank-title">
          <h2 id="bank-title" className="adm-section-title">
            Bank details
          </h2>
          <p className="adm-muted">Patients transfer to this account. Check the name and number after any change.</p>
          <div className="adm-grid-2">
            <Input label="Bank" value={bank.bankName ?? ''} onChange={(e) => setDraft({ ...value, bank: { ...bank, bankName: e.target.value } })} />
            <Input label="Account name" value={bank.accountName ?? ''} onChange={(e) => setDraft({ ...value, bank: { ...bank, accountName: e.target.value } })} />
            <Input label="Account number" inputMode="numeric" value={bank.accountNumber ?? ''} onChange={(e) => setDraft({ ...value, bank: { ...bank, accountNumber: e.target.value } })} />
          </div>
        </section>

        <section className="adm-panel" aria-labelledby="pay-title">
          <h2 id="pay-title" className="adm-section-title">
            Payments and booking
          </h2>
          <div className="adm-grid-2">
            <label className="adm-field">
              Payment mode
              <select className="adm-input" value={value.paymentMode ?? 'transfer_deposit'} onChange={(e) => setDraft({ ...value, paymentMode: e.target.value })}>
                <option value="transfer_deposit">Transfer deposit</option>
                <option value="transfer_full">Transfer in full</option>
                <option value="pay_at_clinic">Pay at the clinic</option>
              </select>
            </label>
            <Input label="Hold unpaid times (minutes)" inputMode="numeric" value={String(value.unpaidHoldMinutes ?? 180)} onChange={(e) => setDraft({ ...value, unpaidHoldMinutes: e.target.value })} />
            <Input label="Cancellation notice (hours)" inputMode="numeric" value={String(value.cancellationNoticeHours ?? 24)} onChange={(e) => setDraft({ ...value, cancellationNoticeHours: e.target.value })} />
          </div>
        </section>

        <section className="adm-panel" aria-labelledby="hours-title">
          <h2 id="hours-title" className="adm-section-title">
            Website
          </h2>
          <label className="adm-check">
            <input type="checkbox" checked={value.hoursArePlaceholder ?? true} onChange={(e) => setDraft({ ...value, hoursArePlaceholder: e.target.checked })} />
            Hours are still placeholders. The site says “Hours are confirmed on WhatsApp”.
          </label>
        </section>

        <div className="adm-savebar">
          <Button type="submit" variant="primary">
            Save settings
          </Button>
        </div>
      </form>
    </div>
  );
}

export { PageHead };
