import { Button } from '../components/ui/Button.jsx';
import { SectionHead } from '../components/layout/SectionHead.jsx';
import { Hero } from '../components/features/Hero.jsx';
import { Gallery } from '../components/features/Gallery.jsx';
import { TreatmentIndex } from '../components/features/TreatmentIndex.jsx';
import { VisitSteps } from '../components/features/VisitSteps.jsx';
import { FaqList } from '../components/features/FaqList.jsx';
import { VisitCard } from '../components/features/VisitCard.jsx';
import { TextLink } from '../components/ui/TextLink.jsx';
import { JsonLd } from '../components/seo/JsonLd.jsx';
import { clinic, homeFaqs, treatments } from '../content/index.js';
import { seoMeta } from '../lib/seo.js';
import { PHONE_DISPLAY, PHONE_TEL, SITE_URL, WA_LINKS } from '../lib/site.js';

export function meta() {
  return seoMeta({
    title: 'Acupuncture in Jabi, Abuja | Happyday Acupuncture',
    description:
      'Personalised acupuncture and Traditional Chinese Medicine in Jabi, Abuja. Every plan starts with a proper TCM assessment. Book online or on WhatsApp.',
    path: '/',
  });
}

/** Structured data for the clinic (docs/05 SEO). Opening hours are left out while they are placeholders. */
const medicalClinic = {
  '@context': 'https://schema.org',
  '@type': ['MedicalClinic', 'LocalBusiness'],
  name: clinic.brandName,
  legalName: clinic.legalName,
  url: SITE_URL,
  telephone: clinic.contact.phoneE164,
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${clinic.address.building}, ${clinic.address.street}`,
    addressLocality: clinic.address.area,
    addressRegion: clinic.address.state,
    postalCode: clinic.address.postalCode,
    addressCountry: clinic.address.country,
  },
  foundingDate: String(clinic.foundedYear),
  medicalSpecialty: 'Acupuncture',
  founder: { '@type': 'Person', name: clinic.founder.name, jobTitle: clinic.founder.role },
  availableService: treatments.map((t) => ({ '@type': 'MedicalTherapy', name: t.name })),
};

export default function Home() {
  return (
    <main className="page page-home">
      <JsonLd data={medicalClinic} />

      <Hero />

      <section className="section" aria-labelledby="gallery-title">
        <SectionHead id="gallery-title" title="Inside the clinic" />
        <Gallery />
      </section>

      <section className="section" aria-labelledby="areas-title">
        <SectionHead
          id="areas-title"
          title="What we help with"
          lead="Ten areas of care, from long-standing back pain to fertility support. Each one starts with listening."
        />
        <TreatmentIndex />
        <p className="section-more">
          <TextLink to="/treatments">See all treatment areas</TextLink>
        </p>
      </section>

      <section className="section" aria-labelledby="visit-title">
        <SectionHead id="visit-title" title="Your first visit, step by step" />
        <VisitSteps />
        <p className="section-more">
          <TextLink to="/your-visit">Everything about your visit</TextLink>
        </p>
      </section>

      <section className="section section-dark" aria-labelledby="scale-title">
        <SectionHead
          id="scale-title"
          dark
          title="Thinner than you think."
          lead="An acupuncture needle is solid and about as fine as a few hairs together. An injection needle is hollow and roughly three times wider. Most people feel a light tap, then very little."
        />
      </section>

      <section className="section" aria-labelledby="practitioner-title">
        <div className="practitioner-text" data-reveal>
          <p className="label">{clinic.founder.role} · Dip. Acupuncture &amp; Moxibustion</p>
          <h2 id="practitioner-title" className="type-display-m">
            Meet {clinic.founder.name}
          </h2>
          <p className="type-lead">
            Happyday Acupuncture opened in 2024 with a simple belief: good health deserves time, attention and a personal
            approach. Every treatment here begins with listening, and every plan is built around the person on the bed, not
            a template.
          </p>
          <ul className="fact-list">
            <li>Dip. Acupuncture &amp; Moxibustion</li>
            <li>Clinic opened in {clinic.foundedYear}</li>
            <li>{clinic.address.area}, {clinic.address.state}</li>
          </ul>
          <div>
            <TextLink to="/about">About the clinic</TextLink>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <SectionHead id="faq-title" title="Good questions" />
        <FaqList items={homeFaqs} label="Common questions" />
        <p className="section-more">
          <TextLink to="/your-visit">All questions</TextLink>
        </p>
      </section>

      <section className="section" aria-labelledby="visit-band-title">
        <SectionHead id="visit-band-title" title="Find us in Jabi." />
        <VisitCard />
        <div className="section-actions">
          <Button to="/book" variant="primary" cta>
            Book a visit
          </Button>
          <Button href={WA_LINKS.general} variant="whatsapp" icon="whatsapp">
            WhatsApp us
          </Button>
          <a href={PHONE_TEL} className="link-underline">
            Call {PHONE_DISPLAY}
          </a>
        </div>
      </section>
    </main>
  );
}
