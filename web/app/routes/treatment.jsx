import { Link } from 'react-router';
import { Picture } from '../components/ui/Picture.jsx';
import { AcupointLabel } from '../components/ui/AcupointLabel.jsx';
import { FaqList } from '../components/features/FaqList.jsx';
import { VisitSteps } from '../components/features/VisitSteps.jsx';
import { TreatmentIndex } from '../components/features/TreatmentIndex.jsx';
import { CtaPanel } from '../components/features/CtaPanel.jsx';
import { JsonLd } from '../components/seo/JsonLd.jsx';
import { faqs, getTreatment, nextTreatments } from '../content/index.js';
import { PHOTOS } from '../content/photos.generated.js';
import { seoMeta } from '../lib/seo.js';
import { CARE_NOTE, SITE_URL } from '../lib/site.js';
import { aboutTreatment } from '@happyday/shared/whatsapp';
import { NotFoundBody } from '../components/layout/NotFoundBody.jsx';

const GENERAL_FAQ_IDS = ['hurt', 'how-many', 'medical'];

export function meta({ params }) {
  const t = getTreatment(params.slug);
  if (!t) return seoMeta({ title: 'Not found | Happyday Acupuncture', description: 'Page not found.', path: '/404' });
  return seoMeta({
    title: `${t.seo.title} | Happyday Acupuncture`,
    description: t.seo.description,
    path: `/treatments/${t.slug}`,
    image: `/photos/${PHOTOS[t.photo].files.jpg}`,
  });
}

export default function Treatment({ params }) {
  const t = getTreatment(params.slug);
  if (!t) return <NotFoundBody />;

  const generalFaqs = faqs.filter((f) => GENERAL_FAQ_IDS.includes(f.id));
  const others = nextTreatments(t.slug, 3);
  const lower = t.name.charAt(0).toLowerCase() + t.name.slice(1);
  const photo = t.photo;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: t.seo.title,
    description: t.seo.description,
    url: `${SITE_URL}/treatments/${t.slug}`,
    about: { '@type': 'MedicalTherapy', name: t.name },
  };
  const crumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Treatments', item: `${SITE_URL}/treatments` },
      { '@type': 'ListItem', position: 2, name: t.name, item: `${SITE_URL}/treatments/${t.slug}` },
    ],
  };

  return (
    <main className="page page-treatment">
      <JsonLd data={jsonLd} />
      <JsonLd data={crumbs} />

      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/treatments" className="link-underline">
          Treatments
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{t.name}</span>
      </nav>

      <section className="page-hero" aria-labelledby="treatment-title">
        <AcupointLabel code={t.acupoint.code} pinyin={t.acupoint.pinyin} />
        <h1 id="treatment-title" className="type-display-l">
          {t.name}
        </h1>
        <p className="type-lead">{t.intro}</p>
      </section>

      <section className="section section-tight" aria-label="Photo">
        <Picture id={photo} sizes="(min-width: 768px) 520px, 90vw" alt={undefined} priority />
      </section>

      <section className="section" aria-labelledby="help-title">
        <h2 id="help-title" className="type-display-s">
          What we can help with
        </h2>
        <ul className="conditions-list">
          {t.conditions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="expect-title">
        <h2 id="expect-title" className="type-display-s">
          What to expect
        </h2>
        <p className="type-body">{t.whatToExpect}</p>
        <VisitSteps compact />
      </section>

      {t.safetyNote ? (
        <section className="section section-tight" aria-label="Safety">
          <aside className="safety-callout">
            <p className="type-body">{t.safetyNote}</p>
          </aside>
        </section>
      ) : null}

      <section className="section" aria-labelledby="faq-title">
        <h2 id="faq-title" className="type-display-s">
          Common questions
        </h2>
        <FaqList items={generalFaqs} label={`Common questions about ${lower}`} headingLevel={3} />
      </section>

      <section className="section section-tight">
        <p className="type-small care-note">{CARE_NOTE}</p>
      </section>

      <section className="section">
        <CtaPanel
          title={`Book about ${lower}`}
          lead="Start with a consultation. We will tell you honestly whether acupuncture is right for you."
          bookTo={`/book?concern=${t.slug}`}
          waHref={aboutTreatment(t.name)}
          bookLabel={`Book about ${lower}`}
        />
      </section>

      <section className="section" aria-labelledby="others-title">
        <h2 id="others-title" className="type-display-s">
          Other treatment areas
        </h2>
        <TreatmentIndex items={others} />
      </section>
    </main>
  );
}
