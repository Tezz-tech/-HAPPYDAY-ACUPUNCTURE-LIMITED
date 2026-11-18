import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { BookingView, loadBooking } from '../components/features/booking/BookingView.jsx';

export function meta() {
  return [{ title: 'Booking received | Happyday Acupuncture' }, { name: 'robots', content: 'noindex' }];
}

/** Confirmation: the seal stamps onto the summary (docs/02 §5.6). */
export default function Confirmed() {
  const { ref } = useParams();
  const [params] = useSearchParams();
  const token = params.get('t') ?? '';
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    loadBooking(ref, token, controller.signal)
      .then(setBooking)
      .catch((err) => {
        if (err.name !== 'AbortError') setError('We could not find that booking. Check the link, or WhatsApp us.');
      });
    return () => controller.abort();
  }, [ref, token]);

  if (error) return <main className="page page-book"><p className="type-body">{error}</p></main>;
  if (!booking) return <main className="page page-book"><p className="type-body">Loading your booking…</p></main>;
  return (
    <main className="page page-book">
      <BookingView booking={{ ...booking, ref }} token={token} confirmed />
    </main>
  );
}
