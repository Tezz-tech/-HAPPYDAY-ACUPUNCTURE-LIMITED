import { SectionHead } from '../components/layout/SectionHead.jsx';
import { Picture } from '../components/ui/Picture.jsx';
import { VisitSteps } from '../components/features/VisitSteps.jsx';
import { NeedleScale } from '../components/features/NeedleScale.jsx';
import { FaqList } from '../components/features/FaqList.jsx';
import { CtaPanel } from '../components/features/CtaPanel.jsx';
import { JsonLd } from '../components/seo/JsonLd.jsx';
import { clinic, faqs } from '../content/index.js';
import { formatNaira } from '@happyday/shared/money';
import { seoMeta } from '../lib/seo.js';
import { CARE_NOTE, STROKE_NOTE, WA_LINKS } from '../lib/site.js';

export function meta() {
  return seoMeta({
    title: 'Your visit, explained | Happyday Acupuncture, Abuja',
    description:
      'What happens at your first acupuncture visit in Jabi, Abuja: the assessment, the needles, safety, fees, payment and cancellation.',
    path: '/your-visit',
  });
}

const faqPage = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function YourVisit() {
  const wear = faqs.find((f) => f.id === 'wear');
  const payFaq = faqs.find((f) => f.id === 'pay');
  return (
    <main className="page page-visit">
      <JsonLd data={faqPage} />

      <section className="page-hero" aria-labelledby="visit-title">
        <p className="label">Your visit</p>
        <h1 id="visit-title" className="type-display-l">
          Your visit, <em>explained.</em>
        </h1>
        <p className="type-lead">
          Nervous about needles? Most people are, the first time. Here is exactly what happens, so there are no surprises.
        </p>
      </section>

      <section className="section" aria-labelledby="steps-title">
        <SectionHead code="PC6" pinyin="Nèiguān" id="steps-title" title="The four steps" />
        <VisitSteps />
      </section>

      <section className="section section-dark surface-dark" aria-labelledby="scale-title">
        <SectionHead
          code="HT7"
          pinyin="Shénmén"
          id="scale-title"
          dark
          title={
            <>
              Thinner than <em>you think.</em>
            </>
          }
        />
        <NeedleScale />
      </section>

      <section className="section" aria-labelledby="safety-title">
        <SectionHead code="LI20" pinyin="Yíngxiāng" id="safety-title" title="Hygiene and safety" />
        <div className="two-col">
          <p className="type-body">
            Sterile, single-use, disposable needles, opened for you and safely disposed of after use. Clean linen for every
            patient.
          </p>
          <Picture id="sterile-needle-pack" sizes="(min-width: 768px) 400px, 80vw" />
        </div>
      </section>

      <section className="section" aria-labelledby="before-title">
        <SectionHead code="GB34" pinyin="Yánglíngquán" id="before-title" title="Before you come" />
        <p className="type-body">{wear.a}</p>
      </section>

      <section className="section" aria-labelledby="fees-title">
        <SectionHead
          code="BL40"
          pinyin="Wěizhōng"
          id="fees-title"
          title="Fees"
          lead="Fees are confirmed when you book. We never show a price we have not confirmed."
        />
        <ul className="fee-list">
          {clinic.appointmentTypes.map((t) => {
            const price = formatNaira(t.priceNaira);
            return (
              <li key={t.slug} className="fee-row">
                <div>
                  <p className="type-display-s">{t.name}</p>
                  <p className="type-small">{t.summary}</p>
                  <p className="type-small label">About {t.durationMinutes} minutes</p>
                </div>
                <div className="fee-price">
                  {t.priceNaira === null ? (
                    <a href={WA_LINKS.general} className="link-underline">
                      Fee confirmed on booking, or ask on WhatsApp
                    </a>
                  ) : (
                    <span>{price}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section" aria-labelledby="payment-title">
        <SectionHead code="KI3" pinyin="Tàixī" id="payment-title" title="Payment" />
        <p className="type-body">
          You pay by bank transfer. Bank details are shown when you book, and your appointment is held while you transfer.
          {payFaq ? ` ${payFaq.a}` : ''}
        </p>
      </section>

      <section className="section" aria-labelledby="cancel-title">
        <SectionHead code="KI1" pinyin="Yǒngquán" id="cancel-title" title="Cancellation" />
        <p className="type-body">
          You can reschedule or cancel at least {clinic.scheduling.cancellationNoticeHours} hours before your appointment,
          using the link in your confirmation or on WhatsApp.
        </p>
      </section>

      <section className="section" aria-labelledby="questions-title">
        <SectionHead code="CV6" pinyin="Qìhǎi" id="questions-title" title="Questions" />
        <FaqList items={faqs} label="All questions about your visit" />
      </section>

      <section className="section section-tight" aria-labelledby="emergency-title">
        <h2 id="emergency-title" className="type-display-s">
          If it is an emergency
        </h2>
        <aside className="safety-callout">
          <p className="type-body">{STROKE_NOTE}</p>
        </aside>
      </section>

      <section className="section section-tight">
        <p className="type-small care-note">{CARE_NOTE}</p>
      </section>

      <section className="section">
        <CtaPanel title="Ready when you are." lead="Book a consultation, or ask us anything first on WhatsApp." />
      </section>
    </main>
  );
}
