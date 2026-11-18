import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import './styles/app.css';

/**
 * Document shell. Prerendered HTML contains this shell plus the route content.
 * @param {{ children: import('react').ReactNode }} props
 */
export function Layout({ children }) {
  return (
    <html lang="en-GB">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B401D" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/** @returns {import('react').ReactElement} */
export default function Root() {
  return <Outlet />;
}
