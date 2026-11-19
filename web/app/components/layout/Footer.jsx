import { Link } from 'react-router';
import { Logo } from '../brand/Logo.jsx';
import { clinic } from '../../content/index.js';
import { ADDRESS, DISCLAIMER, PHONE_DISPLAY, PHONE_TEL, WA_LINKS } from '../../lib/site.js';
import { NAV } from './Header.jsx';

/** The site footer: the clinic, where to find it, how to reach it, and the legal line. */
export function Footer() {
  const year = new Date().getFullYear();
  const cacConfirmed = !clinic.cacRcNumber.startsWith('TODO_CLIENT');
  return (
    <footer className="site-footer surface-dark">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Logo variant="horizontal" tone="dark" link={false} />
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
            <a href={PHONE_TEL}>{PHONE_DISPLAY}</a>
          </p>
          <p>
            <a href={WA_LINKS.general}>WhatsApp</a>
          </p>
        </div>
        <nav aria-label="Footer" className="footer-col">
          <p className="label footer-label">Explore</p>
          <ul className="footer-links">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="site-footer-legal">
        <p>
          {clinic.legalName}
          {cacConfirmed ? ` · RC ${clinic.cacRcNumber}` : ''}
        </p>
        <p className="footer-small">
          <Link to="/privacy">Privacy</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/terms">Terms</Link>
          <span aria-hidden="true"> · </span>© {year}
        </p>
      </div>
    </footer>
  );
}
