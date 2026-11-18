import { Button } from '../components/ui/Button.jsx';
import { SectionHead } from '../components/layout/SectionHead.jsx';
import { Logo } from '../components/brand/Logo.jsx';
import { PortraitSlot } from '../components/brand/PortraitSlot.jsx';
import { Rule } from '../components/ui/Rule.jsx';
import { clinic } from '../content/index.js';
import { seoMeta } from '../lib/seo.js';
import { WA_LINKS } from '../lib/site.js';

export function meta() {
  return seoMeta({
    title: 'About Happyday Acupuncture | Jabi, Abuja',
    description:
      'Happyday Acupuncture is an acupuncture and Traditional Chinese Medicine clinic in Jabi, Abuja. Opened in 2024 to make these therapies accessible, professional and personal.',
    path: '/about',
  });
}

export default function About() {
  return (
    <main className="page page-about">
      <section className="page-hero" aria-labelledby="about-title">
        <p className="label">About the clinic</p>
        <h1 id="about-title" className="type-display-l">
          Care that starts with <em>listening.</em>
        </h1>
        <p className="type-lead">
          Happyday Acupuncture is an acupuncture and Traditional Chinese Medicine clinic in Jabi, Abuja. We opened in 2024
          to make these traditional therapies accessible, professional and personal.
        </p>
      </section>

      <section className="section" aria-labelledby="story-title">
        <SectionHead code="LI4" pinyin="Hégǔ" id="story-title" title="Our story" />
        <div className="two-col">
          <p className="type-body">
            We were founded on a simple belief: everyone deserves attention, care and support on the way to better health.
            That means taking time to understand each person, assessing them properly, and recommending only what suits them.
          </p>
          <p className="type-body">
            Since 2024 we have built the clinic around traditional therapeutic practice, careful patient care, and
            relationships with the people and communities we serve.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="founder-title">
        <SectionHead code="KI3" pinyin="Tàixī" id="founder-title" title="The founder" />
        <div className="practitioner-grid">
          <PortraitSlot />
          <div className="practitioner-copy">
            <p className="type-display-s">{clinic.founder.name}</p>
            <p className="label">{clinic.founder.role}</p>
            <p className="type-body">{clinic.founder.qualification}.</p>
            {/* Bio is a placeholder until the client supplies it (TODO_CLIENT in content/clinic.json). */}
            <p className="type-body placeholder-copy">
              Happyday Acupuncture opened in 2024 with a simple belief: good health deserves time, attention and a personal
              approach. Every treatment here begins with listening.
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="vision-title">
        <SectionHead code="ST36" pinyin="Zúsānlǐ" id="vision-title" title="Vision" />
        <blockquote className="pull-quote type-display-m">{clinic.company.vision}</blockquote>
      </section>

      <section className="section" aria-labelledby="mission-title">
        <SectionHead
          code="PC6"
          pinyin="Nèiguān"
          id="mission-title"
          title="Mission"
          lead="Our mission is accessible, professional, patient-centred care."
        />
        <ul className="hairline-list">
          {clinic.company.missionPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="values-title">
        <SectionHead code="HT7" pinyin="Shénmén" id="values-title" title="Values" />
        <dl className="values-table">
          {clinic.company.values.map((v) => (
            <div key={v.name} className="values-row">
              <dt className="type-display-s">{v.name}</dt>
              <dd className="type-body">{v.line}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section" aria-labelledby="commitment-title">
        <SectionHead code="KI1" pinyin="Yǒngquán" id="commitment-title" title="Our commitment" />
        <p className="type-lead">
          We are grateful for the trust our patients place in us. We will keep earning it with honest advice, professional
          care and respect for every person who walks through the door.
        </p>
        <Rule />
        <div className="seal-of-house">
          <Logo variant="stacked" link={false} />
          <p className="label">Health · Balance · Wellness</p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="section-actions">
          <Button to="/book" variant="primary" cta>
            Book a consultation
          </Button>
          <Button href={WA_LINKS.general} variant="whatsapp" icon="whatsapp">
            Chat on WhatsApp
          </Button>
        </div>
      </section>
    </main>
  );
}
