// Subsets the raw Fontshare OTFs in web/public/fonts/raw to woff2.
// Character set: Basic Latin, Latin-1, Latin Extended-A/B (covers Nigerian names
// and the pinyin tone marks), general punctuation, arrows used in copy, and ₦.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const here = path.dirname(fileURLToPath(import.meta.url));
const raw = path.resolve(here, '../public/fonts/raw');
const out = path.resolve(here, '../public/fonts');

const ranges = [
  [0x20, 0x7e], // Basic Latin
  [0xa0, 0xff], // Latin-1
  [0x100, 0x24f], // Latin Extended-A and B (ǎ ǐ ǒ ǔ ǚ ǜ and the rest of pinyin)
  [0x2010, 0x2027], // dashes, quotes, bullet, ellipsis
  [0x2030, 0x203a], // per mille, primes, guillemets
  [0x2190, 0x2193], // arrows (→ used in copy)
  [0x20a6, 0x20a6], // ₦ naira sign
  [0x2122, 0x2122], // trademark (harmless)
  [0x2212, 0x2212], // minus sign
  [0x2248, 0x2248], // approximately (e.g. "≈ 0.25 mm")
  [0x00d7, 0x00d7], // multiplication sign (40×)
];

const text = ranges
  .flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i)))
  .join('');

const jobs = [
  ['Gambetta-Regular.otf', 'gambetta-400.woff2'],
  ['Gambetta-Italic.otf', 'gambetta-400-italic.woff2'],
  ['Gambetta-Medium.otf', 'gambetta-500.woff2'],
  ['Switzer-Regular.otf', 'switzer-400.woff2'],
  ['Switzer-Medium.otf', 'switzer-500.woff2'],
  ['Switzer-Semibold.otf', 'switzer-600.woff2'],
];

await mkdir(out, { recursive: true });
let total = 0;
for (const [src, dest] of jobs) {
  const from = path.join(raw, src);
  if (!existsSync(from))
    throw new Error(`Missing raw font ${from}. Download Fontshare zips into web/public/fonts/raw first.`);
  const buf = await readFile(from);
  const sub = await subsetFont(buf, text, { targetFormat: 'woff2' });
  await writeFile(path.join(out, dest), sub);
  total += sub.length;
  console.log(`${dest}: ${(sub.length / 1024).toFixed(1)} KB`);
}
console.log(`total: ${(total / 1024).toFixed(1)} KB`);
