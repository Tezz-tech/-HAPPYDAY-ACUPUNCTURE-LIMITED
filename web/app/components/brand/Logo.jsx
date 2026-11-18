import { Link } from 'react-router';
import { Mark } from './Mark.jsx';

/**
 * Brand logo (docs/02 §3).
 * - horizontal: the simplified mark with a Gambetta wordmark and "ACUPUNCTURE" below. Used in the header.
 * - stacked: the traced circular logo, at most 200 px wide. Used in the footer and about page.
 * @param {{ variant?: 'horizontal' | 'stacked', tone?: 'light' | 'dark', link?: boolean, className?: string }} props
 */
export function Logo({ variant = 'horizontal', tone = 'light', link = true, className = '' }) {
  if (variant === 'stacked') {
    const img = (
      <img
        src="/brand/logo-full-traced.svg"
        width={200}
        height={200}
        alt="Happyday Acupuncture"
        decoding="async"
        className={`logo-stacked ${className}`.trim()}
      />
    );
    return link ? (
      <Link to="/" className="logo-link" aria-label="Happyday Acupuncture, home">
        {img}
      </Link>
    ) : (
      img
    );
  }

  const content = (
    <>
      <Mark tone={tone} size={36} />
      <span className="logo-words">
        <span className="logo-name">Happyday</span>
        <span className="logo-sub">Acupuncture</span>
      </span>
    </>
  );
  const classes = `logo logo-horizontal logo-${tone} ${className}`.trim();
  return link ? (
    <Link to="/" className={classes} aria-label="Happyday Acupuncture, home">
      {content}
    </Link>
  ) : (
    <span className={classes}>{content}</span>
  );
}
