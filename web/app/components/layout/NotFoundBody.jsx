import { Link } from 'react-router';
import { Seal } from '../brand/Seal.jsx';

/** 404 content with the seal (docs/02 §5.6, docs/03 404). Also used for unknown treatment slugs. */
export function NotFoundBody() {
  return (
    <main className="page page-404">
      <section className="not-found">
        <Seal size={96} />
        <h1 className="type-display-l">This page has wandered off the meridian.</h1>
        <p className="type-lead">Let&rsquo;s get you back.</p>
        <nav aria-label="Suggested pages" className="not-found-links">
          <Link to="/" className="link-underline">
            Home
          </Link>
          <Link to="/treatments" className="link-underline">
            Treatments
          </Link>
          <Link to="/book" className="link-underline">
            Book
          </Link>
        </nav>
      </section>
    </main>
  );
}
