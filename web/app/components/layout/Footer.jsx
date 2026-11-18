import { Link } from 'react-router';
import { Logo } from '../brand/Logo.jsx';
import { Seal } from '../brand/Seal.jsx';
import { clinic } from '../../content/index.js';
import { ADDRESS, DISCLAIMER, PHONE_DISPLAY, PHONE_TEL, WA_LINKS } from '../../lib/site.js';
import { NAV } from './Header.jsx';

/**
 * Site footer on forest-900 (docs/03 global footer). The RC number and social links only appear once confirmed.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const cacConfirmed = !clinic.cacRcNumber.startsWith('TODO_CLIENT');
  return (
    <footer className="site-footer surface-dark">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Logo variant="stacked" link={false} />
          <p className="footer-disclaimer">{DISCLAIMER}</p>
        </div>
        <div className="footer-col">
          <p className="label footer-label">Visit</p>
          <p className="footer-address">{ADDRESS}</p>
          <p className="footer-hours">Hours are confirmed on WhatsApp.</p>
        </div>
        <div className="footer-col">
          <p className="label footer-label">Contact</p>
          <p>
            <a href={PHONE_TEL} className="link-underline">
              {PHONE_DISPLAY}
            </a>
          </p>
          <p>
            <a href={WA_LINKS.general} className="link-underline">
              WhatsApp
            </a>
          </p>
        </div>
        <nav aria-label="Footer" className="footer-col">
          <p className="label footer-label">Explore</p>
          <ul className="footer-links">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="link-underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="site-footer-legal">
        <div className="legal-seal">
          <Seal size={44} />
          <p>
            {clinic.legalName}
            {cacConfirmed ? ` · RC ${clinic.cacRcNumber}` : ''}
          </p>
        </div>
        <p className="footer-small">
          <Link to="/privacy" className="link-underline">
            Privacy
          </Link>
          <span aria-hidden="true"> · </span>
          <Link to="/terms" className="link-underline">
            Terms
          </Link>
          <span aria-hidden="true"> · </span>© {year}
        </p>
      </div>
    </footer>
  );
}
