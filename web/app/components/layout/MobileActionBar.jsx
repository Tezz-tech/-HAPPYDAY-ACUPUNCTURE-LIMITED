import { Button } from '../ui/Button.jsx';
import { Icon } from '../ui/Icon.jsx';
import { PHONE_TEL, WA_LINKS } from '../../lib/site.js';
import { useScrollState } from '../../hooks/useScrollState.js';

/**
 * Phone-only action bar. It appears once the hero has left the viewport and slides up on respect
 * for the safe area (docs/02 §6).
 */
export function MobileActionBar() {
  const { pastHero } = useScrollState();
  return (
    <div
      className={`mobile-action-bar ${pastHero ? 'is-visible' : ''}`.trim()}
      aria-hidden={pastHero ? undefined : 'true'}
    >
      <Button to="/book" variant="primary" cta className="mobile-action-book">
        Book a visit
      </Button>
      <a href={WA_LINKS.general} className="action-icon" aria-label="Chat on WhatsApp">
        <Icon name="whatsapp" size={22} />
      </a>
      <a href={PHONE_TEL} className="action-icon" aria-label="Call the clinic">
        <Icon name="phone" size={22} />
      </a>
    </div>
  );
}
