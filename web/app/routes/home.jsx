import { Button } from '../components/ui/Button.jsx';
import { SectionHead } from '../components/layout/SectionHead.jsx';
import { Meridian } from '../components/layout/Meridian.jsx';
import { BodyMapSection } from '../components/features/BodyMapSection.jsx';
import { TreatmentIndex } from '../components/features/TreatmentIndex.jsx';
import { VisitSteps } from '../components/features/VisitSteps.jsx';
import { NeedleScale } from '../components/features/NeedleScale.jsx';
import { FaqList } from '../components/features/FaqList.jsx';
import { VisitCard } from '../components/features/VisitCard.jsx';
import { PhotoStrip } from '../components/features/PhotoStrip.jsx';
import { PortraitSlot } from '../components/brand/PortraitSlot.jsx';
import { Picture } from '../components/ui/Picture.jsx';
import { TextLink } from '../components/ui/TextLink.jsx';
import { JsonLd } from '../components/seo/JsonLd.jsx';
import { clinic, homeFaqs, treatments } from '../content/index.js';
import { seoMeta } from '../lib/seo.js';
import { ADDRESS, PHONE_DISPLAY, PHONE_TEL, SITE_URL, WA_LINKS } from '../lib/site.js';

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

      {/* §1 Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <Meridian />
        <div className="hero-copy">
          <p className="label hero-label">Acupuncture &amp; Traditional Chinese Medicine · Jabi, Abuja</p>
          <h1 id="hero-title" className="type-display-xl hero-title">
            Heal naturally.
            <br />
            Live <em>better.</em>
          </h1>
          <p className="type-lead hero-lead">
            Personalised acupuncture for pain, nerve problems, fertility, sleep and more. Every plan starts with a proper
            Traditional Chinese Medicine assessment of you, not just your symptoms.
          </p>
          <div className="hero-actions">
            <Button to="/book" variant="primary" cta>
              Book a consultation
            </Button>
            <Button href={WA_LINKS.general} variant="whatsapp" icon="whatsapp">
              Chat on WhatsApp
            </Button>
          </div>
          <ul className="hero-facts">
            <li>Diploma in Acupuncture &amp; Moxibustion</li>
            <li>Sterile, single-use needles</li>
            <li>Bank transfer or WhatsApp booking</li>
          </ul>
        </div>
        <div className="hero-field" aria-hidden="true" />
      </section>

      {/* §2 Where does it hurt? */}
      <section className="section" aria-labelledby="body-map-title">
        <SectionHead
          code="LI4"
          pinyin="Hégǔ"
          id="body-map-title"
          title={
            <>
              Start with what&rsquo;s <em>bothering</em> you.
            </>
          }
        />
        <BodyMapSection />
      </section>

      {/* §3 Treatment areas */}
      <section className="section" aria-labelledby="areas-title">
        <SectionHead
          code="ST36"
          pinyin="Zúsānlǐ"
          id="areas-title"
          title="What we help with"
          lead="Ten areas of care, from long-standing back pain to fertility support. Each one starts with listening."
          columns="right"
        />
        <TreatmentIndex />
        <p className="section-more">
          <TextLink to="/treatments">See all treatment areas →</TextLink>
        </p>
      </section>

      {/* §4 First visit */}
      <section className="section" aria-labelledby="visit-title">
        <SectionHead code="PC6" pinyin="Nèiguān" id="visit-title" title="Your first visit, step by step" />
        <VisitSteps />
        <p className="section-more">
          <TextLink to="/your-visit">Everything about your visit →</TextLink>
        </p>
      </section>

      {/* §5 Needle scale */}
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
          lead="An acupuncture needle is solid and about as fine as a few hairs together. An injection needle is hollow and roughly three times wider. Most people feel a light tap, then very little."
        />
        <NeedleScale />
      </section>

      {/* §6 Practitioner */}
      <section className="section practitioner" aria-labelledby="practitioner-title">
        <SectionHead code="KI3" pinyin="Tàixī" id="practitioner-title" title={`Meet ${clinic.founder.name}`} />
        <div className="practitioner-grid">
          <PortraitSlot />
          <div className="practitioner-copy">
            <p className="label">{clinic.founder.role} · Dip. Acupuncture &amp; Moxibustion</p>
            <p className="type-body">
              Happyday Acupuncture opened in 2024 with a simple belief: good health deserves time, attention and a personal
              approach. Every treatment here begins with listening, and every plan is built around the person on the bed,
              not a template.
            </p>
            <Picture id="abdomen-ring-duotone" sizes="(min-width: 768px) 260px, 60vw" alt="" className="practitioner-pic" />
            <TextLink to="/about">About the clinic →</TextLink>
          </div>
        </div>
      </section>

      {/* §7 Inside the clinic */}
      <section className="section section-tight" aria-labelledby="inside-title">
        <h2 id="inside-title" className="type-display-s">
          Inside the clinic
        </h2>
        <PhotoStrip />
      </section>

      {/* §9 Questions */}
      <section className="section" aria-labelledby="faq-title">
        <SectionHead code="CV6" pinyin="Qìhǎi" id="faq-title" title="Good questions" />
        <FaqList items={homeFaqs} label="Common questions" />
        <p className="section-more">
          <TextLink to="/your-visit">All questions →</TextLink>
        </p>
      </section>

      {/* §10 Visit and book */}
      <section className="section" aria-labelledby="visit-band-title">
        <SectionHead
          code="KI1"
          pinyin="Yǒngquán"
          id="visit-band-title"
          title={
            <>
              Come and see us in <em>Jabi.</em>
            </>
          }
        />
        <p className="type-lead">{ADDRESS}</p>
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
