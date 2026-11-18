import { index, layout, route } from '@react-router/dev/routes';

/**
 * Route table (docs/05). Marketing pages share the site layout and are prerendered.
 * The styleguide is dev-only. The booking and admin routes sit outside the site layout (Phase 5 and 6).
 */
export default [
  layout('routes/site-layout.jsx', [
    index('routes/home.jsx'),
    route('about', 'routes/about.jsx'),
    route('treatments', 'routes/treatments.jsx'),
    route('treatments/:slug', 'routes/treatment.jsx'),
    route('your-visit', 'routes/your-visit.jsx'),
    route('contact', 'routes/contact.jsx'),
    route('privacy', 'routes/privacy.jsx'),
    route('terms', 'routes/terms.jsx'),
    route('404', 'routes/not-found.jsx'),
    route('*', 'routes/not-found.jsx', { id: 'catch-all' }),
  ]),
  route('styleguide', 'routes/styleguide.jsx'),
];
