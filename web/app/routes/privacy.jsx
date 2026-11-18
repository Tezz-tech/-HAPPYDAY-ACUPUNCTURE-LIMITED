import { clinic } from '../content/index.js';
import { seoMeta } from '../lib/seo.js';
import { ADDRESS, PHONE_DISPLAY } from '../lib/site.js';
import { LegalBanner } from '../components/layout/LegalBanner.jsx';

export function meta() {
  return seoMeta({
    title: 'Privacy | Happyday Acupuncture',
    description: 'How Happyday Acupuncture Limited collects, uses and protects your personal and health information.',
    path: '/privacy',
  });
}

export default function Privacy() {
  return (
    <main className="page page-legal">
      <LegalBanner />
      <h1 className="type-display-l">Privacy</h1>
      <p className="type-lead">
        This page explains what we collect, why, and what your rights are under the Nigeria Data Protection Act 2023.
      </p>

      <h2 className="type-display-s">Who we are</h2>
      <p className="type-body">
        {clinic.legalName}, {ADDRESS}. Phone {PHONE_DISPLAY}. We are the data controller for the information described here.
      </p>

      <h2 className="type-display-s">What we collect</h2>
      <p className="type-body">
        Contact details (name, phone and, if you give it, email), booking details (the appointment type, time and
        concern), and any notes you choose to add about your concern. We collect only what we need to provide care and to
        contact you.
      </p>

      <h2 className="type-display-s">Why we use it, and the legal basis</h2>
      <p className="type-body">
        To provide your care and to contact you about it. The legal basis is your consent, which you give when you tick
        the box on our forms, and providing the care you ask for.
      </p>

      <h2 className="type-display-s">Who sees it</h2>
      <p className="type-body">
        Clinic staff only. We use service providers, such as hosting and email, under contract that requires them to
        protect your data.
      </p>

      <h2 className="type-display-s">How long we keep it</h2>
      <p className="type-body">
        Bookings and inquiries are kept for 24 months, then anonymised. We may change this period, and we will update
        this page if we do.
      </p>

      <h2 className="type-display-s">Your rights</h2>
      <p className="type-body">
        You can ask to see, correct or delete your information, and you can withdraw your consent at any time. You can
        also complain to the Nigeria Data Protection Commission.
      </p>

      <h2 className="type-display-s">Security</h2>
      <p className="type-body">
        Information is sent over encrypted connections, and access is limited to clinic staff.
      </p>

      <h2 className="type-display-s">Cookies</h2>
      <p className="type-body">
        We do not use tracking cookies. The map loads only when you choose to load it.
      </p>
    </main>
  );
}
