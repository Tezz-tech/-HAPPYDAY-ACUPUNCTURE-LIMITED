import { Button } from '../ui/Button.jsx';
import { Picture } from '../ui/Picture.jsx';
import { WA_LINKS } from '../../lib/site.js';

/**
 * The home hero: the headline and the two ways to book, with one real photograph of the treatment room.
 * The H1 is the LCP element, so it is plain HTML with no animation in front of it.
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
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
      <div className="hero-media">
        <Picture id="clinic-treatment-room" sizes="(min-width: 900px) 46vw, 92vw" reveal={false} priority />
      </div>
    </section>
  );
}
