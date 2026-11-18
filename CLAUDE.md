# CLAUDE.md: Happyday Acupuncture

You are building the website and booking system for **Happyday Acupuncture Limited**, an acupuncture and Traditional Chinese Medicine clinic in Jabi, Abuja, Nigeria (founded 2024 by Balogun Happyday Ojoayo, Dip. Acupuncture & Moxibustion).

The site has two jobs:
1. Make a nervous first-timer in Abuja trust this clinic enough to book. Most visitors are on a mid-range Android phone with mobile data.
2. Let them book a real time slot online, or on WhatsApp, and pay by bank transfer. The clinic manages everything from a small admin dashboard.

The quality bar is a studio-built, award-level site. It must never look template-made or AI-generated. **Read every file in `/docs` before writing code.** Business facts live in `/content/*.json`. Never invent facts.

## Read order
1. `docs/01-business-brief.md`: who, what, where, and the open questions
2. `docs/02-design-direction.md`: the design system, signature interactions and motion. **This is the most important file.**
3. `docs/03-pages-and-copy.md`: every page, section by section, with final copy
4. `docs/04-booking-system.md`: booking flow, slot engine, payments, WhatsApp, admin
5. `docs/05-architecture.md`: stack, repo layout, data models, API, security, SEO, performance, deploy
6. `docs/06-build-plan.md`: phases and acceptance checks. Work through them in order.

## Stack (fixed: don't swap without asking)
- **Language:** JavaScript (ESM) throughout. Add JSDoc types on public functions. No TypeScript.
- **Frontend (`/web`):** React 19 + React Router v7 framework mode with `ssr: false` and `prerender` for every marketing route (static HTML for SEO), SPA fallback for `/book/*` and `/admin/*`. Vite. Tailwind CSS v4 using **only** the design tokens in docs/02. GSAP (+ ScrollTrigger, SplitText, DrawSVG; all free now) for scroll choreography. `motion` (`motion/react`) for component state transitions. Lenis on fine-pointer devices only.
- **Backend (`/api`):** Node 22+ LTS, Express 5, MongoDB via Mongoose 8, zod validation, pino logging, Nodemailer (SMTP), node-cron.
- **Shared (`/shared`):** zod schemas and constants used by both web and api (booking payloads, enums, slot rules).
- **Tests:** Vitest (unit), Supertest + mongodb-memory-server (API), Playwright (e2e + screenshots), axe-core (a11y), Lighthouse CI.
- Use npm workspaces. Use the latest stable version of every package, and check the docs of anything that changed after your training data.

## Non-negotiables
- **No invented content.** No fake testimonials, review counts, star ratings, patient numbers, years of experience, awards, certifications or prices. If a fact is missing, render a tasteful fallback (see docs/03) and add it to `TODO_CLIENT.md`. Every `TODO_CLIENT` string in `/content` must surface in `npm run check:todos`.
- **Medical claims follow docs/03 §0.** Use "support", "may help" and "alongside your medical care". Never write "cure", "treat infertility", "guaranteed" or "100%". Stroke and emergency disclaimers appear wherever docs/03 says.
- **Privacy:** patient photos are used only from `/assets/photos` (faces already blurred). Never add unblurred patient images. Health data falls under the Nigeria Data Protection Act 2023: get explicit consent, collect the minimum, and keep PII out of logs.
- **Performance budget (mobile, throttled 4G, Moto G-class):** LCP < 2.0 s, CLS < 0.05, INP < 200 ms. Home page JS ≤ 160 KB gzipped on first load, fonts ≤ 110 KB, total home page weight ≤ 1.2 MB. Lighthouse mobile: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 95, SEO = 100.
- **Accessibility:** WCAG 2.2 AA. Every interaction works by keyboard, focus is always visible, and `prefers-reduced-motion` gets a fully designed calm version, not a broken one. Touch targets are ≥ 44 px.
- **Double-booking is impossible.** The slot engine and the seat-lock unique index (docs/04) are the most-tested code in the repo.

## Anti-generic rules (read twice)
These patterns are banned. If you notice yourself reaching for one, stop and re-read docs/02.
- Gradients on text, purple or blue gradients, glassmorphism, glowing blobs, orbs, mesh backgrounds, sparkles.
- Emoji anywhere in the UI. Decorative icon sets (Lucide or Heroicons sprinkled on cards). Icons are allowed only where they do a job: WhatsApp, phone, map pin, chevrons, close, copy, check.
- A grid of three identical cards with icon + title + two lines. Any "features" grid.
- A centred hero with a pill badge ("✨ New"), headline and two buttons. A "Trusted by" bar.
- Uniform fade-up-on-scroll applied to everything. Motion is choreographed per section (docs/02 §6).
- Inter, Poppins, Montserrat, Roboto, Open Sans, Playfair Display, Cormorant. Default Tailwind colours (`blue-500`, `gray-100` and the like): use tokens only.
- `rounded-2xl shadow-lg` cards everywhere. Shadows are rare and soft, and the corner radius comes from tokens.
- Copy words: elevate, unlock, journey, seamless, empower, transform, holistic solutions, discover the power, cutting-edge, state-of-the-art, "your wellness journey". At most one em dash per page.
- Stock photos, AI-generated images, and the client's flyer artwork (`assets/reference/` is reference only).
- Lorem ipsum. Ship real copy from docs/03 or a deliberate, designed placeholder.

## Conventions
- British English (the client writes "personalised", "centred" and "diarrhoea"). Currency: `Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })`. All times are in `Africa/Lagos` (WAT, UTC+1, no DST). Store UTC, display WAT.
- Phone links: `tel:+2348036404321`. WhatsApp: `https://wa.me/2348036404321?text=<encoded>`, built by `shared/whatsapp.js`, never by hand.
- Components: one per file, PascalCase. Hooks: `useX`. Animation code lives next to its component in `*.motion.js`. Never put GSAP in the render path. Use `useGSAP` with a scope ref, and clean up.
- Content comes from `/content` (imported at build time into `web/app/content`). Operational data (prices, hours, bank details, availability) comes from the API, seeded from `/content`.
- Commit after each phase with a clear message. Keep `PROGRESS.md` updated: what's done, what's next, and any decisions you made.

## Definition of done for any UI work
1. It matches docs/02 and docs/03.
2. Playwright screenshots at 390, 768 and 1440 px are reviewed. Run `/design-qa`.
3. Reduced-motion is checked. Keyboard-only navigation is checked.
4. There are no console errors, no layout shift on load, and no horizontal scroll at 360 px.
5. Copy is spell-checked and contains no banned words.
