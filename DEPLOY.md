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

## 3. API on Vercel (second project)

The API is a separate Vercel project built from the same repository.

1. In Vercel, **Add New Project**, import the repository, and set **Root Directory** to `.` (the repository root). Vercel reads the root `vercel.json` and the function in `api/index.js`, which re-exports the code in `backend/`.
2. Add the environment variables below (Production).
3. Deploy. Check that `https://<api-project>.vercel.app/api/v1/health` returns `{ "ok": true }`.
5. Atlas must accept connections from Vercel. Allow `0.0.0.0/0` on the Atlas network list, and rely on the database user's password.

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

## 4. Web on Vercel (first project)

1. In Vercel, **Add New Project**, import the same repository, and set **Root Directory** to `web`. Vercel reads `web/vercel.json`.
2. **Before the first deploy**, edit `web/vercel.json` and replace `REPLACE-WITH-API-HOST` with the API project's address from section 3 (for example `happyday-api.vercel.app`). Until you do, booking and admin calls fail.
3. Leave `VITE_API_ORIGIN` empty. The web app calls `/api` on its own domain, and Vercel forwards it to the API. This keeps the admin login cookie working.
4. Set the custom domain (`happydayacupuncture.com`). Set the API's `WEB_ORIGIN` to that domain.
5. Reloads: `/admin`, `/book` and `/booking/<ref>` are served by the app shell, so a refresh on those pages loads them directly. Check each one with a browser refresh.
6. The security policy is written into every page, and the API proxy is set in `vercel.json`. Check the browser console on the live site for any blocked script or style, and fix it before launch.

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
