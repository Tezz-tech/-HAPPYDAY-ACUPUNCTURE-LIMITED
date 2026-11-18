# Happyday Acupuncture: build package

A complete brief, design system, content and prepared assets. Claude Code builds the site (React + React Router v7 frontend, Node/Express/MongoDB backend) from this folder.

## What's inside
| Path | What it is |
|---|---|
| `KICKOFF_PROMPT.md` | The first message to paste into Claude Code |
| `CLAUDE.md` | Standing rules Claude Code reads every session: stack, quality bar, banned "AI-look" patterns |
| `docs/01-business-brief.md` | The business, audience, competitor research, photo brief, open questions for the client |
| `docs/02-design-direction.md` | The design concept, colours, type, layout, the three signature interactions, and the motion system |
| `docs/03-pages-and-copy.md` | Every page, section by section, with final copy and the medical-claims rules |
| `docs/04-booking-system.md` | Booking states, slot engine, double-booking prevention, bank transfer, WhatsApp, admin |
| `docs/05-architecture.md` | Repo layout, data models, API, security, SEO, performance, hosting |
| `docs/06-build-plan.md` | Phases 0–8 with acceptance checks, plus a launch checklist |
| `content/*.json` | Business facts, the 10 treatment areas, body-map data and FAQs. Gaps are marked `TODO_CLIENT` |
| `assets/photos/` | 7 photos, colour-corrected and with faces blurred, plus 8 detail crops and green duotone versions, in AVIF, WebP and JPG. `manifest.json` has alt text and size limits |
| `assets/brand/` | Vector trace of the logo, a simplified mark for small sizes, favicons and app icons |
| `assets/reference/` | The client's original logo and flyer, for reference only (not used on the site) |
| `.claude/commands/` | `/next-phase` (continue the build) and `/design-qa` (screenshot and critique every page) |

## How to run it
1. Install **Node 22+** and **git**. After Phase 0, run `npx playwright install` once.
2. Unzip, then `cd happyday-build` and run `claude`.
3. Use the strongest model available (`/model`), and allow edits.
4. Paste the contents of `KICKOFF_PROMPT.md`.
5. The full build takes several sessions. When a session ends or the context fills up, start a new one in the same folder and type `/next-phase`. `PROGRESS.md` tells it where it left off.
6. After each UI phase, open `npm run dev` on your phone (same Wi-Fi, use your laptop's IP) and look for yourself. If something feels off, say so specifically ("hero headline too big on mobile", "the body map panel feels cramped"), then run `/design-qa`.

You don't need a database to start: dev mode runs an in-memory MongoDB. You'll need a MongoDB Atlas cluster and an SMTP provider before deploying (Phase 7, `DEPLOY.md`).

## Get these from the client before launch (full list in docs/01)
Prices and session lengths · opening hours and how many patients can be treated at once · official email · social links · exact address and a Google Maps pin · CAC RC number · founder bio and portrait · the original logo file · which extra services are offered (moxibustion, cupping and so on) · cancellation policy · domain · real testimonials with permission · written consent from patients in the photos · original full-resolution photos (send as *Document* on WhatsApp, not Photo).
