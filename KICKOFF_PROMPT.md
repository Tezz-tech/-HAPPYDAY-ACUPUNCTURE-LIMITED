Paste everything below the line into Claude Code, from inside this folder.

---

You're building the website and booking system for Happyday Acupuncture Limited, an acupuncture and TCM clinic in Abuja. Everything you need is in this folder.

1. Read `CLAUDE.md`, then every file in `docs/` in order, then everything in `content/` and `assets/photos/manifest.json`. Look at the photos in `assets/photos/` and the brand files in `assets/brand/`, and treat `assets/reference/` as reference only.
2. Before writing any code, reply with:
   - a 10-line summary of the product as you understand it;
   - the riskiest technical parts and how you'll de-risk them (expected: the slot engine and seat locks, prerendering with React Router v7, the needle field's performance on low-end Android, and font subsetting);
   - any contradictions you found in the docs.
   Then continue immediately. Don't wait for approval unless something is truly ambiguous and expensive to undo.
3. Set up git (`git init`, `.gitignore` for node_modules, env files, build output and screenshots) and create `PROGRESS.md`.
4. Execute `docs/06-build-plan.md` from Phase 0 through Phase 7, in order. Use `/next-phase` as your loop. After each phase, run its acceptance checks, run `/design-qa` for UI phases, and commit.
5. Never invent business facts, prices, testimonials or credentials. Use the documented fallbacks and log every gap in `TODO_CLIENT.md`.
6. The bar: when the client opens this on their phone, they should feel that a senior product team built it. Calm, precise, fast and honest. If something you've built looks like a template, it isn't done.

Start now.
