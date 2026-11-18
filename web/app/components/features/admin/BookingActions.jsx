import { useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { Button } from '../../ui/Button.jsx';

/** Status actions for one booking. Mark paid asks for the amount received first (docs/04). */
export function BookingActions({ booking, onChanged, onError }) {
  const [amount, setAmount] = useState('');
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);

  async function act(action, extra = {}) {
    setBusy(true);
    try {
      await api(`/admin/bookings/${booking.id}`, { method: 'PATCH', body: { action, ...extra } });
      setAsking(false);
      onChanged();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'That did not work. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  const s = booking.status;
  return (
    <div className="admin-actions">
      {s === 'awaiting_payment' || s === 'payment_submitted' ? (
        asking ? (
          <form
            className="admin-inline"
            onSubmit={(e) => {
              e.preventDefault();
              const value = Number(amount);
              if (!Number.isFinite(value) || value < 0) return onError('Enter the amount received, in naira.');
              act('markPaid', { amount: value, method: 'transfer' });
            }}
          >
            <label className="visually-hidden" htmlFor={`amt-${booking.id}`}>
              Amount received in naira
            </label>
            <input id={`amt-${booking.id}`} className="admin-input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button type="submit" variant="primary" disabled={busy}>
              Save
            </Button>
          </form>
        ) : (
          <Button variant="secondary" onClick={() => setAsking(true)}>
            Mark paid
          </Button>
        )
      ) : null}
      {s === 'awaiting_payment' || s === 'payment_submitted' ? (
        <Button variant="secondary" onClick={() => act('confirm')} disabled={busy}>
          Confirm
        </Button>
      ) : null}
      {s === 'confirmed' ? (
        <>
          <Button variant="secondary" onClick={() => act('complete')} disabled={busy}>
            Complete
          </Button>
          <Button variant="ghost" onClick={() => act('noShow')} disabled={busy}>
            No-show
          </Button>
        </>
      ) : null}
      {['awaiting_payment', 'payment_submitted', 'confirmed'].includes(s) ? (
        <Button variant="ghost" onClick={() => act('cancel', { reason: 'cancelled by the clinic' })} disabled={busy}>
          Cancel
        </Button>
      ) : null}
    </div>
  );
}
