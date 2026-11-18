// Post-build steps for the static host (Cloudflare Pages, docs/05):
//  - sitemap.xml and robots.txt
//  - 404.html copied from the prerendered /404 page
//  - _headers with a strict Content-Security-Policy. Inline scripts from React Router's
//    hydration are allowed by SHA-256 hash, computed from the built HTML, so unsafe-inline is never needed.
import { createHash } from 'node:crypto';
import { copyFile, readFile, readdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../react-router.config.js';
import { SITE_URL } from '../app/lib/site-url.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const client = path.resolve(here, '../build/client');

/** @param {string} dir @returns {Promise<string[]>} */
async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir)) {
    const full = path.join(dir, entry);
    if ((await stat(full)).isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

/**
 * Hashes of inline (no src) script bodies, so the CSP can allow exactly these.
 * @param {string} html
 * @returns {string[]}
 */
function inlineScriptHashes(html) {
  const hashes = [];
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const body = m[1];
    // application/ld+json is data, not code, so it is not executed and needs no hash.
    if (/type="application\/ld\+json"/.test(m[0])) continue;
    if (!body) continue;
    hashes.push(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
  return hashes;
}

async function main() {
  const files = await htmlFiles(client);
  const hashes = new Set();
  for (const file of files) {
    for (const h of inlineScriptHashes(await readFile(file, 'utf8'))) hashes.add(h);
  }

  const csp = [
    "default-src 'self'",
    `script-src 'self' ${[...hashes].join(' ')}`,
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: https://maps.gstatic.com https://maps.googleapis.com",
    "font-src 'self'",
    "connect-src 'self'",
    'frame-src https://www.google.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; ');

  const headers = [
    '/*',
    `  Content-Security-Policy: ${csp}`,
    '  Strict-Transport-Security: max-age=31536000; includeSubDomains',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    "  Permissions-Policy: camera=(), microphone=(), geolocation=()",
    '  X-Content-Type-Options: nosniff',
    '  X-Frame-Options: DENY',
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/photos/*',
    '  Cache-Control: public, max-age=2592000',
    '',
  ].join('\n');
  await writeFile(path.join(client, '_headers'), headers);

  const routes = typeof config.prerender === 'function' ? await config.prerender() : config.prerender;
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .filter((r) => r !== '/404')
    .map((r) => `  <url><loc>${SITE_URL}${r}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n');
  await writeFile(
    path.join(client, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );

  await writeFile(
    path.join(client, 'robots.txt'),
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /booking',
      'Disallow: /book/confirmed',
      '',
      `Sitemap: ${SITE_URL}/sitemap.xml`,
      '',
    ].join('\n'),
  );

  await copyFile(path.join(client, '404', 'index.html'), path.join(client, '404.html'));
  console.log(
    `post-build: ${files.length} pages, ${hashes.size} inline script hash(es), sitemap ${routes.length - 1} URLs`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
