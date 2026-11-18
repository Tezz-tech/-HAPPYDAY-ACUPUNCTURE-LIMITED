import { useEffect, useState } from 'react';
import { api, ApiError } from '../../../lib/api.js';
import { formatNaira, FEE_TBC } from '@happyday/shared/money';
import { formatDayDate, formatTime } from '@happyday/shared/time';
import { receipt } from '@happyday/shared/whatsapp';
import { Button } from '../../ui/Button.jsx';
import { Icon } from '../../ui/Icon.jsx';
import { useToast } from '../../../hooks/useToast.js';
import { useCopy } from '../../../hooks/useCopy.js';

/**
 * Step 5: pay and confirm (docs/03 booking step 5, docs/04 bank transfer). Bank details with copy buttons, the
 * reference for the narration, a countdown to the hold, and "I have made the transfer" (payment_submitted).
 * Pay at clinic confirms straight away.
 * @param {{ draft: any, onDone: (ref: string, token: string) => void, onBack: () => void }} props
 */
export function StepPay({ draft, onDone, onBack }) {
  const toast = useToast();
  const booking = draft.booking;
  const payment = booking?.payment ?? {};
  const token = booking ? new URL(`http://x${booking.manageUrl}`).searchParams.get('t') : null;
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const copy = useCopy();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!booking) {
    return (
      <section className="booking-step">
        <p className="type-body">Your booking is not ready yet.</p>
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
      </section>
    );
  }

  const minutesLeft = payment.holdExpiresAt ? Math.max(0, Math.round((new Date(payment.holdExpiresAt).getTime() - now) / 60000)) : null;
  const payAtClinic = payment.mode === 'pay_at_clinic';
  const amount = payment.amountDue;
  const bank = payment.bank;

  async function submitted() {
    setBusy(true);
    try {
      await api(`/bookings/${booking.ref}/payment-submitted?t=${token}`, { method: 'POST' });
      onDone(booking.ref, token);
    } catch (err) {
      toast.show(err instanceof ApiError ? err.message : 'Something went wrong. Please WhatsApp us.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="booking-step" aria-labelledby="pay-title">
      <h1 id="pay-title" className="type-display-m">
        {payAtClinic ? 'Pay at the clinic' : 'Pay and confirm'}
      </h1>

      {payAtClinic ? (
        <>
          <p className="type-body">Pay at the clinic on the day. Your appointment is held for you.</p>
          <Button variant="primary" cta onClick={() => onDone(booking.ref, token)}>
            Confirm booking
          </Button>
        </>
      ) : (
        <>
          <div className="pay-card">
            {amount === null || amount === undefined ? (
              <p className="type-body">
                {FEE_TBC}. We will confirm the amount on WhatsApp, and your time is held in the meantime.
              </p>
            ) : (
              <p className="type-body">
                To hold your appointment, transfer <strong>{formatNaira(amount)}</strong> to:
              </p>
            )}
            {bank ? (
              <dl className="bank-list">
                <div>
                  <dt>Bank</dt>
                  <dd>{bank.bankName}</dd>
                </div>
                <div>
                  <dt>Account name</dt>
                  <dd>
                    {bank.accountName}
                    <CopyButton label="account name" value={bank.accountName} copy={copy} />
                  </dd>
                </div>
                <div>
                  <dt>Account number</dt>
                  <dd>
                    <span className="tabular">{bank.accountNumber}</span>
                    <CopyButton label="account number" value={bank.accountNumber} copy={copy} />
                  </dd>
                </div>
              </dl>
            ) : null}
            <p className="type-body">
              Add this reference to the transfer narration: <strong className="tabular">{booking.ref}</strong>
              <CopyButton label="reference" value={booking.ref} copy={copy} />
            </p>
            {minutesLeft !== null ? (
              <p className="type-small" aria-live="polite">
                We will hold this time for {formatHold(minutesLeft)}.
              </p>
            ) : null}
          </div>
          <div className="pay-actions">
            <Button variant="primary" cta onClick={submitted} disabled={busy}>
              I have made the transfer
            </Button>
            <Button
              variant="whatsapp"
              icon="whatsapp"
              href={receipt({ ref: booking.ref, date: formatDayDate(draft.start), time: formatTime(draft.start) })}
            >
              Send receipt on WhatsApp
            </Button>
          </div>
        </>
      )}

      <div className="step-nav">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <a className="link-underline" href={`/booking/${booking.ref}?t=${token}`}>
          Change something
        </a>
      </div>
      <p className="type-small">Booking reference {booking.ref}. Status: {booking.status.replace('_', ' ')}.</p>
      <span className="visually-hidden" aria-live="polite">
        {copy.message}
      </span>
    </section>
  );
}

/** @param {number} mins */
function formatHold(mins) {
  if (mins >= 120) return `${Math.round(mins / 60)} hours`;
  if (mins >= 60) return 'an hour';
  return `${mins} minutes`;
}

function CopyButton({ label, value, copy }) {
  const done = copy.last === value;
  return (
    <button type="button" className="copy-button" onClick={() => copy.copy(value)} aria-label={`Copy ${label}`}>
      {done ? <Icon name="check" size={16} /> : <Icon name="copy" size={16} />}
      <span className="visually-hidden">{done ? 'Copied' : `Copy ${label}`}</span>
    </button>
  );
}
