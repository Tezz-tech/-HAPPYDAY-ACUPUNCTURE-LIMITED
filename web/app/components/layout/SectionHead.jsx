import { AcupointLabel } from '../ui/AcupointLabel.jsx';
import { Rule } from '../ui/Rule.jsx';

/**
 * A section opener: a hairline with its acupoint label on it, a point on the meridian, then the heading.
 * @param {{
 *   code: string, pinyin?: string, title: import('react').ReactNode, lead?: string,
 *   dark?: boolean, id?: string, className?: string, columns?: 'left' | 'right'
 * }} props
 */
export function SectionHead({ code, pinyin, title, lead, dark = false, id, className = '', columns = 'left' }) {
  return (
    <header className={`section-head section-head-${columns} ${className}`.trim()}>
      <Rule dark={dark} label={<AcupointLabel code={code} pinyin={pinyin} />} />
      <span className="section-point" aria-hidden="true" />
      <h2 id={id} className={`type-display-m ${dark ? 'on-dark' : ''}`.trim()}>
        {title}
      </h2>
      {lead ? <p className="type-lead section-lead">{lead}</p> : null}
    </header>
  );
}
