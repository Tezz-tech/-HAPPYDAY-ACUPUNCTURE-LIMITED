// Captures every route at 390, 768 and 1440 px, plus 390 px with reduced motion (docs/06, /design-qa).
// Usage: npm run screenshots   (expects the dev server or a preview on BASE_URL)
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'screenshots');
const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const ROUTES = (process.env.ROUTES ?? '/,/about,/treatments,/treatments/pain-relief,/your-visit,/contact').split(',');
const WIDTHS = [390, 768, 1440];

async function main() {
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch();
  for (const route of ROUTES) {
    const name = route === '/' ? 'home' : route.replace(/^\//, '').replaceAll('/', '-');
    for (const width of WIDTHS) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
      // Scroll through the page so scroll-triggered reveals settle, then wait 1.5 s (docs/06 /design-qa).
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(out, `${name}-${width}.png`), fullPage: true });
      await page.close();
    }
    const motion = await browser.newPage({ viewport: { width: 390, height: 900 }, reducedMotion: 'reduce' });
    await motion.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await motion.waitForTimeout(800);
    await motion.screenshot({ path: path.join(out, `${name}-390-reduced-motion.png`), fullPage: true });
    await motion.close();
  }
  await browser.close();
  console.log(`screenshots written to ${path.relative(root, out)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
