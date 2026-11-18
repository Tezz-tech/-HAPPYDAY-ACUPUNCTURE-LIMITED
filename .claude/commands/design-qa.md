---
description: Screenshot every route and critique it against the design direction like a demanding art director
---
Run a design QA pass. $ARGUMENTS (optional: limit to specific routes)

1. Run `npm run build`, then `npm run screenshots`. It captures every route at 390, 768 and 1440 px, plus 390 px with `prefers-reduced-motion: reduce`. Capture after animations settle: scroll through the page first, wait 1.5 s, then take the full-page shot.
2. Open and look at every screenshot yourself. For each route, write findings into `/screenshots/QA.md` under these headings:
   - **Generic-AI tells:** any banned pattern from CLAUDE.md (card grids, centred hero + pill, icon sprinkles, gradients, default fonts or colours, uniform spacing, banned words). Each one is a blocker.
   - **Typography:** hierarchy, line lengths (body ≤ 64ch), rag, widows and orphans in headlines (fix them with `text-wrap: balance` and `pretty`), italics overuse, sizes against the docs/02 §4 scale.
   - **Layout and rhythm:** asymmetry used deliberately? Consistent section spacing? Hairlines aligned to the grid? Anything floating or misaligned by a few pixels?
   - **Colour:** gold overuse (more than about 5% of the screen), contrast, the dark-section rhythm (1–2 per page).
   - **Imagery:** any image displayed above its `maxDisplayWidthCss`? Soft or pixelated? Crops intentional?
   - **Mobile:** thumb reach of the CTAs, the action bar overlapping content, 44 px targets, horizontal overflow.
   - **Reduced motion:** does it still look finished?
3. Score each route from 1 to 10 against the bar: "a top design studio would put this in their portfolio". Anything below 8 needs fixes.
4. Fix every blocker and every item on routes scoring below 8, then re-run steps 1–3 once. Summarise what changed in `PROGRESS.md`.
