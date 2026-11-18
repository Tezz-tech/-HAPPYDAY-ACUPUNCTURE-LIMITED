import { Button } from '../ui/Button.jsx';
import { WA_LINKS, PHONE_TEL, PHONE_DISPLAY } from '../../lib/site.js';

/**
 * Closing call-to-action on a forest-900 panel (docs/03 treatment page §9 and the home §10 band).
 * @param {{ title: string, lead?: string, bookTo?: string, waHref?: string, bookLabel?: string }} props
 */
export function CtaPanel({ title, lead, bookTo = '/book', waHref = WA_LINKS.general, bookLabel = 'Book a visit' }) {
  return (
    <section className="cta-panel surface-dark" aria-labelledby="cta-title">
      <h2 id="cta-title" className="type-display-m on-dark">
        {title}
      </h2>
      {lead ? <p className="type-lead on-dark-soft">{lead}</p> : null}
      <div className="cta-panel-actions">
        <Button to={bookTo} variant="primary" onDark cta>
          {bookLabel}
        </Button>
        <Button href={waHref} variant="whatsapp" icon="whatsapp" onDark>
          Ask privately on WhatsApp
        </Button>
        <a href={PHONE_TEL} className="cta-phone link-underline">
          Call {PHONE_DISPLAY}
        </a>
      </div>
    </section>
  );
}
