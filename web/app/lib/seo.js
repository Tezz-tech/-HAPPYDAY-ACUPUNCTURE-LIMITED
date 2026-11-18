import { SITE_URL } from './site.js';

/**
 * Route meta (title, description, canonical, Open Graph and Twitter tags) for React Router.
 * @param {{ title: string, description: string, path: string, image?: string }} opts
 * @returns {Array<Record<string, string>>}
 */
export function seoMeta({ title, description, path, image = '/brand/icon-512.png' }) {
  const url = `${SITE_URL}${path}`;
  return [
    { title },
    { tagName: 'link', rel: 'canonical', href: url },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: url },
    { property: 'og:image', content: `${SITE_URL}${image}` },
    { property: 'og:locale', content: 'en_GB' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ];
}

/** @param {string} path */
export function canonicalLink(path) {
  return { rel: 'canonical', href: `${SITE_URL}${path}` };
}
