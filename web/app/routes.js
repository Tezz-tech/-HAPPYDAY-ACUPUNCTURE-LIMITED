import { index, route } from '@react-router/dev/routes';

/** Route table. Marketing routes are prerendered; booking and admin are SPA-only. */
export default [
  index('routes/home.jsx'),
  route('about', 'routes/about.jsx'),
  route('treatments', 'routes/treatments.jsx'),
  route('treatments/:slug', 'routes/treatment.jsx'),
  route('your-visit', 'routes/your-visit.jsx'),
  route('contact', 'routes/contact.jsx'),
  route('privacy', 'routes/privacy.jsx'),
  route('terms', 'routes/terms.jsx'),
  route('404', 'routes/not-found.jsx'),
  route('*', 'routes/catch-all.jsx'),
];
