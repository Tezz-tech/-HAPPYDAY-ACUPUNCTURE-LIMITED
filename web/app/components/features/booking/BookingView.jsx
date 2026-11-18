import { formatDayDate, formatTime } from '@happyday/shared/time';
import { formatNaira } from '@happyday/shared/money';
import { ADDRESS, MAP_LINK, PHONE_TEL, WA_LINKS } from '../../../lib/site.js';
import { api } from '../../../lib/api.js';
import { Seal } from '../../brand/Seal.jsx';
import { TextLink } from '../../ui/TextLink.jsx';

const STATUS_TEXT = {
  awaiting_payment: 'Awaiting payment',
  payment_submitted: 'Payment sent. We are checking it.',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
  no_show: 'No-show',
};

/** Google Calendar template link for the booking (docs/03 confirmation). */
function googleCalendarUrl(b, address) {
  const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${b.type}, Happyday Acupuncture`,
    dates: `${fmt(b.start)}/${fmt(b.end)}`,
    location: address,
    details: `Booking reference ${b.ref}.`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Shared view for a booking: the confirmation page and the manage page (docs/03 confirmation, docs/04 manage links).
 * Calendar and directions links, the WhatsApp contact, and the status line.
 * @param {{ booking: any, token: string, confirmed?: boolean, children?: import('react').ReactNode }} props
 */
export function BookingView({ booking, token, confirmed = false, children }) {
  const ics = `/api/v1/bookings/${booking.ref}/ics?t=${token}`;
  const end = booking.end ?? new Date(new Date(booking.start).getTime() + 60 * 60000).toISOString();
  return (
    <section className="booking-view" aria-labelledby="booking-title">
      {confirmed ? <Seal size={96} stamp /> : null}
      <h1 id="booking-title" className="type-display-m">
        {confirmed && booking.status === 'confirmed' ? "You're booked in." : confirmed ? 'Request received.' : 'Your booking'}
      </h1>
      <p className="type-lead">
        {booking.status === 'awaiting_payment'
          ? 'We are holding your time while the transfer is made. Once we see your payment, we will confirm it.'
          : booking.status === 'payment_submitted'
            ? 'Thanks. We will check and confirm shortly, usually within a few hours during opening times.'
            : ''}
      </p>
      <dl className="booking-details">
        <div>
          <dt>Appointment</dt>
          <dd>{booking.type}</dd>
        </div>
        <div>
          <dt>When</dt>
          <dd>
            {formatDayDate(booking.start)}, {formatTime(booking.start)} (Abuja time)
          </dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>{ADDRESS}</dd>
        </div>
        <div>
          <dt>Reference</dt>
          <dd className="tabular">{booking.ref}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{STATUS_TEXT[booking.status] ?? booking.status}</dd>
        </div>
        {booking.payment?.amountDue !== null && booking.payment?.amountDue !== undefined ? (
          <div>
            <dt>Amount</dt>
            <dd>{formatNaira(booking.payment.amountDue)}</dd>
          </div>
        ) : null}
      </dl>
      <div className="booking-actions">
        <TextLink href={ics}>Add to calendar</TextLink>
        <TextLink href={googleCalendarUrl({ ...booking, end }, ADDRESS)}>Google Calendar</TextLink>
        <TextLink href={MAP_LINK}>Get directions</TextLink>
        <TextLink href={WA_LINKS.general}>Message us on WhatsApp</TextLink>
        <TextLink href={PHONE_TEL}>Call the clinic</TextLink>
      </div>
      {children}
      <p className="type-small">Need to change it? Use the link we sent you, or WhatsApp us.</p>
    </section>
  );
}

/** Fetches a booking for the confirmation and manage pages. */
export async function loadBooking(ref, token, signal) {
  return api(`/bookings/${ref}?t=${encodeURIComponent(token ?? '')}`, { signal });
}
