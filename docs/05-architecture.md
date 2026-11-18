# 05: Architecture

## Repo layout (npm workspaces)
```
happyday/
├─ CLAUDE.md  PROGRESS.md  TODO_CLIENT.md (generated)
├─ package.json                 # workspaces: web, api, shared; root scripts
├─ content/                     # business content JSON (source of truth)
├─ assets/                      # brand + processed photos (copied into web/public at build)
├─ shared/
│  ├─ schemas/                  # zod: booking, inquiry, appointmentType, settings, auth
│  ├─ slots.js                  # pure slot engine + bucket helpers
│  ├─ whatsapp.js               # wa.me link builders
│  ├─ phone.js                  # Nigerian phone normalise/validate → E.164
│  ├─ money.js  time.js         # NGN formatting; Africa/Lagos helpers (date-fns v4 + @date-fns/tz)
│  └─ constants.js              # statuses, roles, enums
├─ web/
│  ├─ react-router.config.js    # ssr:false, prerender: async () => [...static, ...treatment slugs]
│  ├─ vite.config.js
│  ├─ app/
│  │  ├─ root.jsx  routes.js
│  │  ├─ routes/                # home, about, treatments._index, treatments.$slug, your-visit, contact, book.*, booking.$ref, privacy, terms, admin.*, $ (404)
│  │  ├─ components/            # ui/ (Button, Input, Chip, Accordion, Sheet), brand/ (Logo, Seal, Mark), layout/ (Header, Footer, MobileActionBar, Meridian)
│  │  ├─ features/              # needle-field/, body-map/, needle-scale/, treatment-index/, visit-steps/, booking/, admin/
│  │  ├─ content/               # build-time imports of /content
│  │  ├─ lib/                   # api client (fetch wrapper), analytics, seo (meta + JSON-LD builders), images (Picture component)
│  │  └─ styles/                # app.css (Tailwind v4 @theme tokens), fonts.css, grain.css
│  └─ public/                   # fonts, favicons, robots.txt, og images (generated)
└─ api/
   ├─ src/
   │  ├─ server.js  app.js  env.js (zod-validated env)
   │  ├─ db.js                  # mongoose connect, sanitizeFilter, strictQuery
   │  ├─ models/                # Booking, SeatLock, BookingEvent, AppointmentType, Availability, Exception, Inquiry, Testimonial, Settings, User, AuditLog
   │  ├─ routes/                # public.js, bookings.js, inquiries.js, admin/*.js, auth.js, health.js
   │  ├─ services/              # bookingService (transactions), slotService, notifyService, mailer, ics
   │  ├─ payments/              # provider interface, bankTransfer, paystack (stub)
   │  ├─ jobs/                  # expireHolds (5 min), reminders (15 min)
   │  ├─ middleware/            # auth, requireRole, rateLimits, originCheck, errorHandler, validate(zodSchema)
   │  └─ emails/                # templates (HTML + text)
   ├─ scripts/seed.js           # seed from /content (idempotent)
   └─ test/
```

## Data models (Mongoose; all have timestamps)
- **AppointmentType**: slug (unique), name, summary, durationMinutes, priceNaira (Number|null), depositNaira (Number|null), isFirstVisit, active, order.
- **Availability** (singleton): timezone, weekly `{ mon: [{start:'09:00', end:'17:00'}], … }`, breaks `[{ day, start, end }]`, slotIntervalMinutes, bufferMinutes, minNoticeHours, maxAdvanceDays, capacityPerSlot.
- **Exception**: date (YYYY-MM-DD, unique), closed (bool), ranges (optional custom hours), note.
- **Booking**: ref (unique), status (enum), holdsSlot (bool), appointmentType (ref + snapshot of name, duration and price at booking time), start and end (Date, UTC), seat, concern (treatment slug | 'general'), notes (max 500), patient `{ name, phoneE164, email?, firstVisit }`, consent `{ given: true, at, textVersion }`, payment `{ mode, amountDue, amountPaid, method, receivedAt, submittedAt, note }`, manageTokenHash, holdExpiresAt, reminderEmailSentAt, reminderWhatsappAt, cancelledReason, source (`web|admin|whatsapp`). Indexes: `{ start: 1 }`, `{ status: 1, start: 1 }`, `{ 'patient.phoneE164': 1 }`, `{ ref: 1 }` unique.
- **SeatLock**: bookingId, bucket (Date), seat (Number), holds (bool). **Unique `{ bucket: 1, seat: 1 }` with partial filter `{ holds: true }`.** Plus `{ bookingId: 1 }`.
- **BookingEvent**: bookingId, at, actor (`patient|admin:<id>|system`), from, to, note.
- **Inquiry**: name, phoneE164, email?, topic, message, replyVia, status, consent, notes.
- **Testimonial**: quote, displayName, concern, consentConfirmed, published, order.
- **Settings** (singleton): bank `{ bankName, accountName, accountNumber }`, paymentMode, unpaidHoldMinutes, notifyEmails[], whatsappE164, cancellationNoticeHours, hoursArePlaceholder.
- **User**: email, passwordHash (argon2id), role (`owner|staff`), mustChangePassword, failedLogins, lockedUntil, lastLoginAt.
- **AuditLog**: userId, action, entity, entityId, diff (with no patient health notes), ip, at.

## API (prefix `/api/v1`; JSON; every input validated with the shared zod schemas)
Public:
- `GET  /health`: `{ ok, db }`
- `GET  /public/config`: appointment types (active), payment mode, bank details (only if the mode is transfer), the hours summary, hoursArePlaceholder, whatsapp.
- `GET  /public/slots?type=<slug>&from=YYYY-MM-DD&days=7`: `{ days: [{ date, slots: [{ start, period }] }], nextAvailable }`
- `POST /bookings`: body `{ typeSlug, start, concern, notes?, patient, consent: true, hp: '' , t }` → `201 { ref, status, manageUrl, payment }` | `409 SLOT_TAKEN { alternatives }` | `422`
- `POST /bookings/:ref/payment-submitted` (needs the token): → status payment_submitted
- `GET  /bookings/:ref?t=` → the patient view (minimal fields)
- `POST /bookings/:ref/cancel?t=` · `POST /bookings/:ref/reschedule?t=` `{ start }`
- `GET  /bookings/:ref/ics?t=` → text/calendar
- `POST /inquiries`
- `GET  /public/testimonials` (published and consented only)

Admin (cookie session + role):
- `POST /auth/login` · `POST /auth/logout` · `POST /auth/change-password` · `GET /auth/me`
- `GET /admin/bookings` (filters, pagination) · `GET /admin/bookings/:id` · `POST /admin/bookings` · `PATCH /admin/bookings/:id` (status transitions via an explicit `action`: confirm | markPaid | complete | noShow | cancel | reschedule) · `GET /admin/bookings.csv`
- `GET /admin/today?days=2`
- CRUD: `/admin/appointment-types`, `/admin/availability`, `/admin/exceptions`, `/admin/inquiries`, `/admin/testimonials`, `/admin/settings`
- `GET /admin/slots/preview?week=`

Error shape: `{ error: { code, message, fields? } }`. Codes: `VALIDATION`, `SLOT_TAKEN`, `NOT_FOUND`, `FORBIDDEN`, `RATE_LIMITED`, `CONFLICT`, `INTERNAL`.

## Security checklist
- **Helmet** with a strict CSP: `default-src 'self'`; `img-src 'self' data: https://maps.gstatic.com https://maps.googleapis.com`; `frame-src https://www.google.com` (map, after click); `connect-src 'self' https://api.<domain> https://<analytics>`; `font-src 'self'`; no `unsafe-inline` scripts (prerendered HTML has hashed inline JSON-LD, so allow those hashes or use `type="application/ld+json"`, which CSP doesn't execute). Also HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` that disables the camera, mic and geolocation.
- **CORS:** allowlist only the web origin(s). Credentials are allowed for admin.
- **Cookies:** `__Host-session` (httpOnly, Secure, SameSite=Lax, Path=/). Run the API on `api.<domain>`, the same site as the web, so Lax cookies work. Rotate the session ID on login. The session expires after 12 hours, sliding.
- **CSRF:** SameSite=Lax plus an `Origin`/`Referer` check on all state-changing requests.
- **Validation:** zod on every body, query and param. Mongoose `sanitizeFilter: true` and `strictQuery: true`. Never pass raw `req.query` objects into filters. Express 5 makes `req.query` a getter, so don't use `express-mongo-sanitize`, which is incompatible.
- **Rate limits** (`express-rate-limit`, Mongo or memory store): bookings 10/hour/IP, inquiries 5/hour/IP, login 10 per 15 min per IP plus the account lockout, slots 120/min/IP.
- **Bots:** a honeypot field, a time-to-submit of at least 3 s, and optional Cloudflare Turnstile (behind an env flag) on booking and inquiry if spam appears.
- **Passwords:** argon2id. Secrets only in env, and `env.js` fails fast on missing ones. Log with pino and redact `patient.*`, `notes`, `message`, `password` and `authorization`.
- **Data protection (NDPA 2023):** explicit consent checkboxes (store the consent text version), minimal collection, a retention job (anonymise bookings and inquiries older than 24 months, configurable), an admin "Export/Delete patient data" action by phone number, and encryption at rest (Atlas default) and in transit.
- **Backups:** Atlas automated backups if on a paid tier. On the free tier, a nightly `mongodump` GitHub Action to encrypted storage. Document the restore steps in `RUNBOOK.md`.
- Dependabot plus `npm audit` in CI.

## SEO
- Prerender every marketing route. Each has a unique `<title>`, meta description, canonical URL, Open Graph and Twitter tags, and an OG image (generated at build with `satori` + `@resvg/resvg-js`: paper background, the H1 in Gambetta, the mark and the URL).
- **JSON-LD:** on the home page, `MedicalClinic` (+ `LocalBusiness`) with name, legalName, logo, image, telephone, address (`PostalAddress`), geo (when known), `openingHoursSpecification` (only when the hours aren't placeholders), `priceRange` (when known), `sameAs` (confirmed socials), `founder` (Person), `foundingDate` 2024 and `medicalSpecialty` (use `"Acupuncture"` as text), and `availableService` (`MedicalTherapy` for each treatment area). `BreadcrumbList` on inner pages, `FAQPage` on /your-visit and `MedicalWebPage` on treatment pages.
- `sitemap.xml` (all prerendered routes, lastmod at build) and `robots.txt` (disallow `/admin`, `/booking`, `/book/confirmed`).
- Local keywords appear naturally in titles and H1s: "acupuncture Abuja", "acupuncture clinic Jabi", "fertility acupuncture Abuja", "TCM clinic Abuja", "acupuncture for back pain Abuja".
- Use semantic HTML with one H1 per page. Images have descriptive alt text (from the manifest). Internal links run between related treatments.
- **Off-site (put in the launch checklist for the client):** create and verify a **Google Business Profile** (the biggest local SEO lever), keep the name, address and phone identical everywhere, verify in Google Search Console and submit the sitemap, and add the site link to the WhatsApp Business profile and social bios.

## Performance plan
- Prerendered HTML with the critical CSS inlined (Tailwind v4 output is small). The H1 text is the LCP element, so no hero image needs to load first.
- Preload Gambetta 400 and Switzer 400 woff2 (subsetted). Use `size-adjust` fallbacks to avoid layout shift on font swap.
- Code-split by route. GSAP plugins load only on routes that use them, and the needle field and body map are lazy chunks. The admin bundle is fully separate.
- Images: AVIF → WebP → JPG `<picture>`, explicit width and height, `loading="lazy"` and `decoding="async"` below the fold, with LQIP.
- Load the map iframe only on click. Use no third-party scripts except privacy-friendly analytics (deferred).
- Long-cache static assets with content hashes. Brotli compression.

## Hosting and deploy (recommended)
- **Web:** Cloudflare Pages (free, with an edge location in Lagos) serving `web/build/client`. Fallback routing serves `__spa-fallback.html` for `/book/*`, `/booking/*` and `/admin/*`.
- **API:** Render, Railway or Fly.io (a small instance) in a **Europe region** (Frankfurt or London: generally the lowest-latency mainstream option from Nigeria). `api.<domain>` uses a CNAME with TLS.
- **DB:** MongoDB Atlas in the same region (M0 to start, M10 when backups matter).
- **Email:** an SMTP provider with SPF, DKIM and DMARC set on the domain.
- **Alternative (cheapest):** a single VPS (Hetzner or DigitalOcean) with Nginx + PM2 + certbot, serving the static web and proxying `/api`. Document both in `DEPLOY.md`.
- CI with GitHub Actions: lint → unit → API tests → build → Playwright (smoke + booking e2e) → Lighthouse CI (fail below the budgets) → deploy on `main`.
- Environments: `.env.example` for api and web. Variables: `MONGODB_URI`, `SESSION_SECRET`, `WEB_ORIGIN`, `API_ORIGIN`, `SMTP_*`, `MAIL_FROM`, `NOTIFY_EMAILS`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD`, `TURNSTILE_*` (optional), `PAYSTACK_*` (optional), `ANALYTICS_*` (optional).

## Scripts (root)
- `npm run dev`: web and api concurrently (api uses an in-memory replica set if `MONGODB_URI` is unset, for zero-setup dev)
- `npm run seed`: seed from `/content`
- `npm run test`, `npm run test:e2e`, `npm run lint`, `npm run build`
- `npm run check:todos`: scans `/content` and the code for `TODO_CLIENT` and rewrites `TODO_CLIENT.md`
- `npm run screenshots`: Playwright captures each route at 390, 768 and 1440 px (+ reduced motion) into `/screenshots`
