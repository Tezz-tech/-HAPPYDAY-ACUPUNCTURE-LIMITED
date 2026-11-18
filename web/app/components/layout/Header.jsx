import { useState } from 'react';
import { NavLink } from 'react-router';
import { Logo } from '../brand/Logo.jsx';
import { Button } from '../ui/Button.jsx';
import { Icon } from '../ui/Icon.jsx';
import { MobileMenu } from './MobileMenu.jsx';
import { useScrollState } from '../../hooks/useScrollState.js';
import { WA_LINKS } from '../../lib/site.js';

export const NAV = [
  { to: '/treatments', label: 'Treatments' },
  { to: '/your-visit', label: 'Your visit' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

/**
 * Site header. Transparent over the hero, then paper at 92% with a blur and a hairline once the
 * page scrolls 40 px. It hides on a fast scroll down and returns on scroll up (docs/03 global header).
 */
export function Header() {
  const { scrolled, hidden } = useScrollState();
  const [menuOpen, setMenuOpen] = useState(false);

  const classes = ['site-header', scrolled ? 'is-scrolled' : '', hidden && !menuOpen ? 'is-hidden' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <header className={classes}>
      <div className="site-header-inner">
        <Logo variant="horizontal" />
        <nav aria-label="Main" className="site-nav">
          <ul className="site-nav-list">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className="site-nav-link link-underline" viewTransition>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header-actions">
          <a href={WA_LINKS.general} className="site-whatsapp" aria-label="Chat on WhatsApp">
            <Icon name="whatsapp" size={22} />
          </a>
          <Button to="/book" variant="primary" className="site-book">
            Book a visit
          </Button>
          <button
            type="button"
            className="site-menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <span>Menu</span>
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
