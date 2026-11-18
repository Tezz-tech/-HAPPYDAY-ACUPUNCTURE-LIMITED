import { Link } from 'react-router';
import { Icon } from './Icon.jsx';

/**
 * Primary, secondary, ghost and WhatsApp buttons (docs/02 §7). Renders a router Link when `to`
 * is given, an anchor when `href` is given, and a button otherwise.
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'ghost' | 'whatsapp',
 *   cta?: boolean, onDark?: boolean, icon?: 'whatsapp' | 'phone' | 'arrow',
 *   to?: string, href?: string, className?: string,
 *   children?: import('react').ReactNode
 * } & Record<string, unknown>} props
 */
export function Button({
  variant = 'primary',
  cta = false,
  onDark = false,
  icon,
  to,
  href,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    cta && 'btn-cta',
    onDark && 'btn-on-dark',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {icon ? <Icon name={icon} size={18} className="btn-icon" /> : null}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} viewTransition {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  );
}
