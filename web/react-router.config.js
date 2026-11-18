import treatments from '../content/treatments.json' with { type: 'json' };

/**
 * React Router v7 framework mode, client-only rendering with prerendered HTML for
 * every marketing route. /book, /booking and /admin are SPA routes (no prerender).
 * @type {import('@react-router/dev/config').Config}
 */
export default {
  appDirectory: 'app',
  ssr: false,
  prerender: [
    '/',
    '/about',
    '/treatments',
    ...treatments.treatments.map((t) => `/treatments/${t.slug}`),
    '/your-visit',
    '/contact',
    '/privacy',
    '/terms',
    '/404',
  ],
};
