# Security checklist

Status against docs/05 §Security. Ticked means built and tested in this repo. Open means not yet done, and the note says why.

## Headers and transport
- [x] Strict CSP on the static site (`_headers`, written by `web/scripts/post-build.js`): `default-src 'self'`, no `unsafe-inline` scripts, inline hydration scripts allowed by SHA-256 hash, `frame-src` limited to Google (map, after the visitor clicks).
- [x] HSTS, `Referrer-Policy`, `Permissions-Policy` (camera, microphone, geolocation off), `X-Frame-Options: DENY`, `X-Content-Type-Options`. Set on the static site and on the API (Helmet).
- [ ] Verify the header set on the live domain (needs the domain, see TODO_CLIENT).

## CORS and cookies
- [x] API only accepts the web origin for admin changes (Origin check on every state-changing admin request).
- [x] Session cookie: `httpOnly`, `SameSite=Lax`, `Secure` and the `__Host-` prefix in production, 12-hour expiry, signed (HMAC-SHA256).
- [ ] Rotate the session ID on login. Sessions are signed tokens with no server store, so there is no ID to rotate yet. Revisit if sessions move to a store.

## CSRF
- [x] `SameSite=Lax` plus an Origin check on state-changing requests. A missing Origin header is allowed (same-origin navigation and server calls).

## Validation
- [x] zod on every body, query and param in the public and admin routes. Errors use the documented shape with field messages.
- [x] Mongoose `sanitizeFilter` and `strictQuery` on. Operator filters are wrapped in `mongoose.trusted()` only where the code writes them.
- [x] Body limit 32 KB.

## Rate limits
- [x] Bookings 10 per hour per IP, inquiries 5 per hour, slots 120 per minute, admin login 10 per 15 minutes (tested for bookings).
- [x] Account lockout: 5 failed sign-ins lock the account for 15 minutes (tested).
- [x] Unknown emails take the same time to reject as wrong passwords (dummy hash check).
- Rate limits are off in development so repeated test runs are not blocked. They are on whenever `NODE_ENV=production`.

## Bots
- [x] Honeypot field on booking and inquiry forms. A filled field is refused (tested).
- [x] Minimum three seconds between the form loading and submitting (tested).
- [ ] Cloudflare Turnstile (optional, behind a flag). Not built. Add it if spam appears.

## Passwords and secrets
- [x] Admin passwords are hashed with scrypt (Node's built-in memory-hard KDF). CLAUDE.md asks for argon2id. This is a deliberate substitute to avoid a native build. Revisit with the client's approval.
- [x] First sign-in forces a password change (tested).
- [x] Secrets only from environment variables. `env.js` refuses to start in production without `MONGODB_URI` and `SESSION_SECRET`.
- [x] Logs redact patient fields, notes, messages, passwords, cookies and authorization headers. Error messages are not logged, only the error name and code.

## Patient data (Nigeria Data Protection Act 2023)
- [x] Explicit consent checkbox on every form that collects health or contact data. The consent text version is stored with each booking and inquiry.
- [x] Minimum collection: no date of birth, address or health history fields.
- [ ] Retention job (anonymise bookings and inquiries after 24 months). Not built. Scheduled for after launch.
- [ ] Admin export or delete of patient data by phone number. Not built.
- [x] Privacy and terms pages are drafts and carry a banner until a Nigerian lawyer has reviewed them (TODO_CLIENT).

## Admin
- [x] 401 without a session. 403 while a password change is pending. 403 for staff on owner-only routes (settings, prices, availability, audit).
- [x] Audit log for admin changes. Diffs hold settings values only, never notes.

## Dependencies
- [x] `npm audit --omit=dev` reports zero findings.
- [x] Dependabot configured (`.github/dependabot.yml`).

## Backups
- [ ] Nightly `mongodump` to encrypted storage. Documented in RUNBOOK.md, not yet scheduled.
