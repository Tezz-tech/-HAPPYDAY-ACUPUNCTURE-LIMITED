import { clinic } from '../content/index.js';
import { seoMeta } from '../lib/seo.js';
import { DISCLAIMER } from '../lib/site.js';
import { LegalBanner } from '../components/layout/LegalBanner.jsx';

export function meta() {
  return seoMeta({
    title: 'Terms | Happyday Acupuncture',
    description: 'Booking, payment, cancellation and no-show terms for Happyday Acupuncture Limited.',
    path: '/terms',
  });
}

export default function Terms() {
  return (
    <main className="page page-legal">
      <LegalBanner />
      <h1 className="type-display-l">Terms</h1>
      <p className="type-lead">The terms for booking, paying for and attending an appointment with {clinic.legalName}.</p>

      <h2 className="type-display-s">Booking</h2>
      <p className="type-body">
        A booking holds a time for you. Your appointment is confirmed once we receive your payment, or, where you pay at the
        clinic, once we confirm the booking.
      </p>

      <h2 className="type-display-s">Payment</h2>
      <p className="type-body">
        Payment is by bank transfer unless we tell you otherwise. Please use the booking reference as the transfer
        narration. Fees are shown only when they have been confirmed.
      </p>

      <h2 className="type-display-s">Cancellation and no-shows</h2>
      <p className="type-body">
        Please cancel or reschedule at least {clinic.scheduling.cancellationNoticeHours} hours before your appointment. Later
        changes, and missed appointments, may be charged. This policy is a draft until the clinic confirms it.
      </p>

      <h2 className="type-display-s">Complementary care</h2>
      <p className="type-body">{DISCLAIMER}</p>

      <h2 className="type-display-s">Liability</h2>
      <p className="type-body">
        We take care in assessment and treatment. We cannot guarantee any result, and we do not give medical diagnoses.
        Nothing here limits any right you have under the law.
      </p>
    </main>
  );
}
