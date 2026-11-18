import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('home page', () => {
  test('renders one H1 with the approved copy and no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('Heal naturally.');
    expect(errors).toEqual([]);
  });

  test('the body map list selects a region and shows its conditions', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Back & hips' }).click();
    await expect(page.getByRole('button', { name: 'Back & hips' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.region-conditions')).toContainText('Sciatica');
  });

  test('the accordion opens one answer at a time', async ({ page }) => {
    await page.goto('/');
    const first = page.getByRole('button', { name: 'Does acupuncture hurt?' });
    // Centre the button first, so the fixed mobile action bar cannot sit over it.
    await first.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    const second = page.getByRole('button', { name: 'Are the needles clean?' });
    await second.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await second.click();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  test('has no serious axe violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Scan only after the hero intro has finished, so faded-in text is not measured mid-animation.
    await expect(page.locator('.hero-facts')).toHaveCSS('opacity', '1');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    expect(serious, serious.map((v) => `${v.id}: ${v.help}`).join('\n')).toEqual([]);
  });

  test('does not scroll horizontally at 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
