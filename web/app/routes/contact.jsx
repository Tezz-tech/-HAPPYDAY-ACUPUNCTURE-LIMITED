import { useState } from 'react';
import { SectionHead } from '../components/layout/SectionHead.jsx';
import { SplitFeature } from '../components/features/SplitFeature.jsx';
import { InquiryForm } from '../components/features/InquiryForm.jsx';
import { VisitCard } from '../components/features/VisitCard.jsx';
import { Icon } from '../components/ui/Icon.jsx';
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

/** A button that copies the phone number, and says so for two seconds. */
function CopyNumber() {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(PHONE_DISPLAY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button type="button" className="number-copy" onClick={copy} aria-live="polite">
      <Icon name={copied ? 'check' : 'copy'} size={16} />
      <span>{copied ? 'Copied' : 'Copy number'}</span>
    </button>
  );
}

export default function Contact() {
  const emailTodo = clinic.contact.email.startsWith('TODO_CLIENT');
  return (
    <main className="page page-inner page-contact">
      <section className="page-hero" aria-labelledby="contact-title">
        <SplitFeature photo="clinic-treatment-room" sizes="(min-width: 900px) 46vw, 92vw" reverse>
          <p className="label">Contact</p>
          <h1 id="contact-title" className="type-display-l">
            Talk to <em>us.</em>
          </h1>
          <p className="type-lead">Questions before you book? Message us. We would rather you ask than wonder.</p>
        </SplitFeature>
      </section>

      <section className="section" aria-labelledby="ways-title">
        <SectionHead id="ways-title" title="Ways to reach us" />
        <ul className="contact-cards">
          <li className="contact-card" data-reveal>
            <p className="label">WhatsApp</p>
            <a href={WA_LINKS.general} className="contact-card-main">
              Chat on WhatsApp
              <Icon name="arrow" size={20} />
            </a>
            <p className="type-small">The fastest way to reach us.</p>
          </li>
          <li className="contact-card" data-reveal style={{ '--i': 1 }}>
            <p className="label">Call</p>
            <a href={PHONE_TEL} className="contact-card-main">
              {PHONE_DISPLAY}
              <Icon name="arrow" size={20} />
            </a>
            <CopyNumber />
          </li>
          <li className="contact-card" data-reveal style={{ '--i': 2 }}>
            <p className="label">Email</p>
            {emailTodo ? (
              <p className="type-body">Our email address is being set up. Please use WhatsApp for now.</p>
            ) : (
              <a href={`mailto:${clinic.contact.email}`} className="contact-card-main">
                {clinic.contact.email}
                <Icon name="arrow" size={20} />
              </a>
            )}
          </li>
        </ul>
      </section>

      <section className="section" aria-labelledby="form-title">
        <SectionHead id="form-title" title="Send an inquiry" />
        <InquiryForm />
      </section>

      <section className="section" aria-labelledby="visit-title">
        <SectionHead id="visit-title" title="Find us" />
        <VisitCard />
      </section>
    </main>
  );
}
