import { Link } from 'react-router';
import { bodyRegions, bodyMapCopy } from '../../content/index.js';
import { STROKE_NOTE } from '../../lib/site.js';

/**
 * The accessible equivalent of the body map (docs/02 §5.4). Every region is a button with
 * aria-pressed, and the chosen region's conditions and treatments are announced in a live region.
 * Both the figure and this list drive the same selection.
 * @param {{
 *   selected: string | null, onSelect: (id: string) => void, regions?: typeof bodyRegions
 * }} props
 */
export function RegionList({ selected, onSelect, regions = bodyRegions }) {
  const current = regions.find((r) => r.id === selected);
  return (
    <div className="region-list-wrap">
      <p className="label">{bodyMapCopy.prompt}</p>
      <ul className="region-list" role="list">
        {regions.map((region) => (
          <li key={region.id}>
            <button
              type="button"
              className="chip region-chip"
              aria-pressed={selected === region.id}
              onClick={() => onSelect(region.id)}
            >
              <span className="chip-point" aria-hidden="true" />
              {region.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="region-panel-live" aria-live="polite">
        {current ? (
          <div className="region-panel-body">
            <h3 className="type-display-s">{current.label}</h3>
            <ul className="region-conditions">
              {current.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            {current.id === "whole-body" ? <p className="type-small region-safety">{STROKE_NOTE}</p> : null}
            <p className="region-links">
              {current.treatments.map((slug) => (
                <Link key={slug} to={`/treatments/${slug}`} className="link-underline">
                  {slug.replaceAll('-', ' ')}
                </Link>
              ))}
            </p>
          </div>
        ) : (
          <p className="type-small region-prompt">{bodyMapCopy.subprompt}</p>
        )}
      </div>
    </div>
  );
}
