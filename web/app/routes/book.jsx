import { BookingFlow } from '../components/features/booking/BookingFlow.jsx';

export function meta() {
  return [{ title: 'Book a visit | Happyday Acupuncture' }, { name: 'robots', content: 'noindex' }];
}

/** The booking flow. Single-page only (not prerendered). docs/03 booking, docs/04. */
export default function Book() {
  return (
    <main className="page page-book">
      <div className="book-page-head">
        <p className="label">Book a visit</p>
      </div>
      <BookingFlow />
    </main>
  );
}
