# 06: Build plan

Work through the phases in order. At the end of each phase: run the acceptance checks, fix what fails, update `PROGRESS.md`, and commit (`phase-N: <summary>`). Don't start the next phase with failing checks. If you're blocked on something only the client can answer, use the documented fallback, log it in `TODO_CLIENT.md`, and keep going.

---

## Phase 0: Scaffold and tooling
- npm workspaces `web`, `api` and `shared`. ESLint (flat config) + Prettier. `.editorconfig`. `.nvmrc` (Node 22 or 24 LTS).
- Scaffold `web` as React Router v7 framework mode (`ssr: false`, `prerender` list), Vite, Tailwind v4.
- Scaffold `api` with Express 5, `env.js` (zod), `db.js`, and a health route. Dev mode uses `mongodb-memory-server` as a **replica set** when `MONGODB_URI` is unset.
- `scripts/sync-assets.js` copies `/assets/brand` and `/assets/photos` into `web/public/` and generates LQIP base64 entries into `web/app/content/photos.generated.js` from `manifest.json`.
- **Fonts:** download Gambetta (400, 400 italic, 500) and Switzer (400, 500, 600) woff2 from Fontshare (`https://www.fontshare.com/fonts/gambetta` and `/switzer`, or their CSS API). Subset with `pyftsubset` or `glyphhanger` to Latin + Latin Extended-A + the pinyin tone characters (ǎ ǐ ǒ ǔ ā ē ī ō ū á é í ó ú à è ì ò ù ǚ ǜ) + ₦. If the download fails, stop and ask the user to download the two families from fontshare.com into `web/public/fonts/raw/`.
- `npm run check:todos` writes `TODO_CLIENT.md`.
- **Checks:** `npm run dev` serves the web app on :5173 and the API on :4000; `/api/v1/health` returns ok; lint passes; `TODO_CLIENT.md` lists at least 15 items.

## Phase 1: Design system
- `app.css`: the Tailwind v4 `@theme` with **only** the tokens in docs/02 §2, §4, §5.1 and §6 (colours, fonts, fluid type utilities, radii, the one shadow, easing and durations as CSS vars). Disable or remove the default palette so `bg-blue-500` doesn't exist.
- Grain overlay, base typography, focus styles, selection colour (`forest-700` bg, paper text) and the reduced-motion base.
- Components: `Button` (all variants + hover sweep), `Link` (underline draw), `Input`, `Textarea`, `Select`, `Checkbox`, `PhoneInput`, `Chip`, `SegmentedControl`, `Accordion`, `Sheet`, `Toast`, `Picture` (AVIF/WebP/JPG + LQIP + clip reveal), `Logo`, `Mark`, `Seal` (with stamp animation), `AcupointLabel`, `Rule` (hairline with label).
- A dev-only `/styleguide` route showing everything on `paper` and on `forest-900`.
- **Checks:** run `npm run screenshots` on `/styleguide` and review against docs/02. Every text/background pair in the styleguide passes AA (automated with axe). There's no default Tailwind colour in the compiled CSS (grep the output for `oklch(` palette names).

## Phase 2: Layout and content pages (no heavy interactions yet)
- `Header` (transparent → solid, hide/show on scroll), mobile menu sheet, `Footer`, `MobileActionBar`, and the `Meridian` component (static path + points for now).
- Build every route in docs/03 with real copy from `/content`: Home (all sections, using simple placeholders for the needle field, body map and needle scale), About, Treatments index, Treatment detail (10 prerendered), Your visit, Contact (form UI only), Privacy/Terms drafts (with the draft banner), and 404.
- SEO helpers: per-route meta, canonical, OG tags and JSON-LD builders. `sitemap.xml` and `robots.txt` generated at build.
- **Checks:** `npm run build` prerenders all routes into static HTML that contains the real text (check with `grep` that `/treatments/fertility-support/index.html` contains "Fertility support"). Screenshots at 3 widths for every route: no overflow at 360 px, one H1 per page. Lighthouse SEO = 100 on home and one treatment page. No banned words: write `scripts/lint-copy.js` that greps the built HTML for the list in CLAUDE.md and fails the build.

## Phase 3: Signature interactions and motion
Build in this order, profiling each:
1. **Hero intro** choreography + SplitText headline masks.
2. **Needle field** canvas (docs/02 §5.3). Profile it in Chrome DevTools with 4× CPU throttling: there must be no long tasks over 50 ms after init, and it pauses off-screen.
3. **Meridian**: DrawSVG scroll-scrubbed + point pulses.
4. **Body map** (docs/02 §5.4), with a hand-authored SVG figure (front + back) and full keyboard support.
5. **Needle scale** (docs/02 §5.5), with true-to-ratio bars and the magnify toggle.
6. **Treatment index** with cursor-follow previews (fine pointer only).
7. **Visit steps**: pinned horizontal on desktop, timeline on mobile.
8. **Inside the clinic** rail, image clip reveals, and duotone → colour.
9. Page transitions (View Transitions), Lenis (fine pointer only), the magnetic primary CTA.
- **Checks:** Lighthouse mobile Performance ≥ 90 on home (CI run with throttling), CLS < 0.05, and home first-load JS ≤ 160 KB gzipped (output a `vite-bundle-visualizer` report). Reduced-motion screenshots look designed. Keyboard: tab through the whole home page; the body map is fully operable and focus is always visible. Then run `/design-qa` and fix everything it finds.

## Phase 4: API core and slot engine
- All models and indexes (docs/05), including the **partial unique index** on SeatLock.
- `shared/slots.js` + `bookingService` with transactions and the seat-lock acquisition (docs/04).
- Public endpoints: config, slots, bookings (create, view, payment-submitted, cancel, reschedule, ics), inquiries and testimonials.
- Jobs: expire holds, reminders. `seed.js` (idempotent) from `/content`.
- **Checks:** unit tests cover every edge case listed in docs/04, with at least 95% line coverage on `slots.js`. The concurrency test (20 parallel creates → exactly `capacity` succeed) passes 10 runs in a row. API tests cover the validation errors, rate limit responses, token checks and every status transition (illegal transitions are rejected).

## Phase 5: Booking flow (web)
- `/book` multi-step (docs/03 + docs/04): URL-synced step state (`?step=`, so the back button works), a progress meridian with 5 points, and `motion` `AnimatePresence` step transitions with height auto-animate. A sticky summary on desktop; a collapsible summary bar on mobile.
- The slot picker: a week strip + period-grouped chips, prefetching the next week, plus a skeleton state. On 409, show an inline toast ("Someone just took that time") and highlight the alternatives.
- The payment step (bank details with copy buttons, the countdown, WhatsApp receipt), the confirmation with the seal stamp, `.ics`, Google Calendar link and directions.
- `/booking/:ref?t=`: view, cancel and reschedule.
- Emails (HTML + text) for every event in docs/04, previewed with a `npm run email:preview` script that writes HTML files to `/tmp/emails`.
- Contact inquiry form wired to the API.
- **Checks:** Playwright e2e on a 390 px viewport: home → body map "Back & hips" → "Book about this" → type → first available slot → details → "I've made the transfer" → confirmation shows the ref. A second e2e run does a cancel through the manage link. The whole flow is keyboard-only possible. axe reports no violations on every step.

## Phase 6: Admin dashboard
- Login, forced password change, Today, Bookings (list/filter/export), Booking detail with actions, New booking, Availability editor with live preview, Exceptions calendar, Appointment types, Inquiries, Testimonials, Settings, Audit log view (owner only).
- WhatsApp "send confirmation / reminder" buttons, as in docs/04.
- **Checks:** e2e covers: an admin marks a payment_submitted booking as paid → the status is confirmed and an email is queued; an admin closes a date → no slots appear publicly on that date; an admin changes the price → the booking page shows the new price. Every admin route returns 401 without a session and 403 for staff on owner-only routes.

## Phase 7: Hardening, SEO and launch readiness
- Security checklist (docs/05) completed and ticked in `SECURITY.md`.
- OG image generation, complete JSON-LD, sitemap, robots and canonical domain handling (www → apex redirect noted in `DEPLOY.md`).
- Lighthouse CI budgets enforced in GitHub Actions. Dependabot.
- `DEPLOY.md` (Cloudflare Pages + Render/Railway + Atlas, and the VPS alternative), `RUNBOOK.md` (backups, restore, rotating the admin password, changing bank details, adding a closure), and `HANDOVER.md` (a plain-English guide for the clinic owner to use the admin: how to confirm a payment, how to block a day off, how to change prices).
- Final `TODO_CLIENT.md` regenerated and sorted by priority (launch-blocking first).
- **Checks:** a full CI run is green. A manual pass through the launch checklist at the end of this file.

## Phase 8 (optional, only if asked)
Paystack payments, the WhatsApp Cloud API automated messages, Cloudflare Turnstile, a blog/journal (MDX, prerendered) for SEO articles such as "What to expect at your first acupuncture session in Abuja".

---

## Launch checklist
- [ ] Every launch-blocking TODO_CLIENT item resolved (prices, hours, address/pin, email, cancellation policy, legal review)
- [ ] Real founder portrait in place, or the designed placeholder approved by the client
- [ ] Patient photo consent confirmed
- [ ] Bank details verified by the client in admin Settings
- [ ] Admin password changed; the owner has walked through `HANDOVER.md`
- [ ] SPF, DKIM and DMARC pass; test emails land in inbox (not spam) on Gmail and Yahoo
- [ ] Google Business Profile created; Search Console verified; sitemap submitted
- [ ] Analytics receiving events; no PII in events
- [ ] Backups configured and a restore tested once
- [ ] 404, offline/API-down states (the booking page shows "Book on WhatsApp instead" if the API is unreachable), and the reduced-motion version all checked on a real Android phone
