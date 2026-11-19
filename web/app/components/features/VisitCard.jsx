import { clinic } from '../../content/index.js';
import { ADDRESS, HOURS_PLACEHOLDER, MAP_EMBED, MAP_LINK, PHONE_DISPLAY, PHONE_TEL, WA_LINKS } from '../../lib/site.js';
import { TextLink } from '../ui/TextLink.jsx';

/**
 * The address, directions and the map. The map is embedded directly and loads with the page, so there is
 * nothing to click before you can see where the clinic is.
 */
export function VisitCard() {
  return (
    <div className="visit-card">
      <div className="visit-card-map">
        <iframe
          title="Map showing Happyday Acupuncture, Jabi, Abuja"
          src={MAP_EMBED}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="visit-card-iframe"
        />
      </div>
      <div className="visit-card-body">
        <p className="visit-address">{ADDRESS}</p>
        {clinic.address.directionsHint.startsWith('TODO_CLIENT') ? null : (
          <p className="type-small">{clinic.address.directionsHint}</p>
        )}
        {HOURS_PLACEHOLDER ? <p className="type-small">Hours are confirmed on WhatsApp.</p> : null}
        <div className="visit-card-actions">
          <TextLink href={MAP_LINK}>Open in Google Maps</TextLink>
          <TextLink href={PHONE_TEL}>Call {PHONE_DISPLAY}</TextLink>
          <TextLink href={WA_LINKS.general}>WhatsApp us</TextLink>
        </div>
      </div>
    </div>
  );
}
