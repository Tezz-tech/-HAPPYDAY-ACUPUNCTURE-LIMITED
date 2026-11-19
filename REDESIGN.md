# Redesign note (2026)

The first design followed docs/02, which asked for a needle field, a meridian line, acupoint markers and a line-art body map. Reviewers found it dated and hard to read, and the pins and the map did not do anything clear. The public pages were rebuilt with a simpler direction.

## What changed
- **One typeface** (Switzer) for everything. Serif display type is gone.
- **Photos first.** The clinic photographs from `assets/photos/full` are used in a gallery and on the home hero. They are shown at a fixed 4:5 frame, in colour, with no captions.
- **Removed:** the needle field, the meridian, the acupoint markers, the body map, the needle-scale animation, the paper grain, the cursor previews, and the GSAP and Lenis dependencies on public pages.
- **Map** embeds directly on the home and contact pages (lazy-loaded by the browser, no click needed).
- **Footer** is a four-column layout on dark green.

## Still open
- The docs/02 brief is client-owned and has not been edited. This note supersedes it for the public pages until the client signs it off.
- Stock photography of other people has not been added. CLAUDE.md bans stock photos. If the client wants photos of other people, they should supply them, or approve a licensed source.
- Founder portrait is still the "Portrait coming soon" placeholder.
