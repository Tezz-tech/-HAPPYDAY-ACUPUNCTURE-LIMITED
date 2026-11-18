import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { BookingView, loadBooking } from '../components/features/booking/BookingView.jsx';
import { Button } from '../components/ui/Button.jsx';
import { api, ApiError } from '../lib/api.js';
import { WA_LINKS } from '../lib/site.js';

export function meta() {
  return [{ title: 'Your booking | Happyday Acupuncture' }, { name: 'robots', content: 'noindex' }];
}

/** Manage a booking from the link we sent (docs/04 manage links). Cancel inside the notice window is refused. */
export default function Manage() {
  const { ref } = useParams();
  const [params] = useSearchParams();
  const token = params.get('t') ?? '';
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirming, setConfirming] = useState(false);

  function reload(signal) {
    return loadBooking(ref, token, signal)
      .then(setBooking)
      .catch((err) => {
        if (err.name !== 'AbortError') setError('This link is not valid, or the booking has ended.');
      });
  }

  useEffect(() => {
    const controller = new AbortController();
    reload(controller.signal);
    return () => controller.abort();
  }, [ref, token]);

  async function cancel() {
    setNotice('');
    try {
      await api(`/bookings/${ref}/cancel?t=${encodeURIComponent(token)}`, { method: 'POST' });
      setConfirming(false);
      await reload();
      setNotice('Your booking is cancelled.');
    } catch (err) {
      setNotice(err instanceof ApiError ? err.message : 'Something went wrong. Please WhatsApp us.');
    }
  }

  if (error) return <main className="page page-book"><p className="type-body">{error}</p></main>;
  if (!booking) return <main className="page page-book"><p className="type-body">Loading your booking…</p></main>;

  const canCancel = ['awaiting_payment', 'payment_submitted', 'confirmed'].includes(booking.status);
  return (
    <main className="page page-book">
      <BookingView booking={{ ...booking, ref }} token={token}>
        {notice ? <p className="type-body" role="status">{notice}</p> : null}
        {canCancel ? (
          <div className="manage-actions">
            {confirming ? (
              <>
                <p className="type-body">Cancel this appointment?</p>
                <Button variant="secondary" onClick={cancel}>
                  Yes, cancel it
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  Keep it
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setConfirming(true)}>
                Cancel this appointment
              </Button>
            )}
            <Button variant="whatsapp" icon="whatsapp" href={WA_LINKS.general}>
              Change it on WhatsApp
            </Button>
          </div>
        ) : null}
      </BookingView>
    </main>
  );
}
