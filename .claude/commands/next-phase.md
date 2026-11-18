---
description: Continue the build with the next unfinished phase from docs/06
---
1. Read `PROGRESS.md` and `docs/06-build-plan.md`. Identify the next unfinished phase. $ARGUMENTS (optional: a phase number to force)
2. Re-read the docs sections that phase depends on, before writing code.
3. Implement the phase completely. Run its acceptance checks, and fix failures until they pass.
4. For any UI phase, run the `/design-qa` steps before you call it done.
5. Update `PROGRESS.md` (done / decisions / next) and regenerate `TODO_CLIENT.md`, then commit with `phase-N: <summary>`.
6. Report back in five lines or fewer: what was built, check results, and anything that needs the user's or client's input.
