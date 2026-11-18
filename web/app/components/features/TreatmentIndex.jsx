import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { AcupointLabel } from '../ui/AcupointLabel.jsx';
import { Icon } from '../ui/Icon.jsx';
import { treatments } from '../../content/index.js';
import { PHOTOS } from '../../content/photos.generated.js';
import { attachCursorPreview } from './TreatmentIndex.motion.js';

/** The duotone version of a treatment's photo, falling back to the colour one. */
function previewPhoto(id) {
  const duo = PHOTOS[`${id}-duotone`];
  return duo ?? PHOTOS[id];
}

/**
 * Typographic index of the treatment areas (docs/02 §6). Each row is a hairline-separated link with the
 * acupoint label on the left. On fine pointers a duotone photo follows the cursor. On touch, rows link straight through.
 * @param {{ items?: Array<any> }} props
 */
export function TreatmentIndex({ items = treatments }) {
  const listRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (!listRef.current || !previewRef.current) return undefined;
    return attachCursorPreview(listRef.current, previewRef.current);
  }, []);

  return (
    <div className="treatment-index-wrap">
      <ul className="treatment-index" ref={listRef}>
        {items.map((t) => (
          <li key={t.slug} className="treatment-row" data-preview={t.photo}>
            <Link to={`/treatments/${t.slug}`} className="treatment-link" viewTransition>
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
      <div className="treatment-preview" ref={previewRef} aria-hidden="true">
        {items.map((t) => {
          const photo = previewPhoto(t.photo);
          return photo ? (
            <img
              key={t.slug}
              src={`/photos/${photo.files.jpg}`}
              width={220}
              height={Math.round((220 * photo.height) / photo.width)}
              alt=""
              data-for={t.photo}
              loading="lazy"
              decoding="async"
            />
          ) : null;
        })}
      </div>
    </div>
  );
}
