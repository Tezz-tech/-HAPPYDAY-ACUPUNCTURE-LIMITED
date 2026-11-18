import { SectionHead } from '../components/layout/SectionHead.jsx';
import { InquiryForm } from '../components/features/InquiryForm.jsx';
import { VisitCard } from '../components/features/VisitCard.jsx';
import { clinic } from '../content/index.js';
import { seoMeta } from '../lib/seo.js';
import { PHONE_DISPLAY, PHONE_TEL, WA_LINKS } from '../lib/site.js';

export function meta() {
  return seoMeta({
    title: 'Contact Happyday Acupuncture | Jabi, Abuja',
    description:
      'Questions before you book? Message Happyday Acupuncture on WhatsApp, call 0803 640 4321, or send an inquiry. Find us in Jabi, Abuja.',
    path: '/contact',
  });
}

export default function Contact() {
  const emailTodo = clinic.contact.email.startsWith('TODO_CLIENT');
  return (
    <main className="page page-contact">
      <section className="page-hero" aria-labelledby="contact-title">
        <p className="label">Contact</p>
        <h1 id="contact-title" className="type-display-l">
          Talk to <em>us.</em>
        </h1>
        <p className="type-lead">Questions before you book? Message us. We would rather you ask than wonder.</p>
      </section>

      <section className="section" aria-labelledby="ways-title">
        <SectionHead code="KI1" pinyin="Yǒngquán" id="ways-title" title="Ways to reach us" />
        <ul className="contact-rows">
          <li className="contact-row">
            <p className="label">WhatsApp</p>
            <a href={WA_LINKS.general} className="type-display-s link-underline">
              Chat on WhatsApp
            </a>
            <p className="type-small">The fastest way to reach us.</p>
          </li>
          <li className="contact-row">
            <p className="label">Call</p>
            <a href={PHONE_TEL} className="type-display-s link-underline">
              {PHONE_DISPLAY}
            </a>
          </li>
          <li className="contact-row">
            <p className="label">Email</p>
            {emailTodo ? (
              <p className="type-body">Our email address is being set up. Please use WhatsApp for now.</p>
            ) : (
              <a href={`mailto:${clinic.contact.email}`} className="type-display-s link-underline">
                {clinic.contact.email}
              </a>
            )}
          </li>
        </ul>
      </section>

      <section className="section" aria-labelledby="form-title">
        <SectionHead code="LI4" pinyin="Hégǔ" id="form-title" title="Send an inquiry" />
        <InquiryForm />
      </section>

      <section className="section" aria-labelledby="visit-title">
        <SectionHead code="KI1" pinyin="Yǒngquán" id="visit-title" title="Find us" />
        <VisitCard />
      </section>
    </main>
  );
}
