import { useState } from 'react';
import { clinic } from '../../content/index.js';
import { ADDRESS, HOURS_PLACEHOLDER, MAP_EMBED, MAP_LINK, PHONE_DISPLAY, PHONE_TEL, WA_LINKS } from '../../lib/site.js';
import { Button } from '../ui/Button.jsx';
import { Icon } from '../ui/Icon.jsx';
import { TextLink } from '../ui/TextLink.jsx';

/**
 * Address, hours, directions and a map that loads only on click (docs/02 §7). Nothing third-party
 * loads until the visitor asks for it.
 */
export function VisitCard() {
  const [mapLoaded, setMapLoaded] = useState(false);
  return (
    <div className="visit-card">
      <div className="visit-card-map">
        {mapLoaded ? (
          <iframe
            title="Map of Happyday Acupuncture, Jabi, Abuja"
            src={MAP_EMBED}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="visit-card-iframe"
          />
        ) : (
          <div className="visit-card-placeholder">
            <Icon name="pin" size={28} />
            <p>{ADDRESS}</p>
            <Button variant="secondary" onClick={() => setMapLoaded(true)}>
              Load interactive map
            </Button>
          </div>
        )}
      </div>
      <div className="visit-card-body">
        <p className="type-body visit-address">{ADDRESS}</p>
        {clinic.address.directionsHint.startsWith('TODO_CLIENT') ? null : (
          <p className="type-small">{clinic.address.directionsHint}</p>
        )}
        {HOURS_PLACEHOLDER ? <p className="type-small">Hours are confirmed on WhatsApp.</p> : null}
        <div className="visit-card-actions">
          <TextLink href={MAP_LINK}>Get directions</TextLink>
          <TextLink href={PHONE_TEL}>Call {PHONE_DISPLAY}</TextLink>
          <TextLink href={WA_LINKS.general}>WhatsApp us</TextLink>
        </div>
      </div>
    </div>
  );
}
