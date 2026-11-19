# Deploy

Recommended setup from docs/05 §Hosting. Two deploys: the static web app, and the API with its database. Nothing here has been run against live services yet. Follow the steps in order and check each one.

## 1. Domain and DNS (client)
- Confirm the domain (docs/01 suggests `happydayacupuncture.com`). Update `SITE_URL` in `web/app/lib/site-url.js`.
- Redirect `www` to the apex domain, and the `.com.ng` domain to the apex.
- Create `api.<domain>` as a CNAME to the API host. TLS is provided by the host.

## 2. Database: MongoDB Atlas
1. Create a cluster in the same region as the API (Frankfurt or London, docs/05). M0 is fine to start; M10 when backups matter.
2. Create a database user with read and write access to one database. Do not use the admin user.
3. Allow the API host's outbound IPs (or allow access from anywhere and rely on the credentials, with a strong password).
4. Copy the connection string into `MONGODB_URI`.

## 3. API: Render, Railway or Fly.io
1. Create a web service from this repository, root directory `api`.
2. Build command: `npm ci`. Start command: `node src/server.js`. Node version: 24 (see `.nvmrc`).
3. Set the environment variables below.
4. After the first deploy, run the seed once (`npm run seed -w api`) with the production `MONGODB_URI`. It is idempotent.
5. Check `https://api.<domain>/api/v1/health` returns `{ "ok": true }`.

### Environment variables (API)

| Name | Required | Notes |
|---|---|---|
| `NODE_ENV` | yes | `production` |
| `MONGODB_URI` | yes | Atlas connection string |
| `SESSION_SECRET` | yes | 32 or more random characters. Generate with `openssl rand -base64 48` |
| `WEB_ORIGIN` | yes | `https://<domain>` |
| `API_ORIGIN` | yes | `https://api.<domain>` |
| `ADMIN_EMAIL` | yes (first deploy) | The owner's sign-in email |
| `ADMIN_INITIAL_PASSWORD` | yes (first deploy) | At least 12 characters. The owner must change it on first sign-in. Remove it from the environment afterwards |
| `LOG_LEVEL` | no | Defaults to `info` |

## 4. Web: Cloudflare Pages
1. Create a Pages project from this repository.
2. Build command: `npm ci && npm run build -w web`. Build output directory: `web/build/client`.
3. Environment variable `VITE_API_ORIGIN=https://api.<domain>` (the browser calls the API directly).
4. Set the custom domain. Pages serves `_headers` (CSP and security headers) and `404.html` from the build.
5. Fallback routing: Pages serves `__spa-fallback.html` for `/book/*`, `/booking/*` and `/admin/*` through its SPA setting. Confirm `/book` and `/admin` load directly, not only from inside the site.
6. Check the CSP on the live site. Any blocked script shows in the browser console; fix before launch.

## 5. Email

## 6. Verify before announcing
- [ ] Home loads on a Moto G-class phone over throttled 4G (Lighthouse CI, see `lighthouserc.json`).
- [ ] A test booking goes through to the confirmation page.
- [ ] The admin signs in, changes the password, marks a test booking paid.
- [ ] `/sitemap.xml` and `/robots.txt` load on the live domain. Submit the sitemap to Google Search Console.

## Alternative: a single VPS (Hetzner or DigitalOcean)
- Nginx serves `web/build/client` and proxies `/api` to the API process, which runs under PM2.
- certbot provides TLS for the domain and the API subdomain.
- Use the same environment variables, and run the seed once.
- Back up the database (see RUNBOOK.md).
