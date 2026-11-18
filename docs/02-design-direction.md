# 02: Design direction

## 1. The idea: "Points and channels"
Acupuncture is about **fine lines meeting precise points**. A needle is a hairline with a tiny head, and meridians are channels that connect points across the body. The whole visual language comes from that single idea:

- **Hairlines** (1 px rules, needle-thin strokes) give the structure, in place of boxes and cards.
- **Points** (small solid circles) mark moments: section markers, the active state, progress, the map pin.
- **A meridian**: one continuous line that runs through each page and draws itself as you scroll, connecting the sections like acupoints on a channel.
- **Stillness and space.** The feeling is a quiet, bright treatment room, not a spa and not a hospital. Generous whitespace, slow confident motion, nothing shouting.

Mood words: **calm, precise, warm, honest, grounded.** Avoid: mystical, spa-pastel, clinical-blue, "Zen" clichés, bamboo, lotus, stones (all over the client's flyer; we deliberately leave them behind).

Reference feel: editorial print design, such as a well-set health magazine or a museum catalogue, crossed with a premium Japanese product site's restraint. Typography and spacing carry the luxury; decoration doesn't.

## 2. Colour tokens
These come from the logo (deep green + gold) and are refined for the screen. Contrast ratios were measured against `paper`.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `ink` | `#10241A` | Body text, headlines | 14.2 on paper |
| `forest-900` | `#0B2A1A` | Dark sections, footer, booking summary panel | paper text 13.5 |
| `forest-700` | `#0B401D` | **Logo green.** Primary buttons, display headlines on light | 10.4 |
| `forest-500` | `#2C6E30` | Logo mid green. Links, hover states, active points | 5.4 |
| `jade-300` | `#9DB8A4` | Secondary text and hairlines on dark | 7.2 on forest-900 |
| `gold-400` | `#D9BA3F` | **Logo gold.** Needle heads, points, the meridian line. Decorative on light; text only on dark | 8.1 on forest-900, 1.7 on paper (never as text on paper) |
| `gold-700` | `#7A5C17` | Small gold-ish text on light, if ever needed (check it is ≥ 4.5:1) | ~5 |
| `stone-600` | `#5B6660` | Secondary text on light | 5.2 |
| `paper` | `#F4EFE6` | Main background (warm rice paper) | n/a |
| `bone` | `#FBF8F2` | Raised surfaces, inputs, the slot picker | n/a |
| `line` | `rgb(16 36 26 / 0.12)` | Hairlines on light | n/a |
| `line-dark` | `rgb(244 239 230 / 0.14)` | Hairlines on dark | n/a |
| `cinnabar` | `#B5432F` | **Used only for the seal mark** (§5.6) and error states. Never decorative elsewhere | 4.8 |

Rhythm: pages are mostly `paper`, with **one or two `forest-900` sections per page** for depth (for example, the needle-scale section and the footer). Gold is precious: if it appears on more than about 5% of a screen, there's too much.

Add a paper grain over `paper` and `forest-900`: an inline SVG `feTurbulence` noise as a fixed `::before` layer at 3–4% opacity, `pointer-events: none`. It must not repaint on scroll.

## 3. Logo usage
- `assets/brand/logo-full-traced.svg` and `logo-emblem-traced.svg` are vector traces of the client's 270 px JPEG logo. Use them in the **footer, the About page and the OG images**, at a maximum display width of 200 px; the trace is not crisp enough for larger. Replace them when the original file arrives.
- `assets/brand/mark-*.svg` is a **simplified geometric mark** redrawn from the logo's own elements (five gold needles over a yin-yang). It is for small sizes: the header, favicon, loading states and the booking confirmation. In the header, pair the mark with a **wordmark set in the display font**: "Happyday" in `Gambetta 500` + "ACUPUNCTURE" in Switzer, 11 px, tracking 0.18em, below it. Build this as `<Logo variant="horizontal|stacked" tone="light|dark" />`.
- Never place the full circular logo in the header, and never stretch, recolour or put it on a busy image.
- The simplified mark needs client sign-off (it goes on the TODO list).

## 4. Typography
Self-host both families from **Fontshare** (ITF Free Font License, free for commercial use). Subset to Latin + Latin Extended (for ₦ and Nigerian names), use `woff2` with `font-display: swap`, and preload only the two weights used above the fold.

- **Display: Gambetta** (weights 400, 500, plus italic 400). A refined transitional serif with sharp, calligraphic details; it echoes brushwork without being a "Chinese-style" novelty font.
- **Text and UI: Switzer** (400, 500, 600). A neutral, warm grotesk with more character than Inter.
- **Pinyin and acupoint labels:** Switzer 500, small caps via `font-variant-caps: all-small-caps`, tracking 0.06em. Pinyin tone marks (ǎ, ī, ù and so on) must render; test "Zúsānlǐ" and "Sānyīnjiāo".
- **Chinese characters:** appear only in the seal mark (针灸, "zhēnjiǔ", the Chinese term for acupuncture-and-moxibustion, which matches the founder's diploma). Draw them as SVG paths so no CJK font needs to load.

Fluid type scale (use `clamp`, min at 360 px, max at 1440 px):
| Token | Min → Max | Font | Notes |
|---|---|---|---|
| `display-xl` | 52 → 128 px | Gambetta 400, lh 0.95, tracking -0.025em | Home H1 only |
| `display-l` | 40 → 88 px | Gambetta 400, lh 1.0, tracking -0.02em | Page H1s |
| `display-m` | 32 → 56 px | Gambetta 400, lh 1.05 | Section H2s |
| `display-s` | 24 → 32 px | Gambetta 500, lh 1.15 | H3, treatment names |
| `lead` | 18 → 22 px | Switzer 400, lh 1.5 | Intro paragraphs, max 34ch |
| `body` | 16 → 17 px | Switzer 400, lh 1.6 | Max 64ch |
| `small` | 14 px | Switzer 400/500 | |
| `label` | 12 px | Switzer 500, all-small-caps, tracking 0.08em | Section labels, acupoint codes |

Use italics in Gambetta for single emphasised words inside headlines, e.g. "Pain that won't *settle*". At most once per headline, and not on every headline.

## 5. Layout, structure and signature elements

### 5.1 Grid and spacing
- 12-column grid, max content width 1360 px, gutters `clamp(20px, 4vw, 48px)`.
- Section vertical padding: `clamp(88px, 12vw, 192px)`.
- **Asymmetry is the default.** Headlines sit on columns 1–8 and body text on 7–12 (or the reverse). Avoid centring blocks of text except in the booking flow and confirmations.
- Structure comes from **hairline rules**: full-bleed 1 px `line` rules between sections, with a label on the rule ("ST36 · Zúsānlǐ · Digestive health").
- Radius tokens: `r-0` (images: square corners), `r-sm` 4 px (buttons, inputs, chips), `r-md` 10 px (sheets and the booking panel). No other radii.
- Shadow: only one, for floating UI (the mobile action bar and popovers): `0 8px 30px rgb(11 42 26 / 0.12)`.

### 5.2 The meridian and acupoint section markers
- Each long page (home, treatment detail, your-visit) has **one SVG path** in a fixed left gutter: x = gutter/2 on desktop, 14 px from the left edge on mobile. It runs the full page height with gentle bends at section boundaries, like a channel. Stroke 1 px, `gold-400` at 70% opacity, drawn with `DrawSVG` scrubbed to scroll progress (`scrub: 0.6`).
- At each section start there is a **point**: an 8 px gold circle on the line with a 1 px ring that expands and fades once (600 ms) when the section reaches 60% of the viewport. Next to the point sits the section label in `label` style: the **acupoint code and pinyin** (from `content/treatments.json`, or chosen for generic sections: GV20 Bǎihuì for the hero, PC6 Nèiguān for "Your first visit", LI4 Hégǔ for the practitioner, KI1 Yǒngquán for the contact section). This replaces the "01 / 02 / 03" numbering cliché with something that belongs to this field. Add a tooltip or footnote on hover: "Section markers are named after classical acupoints." The practitioner should approve the list.
- Reduced motion: the line is drawn fully on load and the points are static.

### 5.3 Signature interaction 1: the needle field (home hero)
A `<canvas>` occupying the hero's right 5–6 columns on desktop (full width behind the headline on mobile, at 35% opacity):
- A loose grid (jittered Poisson-disc spacing) of **fine needles**, each a 1 px line 28–44 px long with a 2.5 px round head. About 140 needles on desktop and 70 on mobile, scaled to the area.
- Idle: each needle sways slightly (±2°) on its own slow phase from a simplex noise field. It should feel like breath, not wind.
- Pointer: needles within 160 px **lean toward the cursor**, using a spring with stiffness 120 and damping 14, and their heads warm from `jade-300` to `gold-400` by proximity. Leaving releases them back with a soft overshoot.
- Touch (no hover): a tap sends a slow ripple outward through the field; one ambient ripple plays every 8 s when idle.
- On scroll out, the field's opacity and needle length shrink with scroll progress. Pause the rAF loop when it is off-screen (IntersectionObserver) or when the tab is hidden.
- Draw on a DPR-aware canvas (cap DPR at 2) in one batched path per colour band. It must hold 60 fps on a mid-range Android; measure it.
- It is decorative (`aria-hidden="true"`). Reduced motion: render one static frame.
- Lazy-init after first paint (`requestIdleCallback`) so it never affects LCP. The H1 is the LCP element.

### 5.4 Signature interaction 2: "Where does it hurt?" body map
- An original **line-art human figure** (front and back views, gender-neutral, drawn in 1.25 px `ink` strokes, with simple proportions and no facial features). Author it as an SVG with a `<g id>` per region matching `content/body-map.json`.
- Desktop: the figure sits on the left at 5 columns and the panel on the right. Mobile: the figure is on top (max 340 px tall) and the panel slides up below it.
- Hovering or focusing a region fills it with `forest-500` at 10% and outlines it in `forest-500`. Selecting it plays a **needle-drop**: a 1 px gold line descends onto the region's centre point, and the point ripples. The panel cross-fades to that region's conditions (staggered list, 40 ms) and shows links to the matching treatment pages, plus a primary "Book about this" button that goes to `/book?concern=<region>`.
- There is a "Front / Back" toggle (a segmented control) with a 3D-free flip: the figure squashes horizontally to 0 and expands back over 380 ms.
- A "Whole body & mind" chip sits below the figure, and "Not sure? Start with an assessment" is the fallback link.
- **Accessibility:** regions are `<button>` elements within the SVG (or invisible buttons overlaid). Below the figure is a visually simple list of all regions as buttons, so keyboard and screen-reader users get the same function. Use `aria-pressed` and `aria-controls` with a live region on the panel.

### 5.5 Signature interaction 3: "Thinner than you think" needle scale
A `forest-900` section on the home page and `/your-visit`. It exists to remove the fear of needles.
- Three horizontal bars, drawn to true relative scale and labelled:
  - Human hair: about 0.07 mm
  - Acupuncture needle: about 0.25 mm, solid (typical needles are 0.16–0.30 mm)
  - Injection needle (21G): about 0.8 mm, hollow
- Show each bar's cross-section as a circle beside it: solid for the acupuncture needle, a ring for the injection needle, so the hollow-versus-solid difference is visible.
- On scroll-in, the bars grow from 0 to their width (staggered 120 ms), and the mm values count up (tabular numerals).
- A "Magnify 40×" toggle scales the bars, with labels repositioning smoothly (motion layout).
- Copy: see docs/03, home §5. Label the figures "typical" in a footnote. They are approximate, not medical specifications.

### 5.6 The seal
A small square **cinnabar seal** with 针灸 in white (SVG paths), slightly irregular edges, like a carved stone chop. It appears in three places only:
1. The footer, next to the legal name.
2. The booking confirmation screen. There it **stamps** onto the summary: scale 1.15 → 1, rotate -6° → -3°, with a quick ink-spread (an SVG turbulence displacement settling to 0) over 520 ms and a faint paper "press" shadow. This is the emotional moment when the booking is done.
3. The 404 page.
Never use it as decoration elsewhere. Rarity is what makes it feel crafted.

### 5.7 Photography treatment
- Every image has an `aspect-ratio` and a blurred LQIP (a 16 px placeholder, inlined as base64 at build time) and uses `<picture>` with AVIF → WebP → JPG. Never display wider than `maxDisplayWidthCss` from `assets/photos/manifest.json`.
- **Duotone first.** Section imagery uses the `-duotone` versions (ink → paper), which unifies the inconsistent phone photos into one art-directed set and hides the softness of the compressed files. Colour versions appear on the treatment detail pages and in the "Inside the clinic" strip, where they cross-fade from duotone to colour as they enter the viewport centre.
- Images enter with a **clip reveal**: `clip-path: inset(100% 0 0 0)` → `inset(0)` over 900 ms `ease-out-expo`, while the image scales 1.08 → 1. Do this once per image, without scrubbing.
- Crops are tight and graphic. The best image is `detail/abdomen-ring` (eight needles radiating from a point), which echoes the five-needle logo. Use it as the home "brand moment" next to the practitioner intro, framed small (max 420 px) with generous space.
- Leave a reserved, designed **portrait slot** for the founder on the home and about pages. Until the portrait arrives, show the `mark-on-dark` on `forest-900` with the caption "Portrait coming soon". Never use a stock face.

## 6. Motion system
Motion should feel like a practitioner's hands: **unhurried, exact, and never fussy.**

Tokens:
- Durations: `t-1` 160 ms (hovers), `t-2` 260 ms (UI state), `t-3` 420 ms (panels), `t-4` 700 ms (section reveals), `t-5` 1100 ms (hero intro).
- Easing: `ease-out-expo` = `cubic-bezier(0.16, 1, 0.3, 1)` for things arriving; `ease-in-out-quart` = `cubic-bezier(0.76, 0, 0.24, 1)` for transitions and page changes; springs (motion) for physical UI: `{ stiffness: 260, damping: 30 }`.
- Stagger: 60 ms for lines of text, 40 ms for list items.

Choreography (each one is specific; nothing is "fade up everything"):
- **Hero intro (once per session):** the paper grain is present from the first frame, so there's no flash. The H1 splits into lines (SplitText `type: "lines"`, `mask: "lines"`), and each line rises 110% → 0 over `t-5` with a 90 ms stagger. The lead paragraph fades in at +350 ms. The CTAs come in at +500 ms. The needle field fades in at +200 ms, its needles "growing" from length 0 over 900 ms in a diagonal wave. The total stays under 1.6 s, and nothing blocks interaction.
- **Section headings:** line-mask reveal as above but quicker (`t-4`), triggered at 80% of the viewport. Body text gets an opacity-only fade (no translate) at +120 ms.
- **Treatment index (home and /treatments):** a typographic list of 10 rows. Each row is a hairline-separated full-width row with the acupoint label on the left, the name in `display-s` and the short line beside it. On hover (fine pointer), the row's background tints slightly, an arrow slides 8 px, and a **cursor-following image preview** (the duotone treatment photo, 220 px, `r-0`) eases toward the pointer with a lerp of 0.12, tilted ±3° by velocity. On touch, rows simply link through; no previews.
- **Your first visit (4 steps):** a horizontal sequence on desktop, pinned for 150 vh of scroll with ScrollTrigger: the meridian line runs across through four points while each step's text cross-fades. On mobile it becomes a vertical timeline (not pinned). The line draws down, and each step reveals as its point is reached.
- **Buttons:** primary buttons fill `forest-700`. On hover, a `forest-500` fill sweeps from left to right underneath the label (clip-path) over `t-2`. A subtle magnetic pull (max 6 px) applies only to the hero's primary CTA. Press: scale 0.98.
- **Links:** a 1 px underline that draws left to right on hover and retracts right to left on leave.
- **Page transitions:** use the View Transitions API via React Router's `viewTransition` on `<Link>`. The old page fades out and moves up 12 px; the new page fades in. Persistent elements (the header logo, the mobile action bar) carry `view-transition-name` so they stay put. Fall back to an instant change.
- **Header:** transparent over the hero, then turns `paper` at 92% opacity with backdrop blur 8 px and a hairline bottom once scrolled 40 px. It hides when scrolling down quickly and returns when scrolling up.
- **Mobile action bar:** fixed at the bottom on phones, after the hero leaves the viewport. "Book a visit" (primary) + a WhatsApp icon button + a phone icon button. It slides up on a spring and respects `env(safe-area-inset-bottom)`.
- **Smooth scrolling:** Lenis on `(pointer: fine)` only, `lerp: 0.1`. Disable it on `/admin` and `/book` (forms need native scroll behaviour) and with reduced motion.

Reduced motion (`prefers-reduced-motion: reduce`): every reveal becomes a 200 ms opacity fade. Nothing is pinned. The needle field is static, the meridian is fully drawn, the seal appears without the stamp, and Lenis is off. The result must still look intentional; test it with screenshots.

## 7. Components (visual spec, short)
- **Button:** `primary` (forest-700 fill, paper text), `secondary` (1 px ink outline), `ghost` (text + underline animation), `whatsapp` (secondary style with the official WhatsApp glyph in `forest-700`; do not use WhatsApp green, which clashes). Height 48 px (52 px on mobile CTAs), padding 22 px, `r-sm`, Switzer 500 at 15 px.
- **Inputs:** `bone` background, 1 px `line` border, 52 px tall, a floating label that moves to the top on focus or when filled, and a focus ring of 2 px `forest-500` offset 2 px. Errors appear as cinnabar text below with an icon and `aria-describedby`.
- **Chips (time slots):** 44 px tall, `bone` with a hairline. Selected: `forest-700` fill with a gold point at the left. Unavailable slots are not shown; never show greyed-out unavailable times, because they read as "fully booked" and reduce trust.
- **Accordion (FAQ):** hairline rows; a plus icon rotates to a cross; height animates with motion `layout`.
- **Map:** a static, styled map image (generated from the coordinates, or a designed SVG "you are here" card) with a "Load interactive map" button, which then swaps in the Google Maps iframe. This avoids about 500 KB and third-party cookies on load, and works as consent.

## 8. Voice
Warm, direct and plain. Talk to the person, not about "patients". Use short sentences and British English. Confident without overclaiming, so say "can help" and "support" and never promise results. Be honest that acupuncture sits alongside medical care. Treat needle anxiety and private conditions with gentleness and a little humour where it helps ("Most people are surprised. Some fall asleep."). Never write wellness-influencer copy.
