import { useEffect, useRef } from 'react';
import { Button } from '../ui/Button.jsx';
import { NeedleField } from './NeedleField.jsx';
import { useGsap } from '../../hooks/useGsap.js';
import { heroIntro } from './Hero.motion.js';
import { useMagnetic } from '../../hooks/useMagnetic.js';
import { WA_LINKS } from '../../lib/site.js';

/**
 * The home hero (docs/03 §1, docs/02 §6). The H1 is the LCP element, so it is in the HTML from the start,
 * and the intro choreography only adds motion on top of it.
 */
export function Hero() {
  const ref = useRef(null);
  const ctaRef = useRef(null);
  const g = useGsap();

  useEffect(() => {
    if (!g || !ref.current) return undefined;
    return heroIntro(g, ref.current);
  }, [g]);
  useMagnetic(ctaRef);

  return (
    <section className="hero" aria-labelledby="hero-title" ref={ref}>
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
          <span ref={ctaRef} className="magnetic">
            <Button to="/book" variant="primary" cta>
              Book a consultation
            </Button>
          </span>
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
      <div className="hero-field">
        <NeedleField />
      </div>
    </section>
  );
}
