// Fails the build if the prerendered HTML contains banned copy (CLAUDE.md "Anti-generic rules"),
// medical over-claims (docs/03 §0), or more than one em dash on a page.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(root, 'web', 'build', 'client');

const BANNED = [
  'elevate',
  'unlock',
  'journey',
  'seamless',
  'empower',
  'transform',
  'holistic solutions',
  'discover the power',
  'cutting-edge',
  'state-of-the-art',
  'your wellness journey',
  'lorem ipsum',
  'trusted by',
  'guaranteed',
  '100%',
  'permanent',
  'cure',
  'cures',
  'treat infertility',
  'emoji',
  'no pain',
  'study shows',
  'studies show',
  'clinically proven',
];

/** Phrases that are allowed even though they contain a banned substring. */
const ALLOWED = [/acupuncture (can|may) (help|support)/i];

/**
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

async function main() {
  let failures = 0;
  let files;
  try {
    files = await htmlFiles(buildDir);
  } catch {
    console.log('lint-copy: no build output yet, skipping');
    return;
  }

  for (const file of files) {
    const html = await readFile(file, 'utf8');
    // Visible text only: drop scripts, styles and tags.
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z#0-9]+;/gi, ' ');
    const lower = text.toLowerCase();
    const rel = path.relative(root, file);

    for (const word of BANNED) {
      const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      let m;
      while ((m = re.exec(lower))) {
        const context = lower.slice(Math.max(0, m.index - 30), m.index + word.length + 30);
        if (ALLOWED.some((a) => a.test(context))) continue;
        console.error(`${rel}: banned copy "${word}" near "...${context.trim()}..."`);
        failures += 1;
      }
    }

    const emDashes = (text.match(/—/g) || []).length;
    if (emDashes > 1) {
      console.error(`${rel}: ${emDashes} em dashes (max 1 per page)`);
      failures += 1;
    }
  }

  if (failures > 0) {
    console.error(`lint-copy: ${failures} problem(s)`);
    process.exit(1);
  }
  console.log(`lint-copy: ${files.length} page(s) clean`);
}

main();
