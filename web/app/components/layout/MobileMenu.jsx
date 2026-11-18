import { NavLink } from 'react-router';
import { Sheet } from '../ui/Sheet.jsx';
import { PHONE_DISPLAY, PHONE_TEL, WA_LINKS } from '../../lib/site.js';
import { NAV } from './Header.jsx';

/**
 * Full-screen menu on phones (docs/03 global header). Closes with Esc or the close button.
 * @param {{ open: boolean, onClose: () => void }} props
 */
export function MobileMenu({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="Menu">
      <nav aria-label="Mobile" id="mobile-menu" className="mobile-menu-nav">
        <ul className="mobile-menu-list">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className="type-display-m mobile-menu-link" onClick={onClose}>
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink to="/book" className="type-display-m mobile-menu-link" onClick={onClose}>
              Book a visit
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="mobile-menu-contact">
        <a href={PHONE_TEL}>Call {PHONE_DISPLAY}</a>
        <a href={WA_LINKS.general}>Chat on WhatsApp</a>
      </div>
    </Sheet>
  );
}
