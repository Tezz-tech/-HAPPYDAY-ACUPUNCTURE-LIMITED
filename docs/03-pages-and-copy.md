# 03: Pages and copy

Final copy is below. Facts come from `/content`; don't hard-code anything that's in JSON. Copy in [brackets] is an instruction, not text to display.

## 0. Medical and claims rules (apply everywhere)
1. Acupuncture **supports**, **may help** and **can be used alongside** care. Never "cures", "treats" (when describing a disease outcome), "heals [condition]", "guaranteed", "100%" or "permanent".
2. Use "Heal naturally. Live better." as the brand tagline only, not as a promise about any condition.
3. Stroke is mentioned only together with: "A stroke is a medical emergency. Go to hospital immediately. Acupuncture can support rehabilitation afterwards." This appears on the Neurological page, in the body-map panel for whole-body, and in the FAQ.
4. Every treatment page ends with: "Acupuncture works alongside your doctor's care. Please keep taking any prescribed medication unless your doctor advises otherwise."
5. No before/after claims, no statistics, no "studies show" unless a real, cited source is added later.
6. The footer on every page carries this line: "Happyday Acupuncture Limited provides acupuncture and Traditional Chinese Medicine as complementary care. It does not replace diagnosis or treatment by a medical doctor."

## Sitemap (6 designed pages + legal + booking)
| Route | Page | Prerender |
|---|---|---|
| `/` | Home | yes |
| `/about` | About the clinic and founder | yes |
| `/treatments` | Treatment areas index | yes |
| `/treatments/:slug` | 10 treatment pages (one template) | yes (all slugs) |
| `/your-visit` | What to expect, needles, safety, fees, FAQ | yes |
| `/contact` | Contact, map, inquiry form | yes |
| `/book` | Booking flow (multi-step) | SPA |
| `/book/confirmed/:ref` | Confirmation | SPA |
| `/booking/:ref` | Manage a booking (token in query) | SPA |
| `/privacy`, `/terms` | Legal | yes |
| `/admin/*` | Dashboard | SPA, `noindex` |
| `*` | 404 (with seal) | yes |

Global header: Logo (horizontal) · Treatments · Your visit · About · Contact · [WhatsApp icon link] · **Book a visit** (primary button). On mobile: Logo + "Book" + menu button. The menu opens a full-screen `paper` sheet with large `display-m` links that stagger in, contact details at the bottom, and closes with Esc or the button.

Global footer (`forest-900`): Logo (stacked, on dark) · the address on two lines · phone · WhatsApp · email · hours (or "Hours: message us on WhatsApp" while the hours are placeholders) · nav links · socials (render only confirmed ones) · the seal + "Happyday Acupuncture Limited · RC [number]" (omit the RC until confirmed) · the complementary-care disclaimer (§0.6) · Privacy · Terms · © year.

---

## Home `/`

**§1 Hero** (label on the meridian: GV20 · Bǎihuì)
- Small line above the H1, `label` style: "Acupuncture & Traditional Chinese Medicine · Jabi, Abuja"
- H1 (`display-xl`, two lines): "Heal naturally. / Live *better.*"
- Lead: "Personalised acupuncture for pain, nerve problems, fertility, sleep and more. Every plan starts with a proper Traditional Chinese Medicine assessment of you, not just your symptoms."
- CTAs: **Book a consultation** → `/book` · secondary: "Chat on WhatsApp" → wa.me link with text "Hello Happyday Acupuncture, I'd like to ask about a consultation."
- Below the CTAs, a hairline row of three facts, small: "Diploma in Acupuncture & Moxibustion" · "Sterile, single-use needles" [CONFIRM] · "Bank transfer or WhatsApp booking"
- Right side / background: the needle field (docs/02 §5.3).

**§2 Where does it hurt?** (label: LI4 · Hégǔ)
- H2: "Start with what's *bothering* you."
- Sub: from `body-map.json` (subprompt).
- [Body map component, docs/02 §5.4.]

**§3 Treatment areas** (label: ST36 · Zúsānlǐ)
- H2: "What we help with"
- Intro (cols 7–12): "Ten areas of care, from long-standing back pain to fertility support. Each one starts with listening."
- [Typographic index of all 10 treatments from `treatments.json`, with cursor image previews. Link: "See all treatment areas →"]

**§4 Your first visit** (label: PC6 · Nèiguān)
- H2: "Your first visit, step by step"
- Four steps (pinned horizontal on desktop, timeline on mobile):
  1. **Talk.** "We start with your story: what's wrong, how long it's been going on, what you've already tried, and what you want to get back to."
  2. **Look and feel.** "A traditional tongue and pulse assessment. It takes a few minutes and doesn't hurt."
  3. **Treat.** "Hair-fine, sterile needles are placed at chosen points. You rest for 20 to 30 minutes. Most people find it deeply relaxing." [CONFIRM timings]
  4. **Plan.** "You leave knowing what we found, how many sessions we suggest, and what you can do at home."
- Link: "Everything about your visit →" `/your-visit`

**§5 Thinner than you think** (`forest-900`, label: HT7 · Shénmén)
- H2 (paper): "Thinner than *you think.*"
- Body: "An acupuncture needle is solid and about as fine as a few hairs together. An injection needle is hollow and roughly three times wider. Most people feel a light tap, then very little."
- [Needle scale, docs/02 §5.5.] Footnote (small, jade-300): "Typical sizes. Acupuncture needles usually range from 0.16 to 0.30 mm."

**§6 Meet your practitioner** (label: KI3 · Tàixī)
- Left: the portrait slot (docs/02 §5.7). Right:
- H2: "Meet Balogun Happyday Ojoayo"
- Role line: "Founder & Acupuncturist · Dip. Acupuncture & Moxibustion"
- Body [placeholder until the client supplies a bio; mark it TODO_CLIENT]: "Happyday Acupuncture opened in 2024 with a simple belief: good health deserves time, attention and a personal approach. Every treatment here begins with listening, and every plan is built around the person on the bed, not a template."
- The `abdomen-ring` duotone detail, small, offset into the margin.
- Link: "About the clinic →"

**§7 Inside the clinic**
- H2 (`display-s`, quiet): "Inside the clinic"
- A horizontal strip of 5 colour photos (scroll-snap on mobile; on desktop, a drag/scroll rail with slight parallax between images). Each has a caption in `small`, e.g. "Single-use needles, opened for you."
- [Only from `assets/photos`; respect the max widths.]

**§8 Patient words** [render only if at least 2 approved testimonials exist in the DB; otherwise omit the whole section, with no placeholder]
- H2: "In their words"
- Large Gambetta quote, first name or initials, and the concern ("Back pain"). One at a time, with slow cross-fade controls. No stars.

**§9 Questions** (label: CV6 · Qìhǎi)
- H2: "Good questions"
- An accordion of the `home: true` FAQs. Link: "All questions →"

**§10 Visit / book** (label: KI1 · Yǒngquán)
- H2: "Come and see us in *Jabi.*"
- Address (from content) · Map card (docs/02 §7) · hours · "Get directions" (Google Maps link) · **Book a visit** · "WhatsApp us" · "Call 0803 640 4321".

---

## About `/about`
- H1: "Care that starts with *listening.*"
- Lead: "Happyday Acupuncture is an acupuncture and Traditional Chinese Medicine clinic in Jabi, Abuja. We opened in 2024 to make these traditional therapies accessible, professional and personal."
- **Our story** (2 short paragraphs, written from the client's profile): "We were founded on a simple belief: everyone deserves attention, care and support on the way to better health. That means taking time to understand each person, assessing them properly, and recommending only what suits them. / Since 2024 we've built the clinic around traditional therapeutic practice, careful patient care, and relationships with the people and communities we serve."
- **Founder** block: portrait slot + name + qualification + bio (TODO_CLIENT).
- **Vision**, as a large Gambetta pull quote: "To become a trusted and recognised centre for acupuncture and Traditional Chinese Medicine, promoting holistic wellness, quality patient care and a better quality of life."
- **Mission**: "Our mission is accessible, professional, patient-centred care." followed by the six mission points as a hairline list (from `clinic.json`).
- **Values**: six rows, name in `display-s` and one line each (from `clinic.json`). **No icons, no cards.** On desktop, a 2-column hairline table.
- **Our commitment**: "We're grateful for the trust our patients place in us. We'll keep earning it with honest advice, professional care and respect for every person who walks through the door."
- CTA band: "Book a consultation" / WhatsApp.
- The full circular logo appears small here, as the "seal of the house", with the line "Health · Balance · Wellness".

## Treatments index `/treatments`
- H1: "Treatment areas"
- Lead: "Acupuncture and Traditional Chinese Medicine for the body and mind. Not sure where your problem fits? Start with a consultation and we'll tell you honestly what we think."
- The body map (compact variant) + the full typographic index (same component as home §3) + a "Not sure?" CTA card linking to `tcm-consultation`.

## Treatment detail `/treatments/:slug` (template, 10 pages)
1. Breadcrumb ("Treatments / Pain relief") + the acupoint label.
2. H1 = `name`. Lead = `intro`.
3. Colour photo (manifest `photo`, clip reveal), max width per the manifest.
4. "**What we can help with**": the conditions as a hairline list in 2 columns. Each item is plain text (no links in v1).
5. "**What to expect**" = `whatToExpect`. Below it, the four visit steps in compact form.
6. `safetyNote`, if present, in a bordered callout (1 px `cinnabar` left border; the text stays `ink`).
7. FAQs: the 3 most relevant general ones (hurt, how-many, medical).
8. The closing disclaimer (§0.4).
9. CTA panel (`forest-900`): "Book about [name lowercase]" → `/book?concern=<slug>` · "Ask privately on WhatsApp" (prefilled: "Hello, I'd like to ask about acupuncture for [name].")
10. "Other treatment areas": the 3 next treatments.
- SEO: `seo.title` + " | Happyday Acupuncture", `seo.description`, JSON-LD `MedicalWebPage` + `BreadcrumbList`.

## Your visit `/your-visit`
- H1: "Your visit, *explained.*"
- Lead: "Nervous about needles? Most people are, the first time. Here's exactly what happens, so there are no surprises."
- Sections: the four steps (full version) · Thinner than you think (needle scale) · **Hygiene & safety**: "Sterile, single-use, disposable needles, opened for you and safely disposed of after use. Clean linen for every patient." [CONFIRM] + the `sterile-needle-pack` photo · **Before you come** (wear, eat, bring) · **Fees** (from the API appointment types: name, duration, price. If the price is null, show "Fee confirmed when you book" and a WhatsApp link. Never show ₦0) · **Payment** (bank transfer explained; what happens after you pay) · **Cancellation** (policy from content) · the full FAQ accordion · CTA.
- JSON-LD `FAQPage`.

## Contact `/contact`
- H1: "Talk to us"
- Lead: "Questions before you book? Message us. We'd rather you ask than wonder."
- Three equal-weight rows (not cards): **WhatsApp** (fastest; "Usually replies within [TODO] hours") · **Call** · **Email** (if confirmed).
- **Inquiry form**: name, phone (Nigerian format, validated; accepts 080…, +234… and 234…), email (optional), "What's it about?" (select: a treatment area / booking question / other), message, preferred reply method (WhatsApp / call / email), and a consent checkbox ("I agree to Happyday Acupuncture using these details to reply to me. [Privacy policy]"). There's a honeypot field, and the submit has a minimum time-to-submit check. Success state: "Thank you. We'll be in touch soon." + "Want a faster answer? WhatsApp us."
- Map card + address + directions + hours.

## Booking `/book`
See docs/04 for the logic. Copy for each step:
1. "What's bothering you?" Chips for the 10 treatment areas plus "Not sure / general check". Prefilled from `?concern`. Optional notes: "Anything you'd like us to know? (optional)" with the helper text "Please don't include anything you'd rather tell us in person."
2. "Choose your appointment": cards for the types (name, summary, duration, price or "Fee confirmed on booking"). Preselect "First consultation" for new visitors, or "Follow-up" if `localStorage.returning = true`.
3. "Pick a time": a week strip (today + next 60 days, horizontally scrollable, with the month label sticky) and time chips grouped "Morning / Afternoon / Evening". Empty day: "No times left on this day. Try [next available day →]." Show the time zone line "Times are in Abuja time (WAT)" only if the browser's time zone isn't Africa/Lagos.
4. "Your details": full name, phone (required), email (optional, "for your confirmation and reminder"), "First time at Happyday?" yes/no, consent checkbox (health data + contact), and the honeypot.
5. "Pay & confirm", depending on `payments.mode`:
   - `transfer_deposit` / `transfer_full`: a summary card + "To hold your appointment, transfer **₦X** to:" with the bank name, account name and account number, each with a copy button (copied → a checkmark for 1.5 s). The reference to add to the transfer narration is the booking ref, e.g. **HD-7K3Q9** (with a copy button). A countdown: "We'll hold this time for 3 hours." Actions: **I've made the transfer** / "Send receipt on WhatsApp" (prefilled with the ref, date and time) / "Change something".
   - `pay_at_clinic`: "Pay at the clinic on the day." → **Confirm booking**.
6. Confirmation `/book/confirmed/:ref`: the seal stamps. H1: "You're booked in." (or "Request received." if awaiting payment, with copy explaining the next step). Details: date, time, type, address. Buttons: "Add to calendar" (.ics download + a Google Calendar link), "Get directions", "Message us on WhatsApp". Small: "Need to change it? Use the link we sent you, or WhatsApp us."

## Privacy `/privacy` and Terms `/terms`
Generate plain-English drafts that cover: who we are (legal name, address, contact); what we collect (contact details, booking details, optional notes about your concern); why (to provide care and to contact you); the legal basis (consent, and providing care); who sees it (clinic staff only, and service providers such as hosting and email under contract); how long we keep it (bookings and inquiries: 24 months, then anonymised. Configurable); your rights under the Nigeria Data Protection Act 2023 (access, correction, deletion, withdrawing consent, complaints to the Nigeria Data Protection Commission); security; and cookies (none for tracking unless analytics is added; the map loads only on click). Terms: the booking, payment, cancellation and no-show policy, the complementary-care disclaimer, and liability basics. **Put a banner at the top of both pages in development: "Draft. Have this reviewed by a Nigerian lawyer before launch."** It goes on the TODO list.

## 404
- The seal, then H1: "This page has wandered off the meridian."
- "Let's get you back." → Home · Treatments · Book.

## Admin copy
Plain and functional. Status labels: Awaiting payment · Payment sent · Confirmed · Completed · Cancelled · No-show · Expired.
