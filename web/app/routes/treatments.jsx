import { Button } from '../components/ui/Button.jsx';
import { SectionHead } from '../components/layout/SectionHead.jsx';
import { SplitFeature } from '../components/features/SplitFeature.jsx';
import { TreatmentIndex } from '../components/features/TreatmentIndex.jsx';
import { bodyMapCopy } from '../content/index.js';
import { seoMeta } from '../lib/seo.js';

export function meta() {
  return seoMeta({
    title: 'Treatment areas | Acupuncture in Abuja | Happyday Acupuncture',
    description:
      'Acupuncture and Traditional Chinese Medicine for pain, nerves, fertility, digestion, sleep and more, in Jabi, Abuja. Not sure where you fit? Start with an assessment.',
    path: '/treatments',
  });
}

export default function Treatments() {
  return (
    <main className="page page-inner page-treatments">
      <section className="page-hero" aria-labelledby="treatments-title">
        <SplitFeature photo="treatment-topdown-head" sizes="(min-width: 900px) 40vw, 92vw">
          <p className="label">Acupuncture &amp; TCM · Jabi, Abuja</p>
          <h1 id="treatments-title" className="type-display-l">
            Treatment <em>areas.</em>
          </h1>
          <p className="type-lead">
            Acupuncture and Traditional Chinese Medicine for the body and mind. Not sure where your problem fits? Start with
            a consultation and we will tell you honestly what we think.
          </p>
        </SplitFeature>
      </section>

      <section className="section" aria-labelledby="all-areas-title">
        <SectionHead id="all-areas-title" title="All treatment areas" />
        <TreatmentIndex />
      </section>

      <section className="section section-tight">
        <div className="not-sure-card" data-reveal>
          <h2 className="type-display-s">Not sure?</h2>
          <p className="type-body">
            A consultation is the best place to start. We listen, assess, and tell you honestly whether acupuncture is right
            for you.
          </p>
          <div className="section-actions">
            <Button to="/treatments/tcm-consultation" variant="primary">
              {bodyMapCopy.notSure.label}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
