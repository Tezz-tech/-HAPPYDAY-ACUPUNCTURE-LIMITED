import { Outlet, useLocation } from 'react-router';
import { useLenis } from '../hooks/useLenis.js';
import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { MobileActionBar } from '../components/layout/MobileActionBar.jsx';

/** Shared chrome for every marketing page: header, page, footer and the phone action bar. */
export default function SiteLayout() {
  const { pathname } = useLocation();
  useLenis(!/^\/(admin|book)/.test(pathname));
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <div id="main" tabIndex={-1}>
        <Outlet />
      </div>
      <Footer />
      <MobileActionBar />
    </>
  );
}
