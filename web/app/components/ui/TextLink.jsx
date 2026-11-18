import { Link } from 'react-router';

/**
 * Inline or standalone text link with the underline that draws on hover (docs/02 §6).
 * @param {{ to?: string, href?: string, className?: string, children?: import('react').ReactNode } & Record<string, unknown>} props
 */
export function TextLink({ to, href, className = '', children, ...rest }) {
  const classes = `link-underline ${className}`.trim();
  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
