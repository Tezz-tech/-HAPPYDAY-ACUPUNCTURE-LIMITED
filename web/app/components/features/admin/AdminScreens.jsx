import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { formatDayDate, formatTime } from '@happyday/shared/time';
import { formatNaira } from '@happyday/shared/money';
import { Button } from '../../ui/Button.jsx';
import { Input } from '../../ui/Input.jsx';

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

/** Bookings list with filters and search (docs/04 admin screen 2). CSV export is a gap for Phase 7. */
export function AdminBookings({ onError }) {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [data, load] = useFetch(`/admin/bookings?status=${status}&q=${encodeURIComponent(q)}`, onError);
  return (
    <div className="admin-stack">
      <form
        className="admin-inline"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <label className="visually-hidden" htmlFor="admin-q">
          Search by name or reference
        </label>
        <input id="admin-q" className="admin-input" placeholder="Name or HD- reference" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="visually-hidden" htmlFor="admin-status">
          Status
        </label>
        <select id="admin-status" className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="awaiting_payment">Awaiting payment</option>
          <option value="payment_submitted">Payment sent</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No-show</option>
          <option value="expired">Expired</option>
        </select>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
      {!data ? <p className="type-small">Loading…</p> : null}
      {data?.items.length === 0 ? <p className="type-small">No bookings match.</p> : null}
      {data?.items.map((b) => (
        <article key={b.id} className="admin-row">
          <div className="admin-row-main">
            <p className="admin-time tabular">
              {formatDayDate(b.start)}, {formatTime(b.start)}
            </p>
            <p className="admin-name">
              {b.name} <span className="type-small">· {b.type}</span>
            </p>
            <p className="type-small">
              {b.ref} · {b.status.replace('_', ' ')}
              {b.amountDue !== null ? ` · due ${formatNaira(b.amountDue)}` : ''}
              {b.amountPaid !== null ? ` · paid ${formatNaira(b.amountPaid)}` : ''}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Bank details, payment mode and cancellation notice (docs/04 admin screen 9, owner only). */
export function AdminSettings({ onError }) {
  const [data, load] = useFetch('/admin/settings', onError);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState('');
  const value = draft ?? data;
  if (!value) return <p className="type-small">Loading…</p>;
  const bank = value.bank ?? {};

  async function save(e) {
    e.preventDefault();
    try {
      await api('/admin/settings', { method: 'PUT', body: { ...value, bank, cancellationNoticeHours: Number(value.cancellationNoticeHours), unpaidHoldMinutes: Number(value.unpaidHoldMinutes) } });
      setSaved('Saved.');
      setDraft(null);
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not save.');
    }
  }

  return (
    <form className="admin-card" onSubmit={save} noValidate>
      <Input label="Bank" value={bank.bankName ?? ''} onChange={(e) => setDraft({ ...value, bank: { ...bank, bankName: e.target.value } })} />
      <Input label="Account name" value={bank.accountName ?? ''} onChange={(e) => setDraft({ ...value, bank: { ...bank, accountName: e.target.value } })} />
      <Input label="Account number" inputMode="numeric" value={bank.accountNumber ?? ''} onChange={(e) => setDraft({ ...value, bank: { ...bank, accountNumber: e.target.value } })} />
      <label className="admin-field">
        Payment mode
        <select className="admin-input" value={value.paymentMode ?? 'transfer_deposit'} onChange={(e) => setDraft({ ...value, paymentMode: e.target.value })}>
          <option value="transfer_deposit">Transfer deposit</option>
          <option value="transfer_full">Transfer in full</option>
          <option value="pay_at_clinic">Pay at the clinic</option>
        </select>
      </label>
      <Input label="Hold unpaid times (minutes)" inputMode="numeric" value={String(value.unpaidHoldMinutes ?? 180)} onChange={(e) => setDraft({ ...value, unpaidHoldMinutes: e.target.value })} />
      <Input label="Cancellation notice (hours)" inputMode="numeric" value={String(value.cancellationNoticeHours ?? 24)} onChange={(e) => setDraft({ ...value, cancellationNoticeHours: e.target.value })} />
      <label className="admin-check">
        <input type="checkbox" checked={value.hoursArePlaceholder ?? true} onChange={(e) => setDraft({ ...value, hoursArePlaceholder: e.target.checked })} />
        Hours are still placeholders (the site says &quot;Hours are confirmed on WhatsApp&quot;)
      </label>
      <Button type="submit" variant="primary">
        Save settings
      </Button>
      {saved ? <p className="type-small" role="status">{saved}</p> : null}
    </form>
  );
}

/** Appointment types: name, duration, price and deposit (docs/04 admin screen 6, owner only). */
export function AdminPrices({ onError }) {
  const [data, load] = useFetch('/admin/appointment-types', onError);
  if (!data) return <p className="type-small">Loading…</p>;

  async function update(slug, patch) {
    try {
      await api(`/admin/appointment-types/${slug}`, { method: 'PATCH', body: patch });
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not save that.');
    }
  }

  return (
    <div className="admin-stack">
      {data.items.map((t) => (
        <form
          key={t.slug}
          className="admin-card"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const num = (k) => (f.get(k) === '' ? null : Number(f.get(k)));
            update(t.slug, { priceNaira: num('priceNaira'), depositNaira: num('depositNaira'), durationMinutes: Number(f.get('durationMinutes')) });
          }}
        >
          <p className="admin-name">{t.name}</p>
          <p className="type-small">Currently {formatNaira(t.priceNaira)}. Leave a price empty to show &quot;Fee confirmed on booking&quot;.</p>
          <label className="admin-field">
            Price (₦)
            <input className="admin-input" name="priceNaira" inputMode="numeric" defaultValue={t.priceNaira ?? ''} />
          </label>
          <label className="admin-field">
            Deposit (₦)
            <input className="admin-input" name="depositNaira" inputMode="numeric" defaultValue={t.depositNaira ?? ''} />
          </label>
          <label className="admin-field">
            Duration (minutes)
            <input className="admin-input" name="durationMinutes" inputMode="numeric" defaultValue={t.durationMinutes} />
          </label>
          <Button type="submit" variant="secondary">
            Save {t.name.toLowerCase()}
          </Button>
        </form>
      ))}
    </div>
  );
}

/** Closures and custom hours (docs/04 admin screen 5). Staff can manage these. */
export function AdminClosures({ onError }) {
  const [data, load] = useFetch('/admin/exceptions', onError);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  async function add(e) {
    e.preventDefault();
    try {
      await api(`/admin/exceptions/${date}`, { method: 'PUT', body: { closed: true, note } });
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
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not reopen that day.');
    }
  }

  return (
    <div className="admin-stack">
      <form className="admin-card" onSubmit={add}>
        <label className="admin-field">
          Close a day (YYYY-MM-DD)
          <input className="admin-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label className="admin-field">
          Note (optional)
          <input className="admin-input" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <Button type="submit" variant="primary" disabled={!date}>
          Close this day
        </Button>
      </form>
      {(data?.items ?? []).map((ex) => (
        <div key={ex.date} className="admin-row">
          <div className="admin-row-main">
            <p className="admin-name tabular">{ex.date}</p>
            <p className="type-small">{ex.closed ? 'Closed' : 'Custom hours'}{ex.note ? ` · ${ex.note}` : ''}</p>
          </div>
          <Button variant="ghost" onClick={() => remove(ex.date)}>
            Reopen
          </Button>
        </div>
      ))}
    </div>
  );
}

/** Inquiries inbox with status and reply shortcuts (docs/04 admin screen 7). */
export function AdminInquiries({ onError }) {
  const [data, load] = useFetch('/admin/inquiries', onError);
  if (!data) return <p className="type-small">Loading…</p>;
  async function setStatus(id, status) {
    try {
      await api(`/admin/inquiries/${id}`, { method: 'PATCH', body: { status } });
      load();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Could not update that.');
    }
  }
  return (
    <div className="admin-stack">
      {data.items.length === 0 ? <p className="type-small">No inquiries yet.</p> : null}
      {data.items.map((i) => (
        <article key={i._id} className="admin-row">
          <div className="admin-row-main">
            <p className="admin-name">
              {i.name} <span className="type-small">· {i.topic}</span>
            </p>
            <p className="type-body">{i.message}</p>
            <p className="type-small">
              {i.status} · reply by {i.replyVia}
            </p>
          </div>
          <div className="admin-row-actions">
            <Button variant="ghost" onClick={() => setStatus(i._id, 'replied')}>
              Mark replied
            </Button>
            <Button variant="ghost" onClick={() => setStatus(i._id, 'closed')}>
              Close
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

