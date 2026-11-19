import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { ToastProvider } from './components/ui/ToastProvider.jsx';
import './styles/app.css';

/**
 * Document shell. Prerendered HTML contains this shell plus the route content.
 * @param {{ children: import('react').ReactNode }} props
 */
export function Layout({ children }) {
  return (
    <html lang="en-GB" style={{ backgroundColor: "#F7F6F2", color: "#101614", colorScheme: "light" }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0F3B24" />
        <meta name="color-scheme" content="light" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <Meta />
        <Links />
      </head>
      <body style={{ backgroundColor: "#F7F6F2", margin: 0 }}>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

/** @returns {import('react').ReactElement} */
export default function Root() {
  return (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  );
}
