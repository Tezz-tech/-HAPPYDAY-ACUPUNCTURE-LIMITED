import { Link } from 'react-router';
import { AcupointLabel } from '../ui/AcupointLabel.jsx';
import { Icon } from '../ui/Icon.jsx';
import { treatments } from '../../content/index.js';

/**
 * Typographic index of the treatment areas (docs/02 §6). Each row is a hairline-separated link with
 * the acupoint label on the left. Phase 3 adds a cursor-following photo preview for fine pointers.
 * @param {{ items?: Array<any> }} props
 */
export function TreatmentIndex({ items = treatments }) {
  return (
    <ul className="treatment-index">
      {items.map((t) => (
        <li key={t.slug} className="treatment-row" data-photo={t.photo}>
          <Link to={`/treatments/${t.slug}`} className="treatment-link">
            <AcupointLabel code={t.acupoint.code} pinyin={t.acupoint.pinyin} className="treatment-code" />
            <span className="treatment-name type-display-s">{t.name}</span>
            <span className="treatment-short">{t.short}</span>
            <span className="treatment-arrow" aria-hidden="true">
              <Icon name="arrow" size={20} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
