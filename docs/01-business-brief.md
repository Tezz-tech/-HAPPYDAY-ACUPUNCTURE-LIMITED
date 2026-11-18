# 01: Business brief

## The business
| | |
|---|---|
| Registered name | Happyday Acupuncture Limited |
| What it is | Acupuncture & Traditional Chinese Medicine (TCM) clinic |
| Founded | 2024 |
| Founder / practitioner | Balogun Happyday Ojoayo: Diploma in Acupuncture and Moxibustion (Dip. Acupuncture) |
| Location | Oscar Apartments, Plot 245, Dakibiyu District, Jabi, Abuja (exact wording to be confirmed) |
| Phone / WhatsApp | 0803 640 4321 (+234 803 640 4321) |
| Payment | Bank transfer to First Bank, account name Balogun Happyday Ojoayo, account no. 3235012468 |
| Taglines | "Heal naturally… Live better." · "Health · Balance · Wellness" · Flyer: "Ancient wisdom… Modern care… Better living!" |
| Brand colours (from logo) | Deep green `#0B401D`, green `#2C6E30`, gold `#D9BA3F` |

The full facts are in `content/clinic.json`. The client's own long-form profile (history, vision, mission, values and commitment) is summarised there. Rewritten web copy is in docs/03.

## What the client asked for (scope)
- 5–8 professionally designed pages
- Company logo and brand colours
- Service and condition information
- Professional clinic photography (current photos are phone shots; see "Photos" below)
- An online appointment inquiry form, plus **WhatsApp booking**
- Online payment via the bank account above
- A mobile-friendly design
- Basic Google SEO setup
- Website security and hosting configuration
- Google Maps integration

## What we're building (a step beyond the request)
- **A real booking system**, not just an inquiry form. Patients choose an appointment type and see real available times. Their slot is held while they pay by transfer, and the clinic confirms it from the admin. WhatsApp is offered at every step for people who prefer to chat.
- **An admin dashboard** for bookings, payments, availability, closures, prices, inquiries and testimonials, so the client never needs a developer for routine changes.
- **An education-first design** that removes needle anxiety, the biggest barrier for first-timers.

## Who the visitors are
1. **The sceptical first-timer** (most common). They have heard of acupuncture, are scared of needles, and are not sure it's "real". They need reassurance, honesty and a clear picture of what happens. Usually on a phone.
2. **The person with a specific problem**: back pain, sciatica, numbness after a stroke, fertility, erectile dysfunction, insomnia. They search "acupuncture for X in Abuja". They need to land on a page about their problem, see that the clinic understands it, and book.
3. **The private patient**: fertility, men's health, women's health. They need discretion. They will often prefer WhatsApp to a form.
4. **The family member** booking for a parent after a stroke, or for a spouse.
5. **The returning patient**: they want to book a follow-up in under 30 seconds.

Context that shapes the design: Abuja, Nigeria. Mostly mobile. Data costs money, so pages must be light. WhatsApp is the default way people talk to businesses. Bank transfer is the normal way to pay. Trust markers that matter locally include a CAC registration number, a real address with a map, a real phone number, and a real person's name and face.

## What the competition looks like (research summary)
- **Locally (Abuja and Lagos):** almost no acupuncture clinic has a real website. They exist as directory listings and "call or WhatsApp to book" posts, with no online booking and no educational content. An excellent site with real booking puts Happyday ahead by default. The goal is to set a new bar for the field in Nigeria.
- **Internationally:** the best-known modern brand is WTHN (New York), which set out to make acupuncture feel modern, welcoming and less intimidating. It separates first-time and returning sessions (60 and 45 minutes) and explains clearly what happens. Most other clinic sites worldwide are Squarespace or Wix templates: clean, minimal, spa-like, with stock photos and an embedded third-party booking widget.
- **Where we go further than both:** (1) interactive education built for this field: a body map, a needle-size comparison and an acupoint "meridian" structure; (2) booking built into the brand rather than an iframe; (3) built for a Nigerian phone on a Nigerian network, with WhatsApp-first contact; (4) honest, careful medical language that builds trust instead of the flyer-style claims common locally.

## Photos: current state and brief for a shoot
The 7 photos supplied were sent over WhatsApp, so they are compressed to 750–960 px wide. They have been colour-corrected, denoised and cropped, and faces were blurred where visible (see `assets/photos/manifest.json`). They are usable at small to medium sizes and as duotones. They cannot carry a full-width hero. The design in docs/02 is built to work with them now and to get much better when real photography arrives.

**Ask the client for:**
1. **Original-resolution files.** On WhatsApp, send them as *Document*, not Photo, or share via Google Drive. The CAMON 40 Pro shoots far higher resolution than what was received.
2. **A short professional shoot (half a day), shot list:**
   - Founder portrait: environmental (in the treatment room, natural window light, relaxed, not a passport pose). Plus one tighter head-and-shoulders shot.
   - Hands at work: opening a sterile needle pack, placing a needle with a guide tube, taking a pulse at the wrist, looking at a tongue (patient's face out of frame).
   - The room: an empty, made-up treatment bed with blinds half open; the reception or waiting area; the building entrance and signage (helps people find it).
   - Details: needle packs, the sharps bin, moxa if used, towels, a glass of water. Calm still-life.
   - Ideally landscape plus portrait for each, shot at the camera's full resolution, with no patient faces unless there is written consent.
3. **Written consent** from every patient whose body appears on the site, even with the face blurred. This is a Nigeria Data Protection Act consideration.

## Open questions for the client (also generated into `TODO_CLIENT.md`)
1. Prices and durations for each appointment type. Is payment taken upfront in full, as a deposit, or at the clinic?
2. Opening days and hours. How many patients can be treated at the same time (several beds appear in the photos)?
3. Official email address, ideally on the website domain.
4. Social media links.
5. Exact address wording and a Google Maps pin ("Oscar Apartments, Dakibiyu, Jabi" on the flyer vs "Plot 245 Dakibiyiu District" in the profile). A landmark sentence for directions.
6. CAC RC number, for the footer.
7. A bank account in the company name? The current account is in the founder's personal name. A company account looks more trustworthy at checkout.
8. Founder bio (80–120 words), where and when the diploma was obtained, any professional memberships (list only real ones), and how the founder would like to be introduced.
9. Which other TCM services are offered: moxibustion, cupping, electro-acupuncture, herbal medicine, ear seeds.
10. The original logo file (AI, SVG, PDF or a large PNG). Otherwise approve the cleaned-up version in `assets/brand/` (see docs/02 §3).
11. Cancellation and rescheduling policy.
12. Domain name (suggest `happydayacupuncture.com`, and also buy `.com.ng` to redirect).
13. Real testimonials, with each patient's written permission and the first name or initials they want shown.
