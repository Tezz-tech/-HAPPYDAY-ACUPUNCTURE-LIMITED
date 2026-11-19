import { Link } from 'react-router';
import { treatments as allTreatments } from '../../content/index.js';
import { Icon } from '../ui/Icon.jsx';

/**
 * The list of treatment areas: name, one line of what it covers, and an arrow.
 * @param {{ items?: Array<{ slug: string, name: string, short: string }> }} props
 */
export function TreatmentIndex({ items = allTreatments }) {
  return (
    <ul className="treatment-list">
      {items.map((t) => (
        <li key={t.slug} className="treatment-row" data-reveal>
          <Link to={`/treatments/${t.slug}`} className="treatment-link">
            <span className="treatment-name">{t.name}</span>
            <span className="treatment-arrow" aria-hidden="true">
              <Icon name="arrow" size={22} />
            </span>
            <span className="treatment-short">{t.short}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
