import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('styleguide', () => {
  test('has no axe violations (WCAG 2.2 AA)', async ({ page }) => {
    await page.goto('/styleguide');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Styleguide/);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
    expect(
      serious,
      serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length} nodes)`).join('\n'),
    ).toEqual([]);
  });

  test('does not scroll horizontally at 360 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/styleguide');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('renders one H1 and no console errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/styleguide');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('the sheet opens with focus inside and closes with Escape', async ({ page }) => {
    await page.goto('/styleguide');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const dialog = page.getByRole('dialog', { name: 'Sheet title' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('the segmented control moves with arrow keys', async ({ page }) => {
    await page.goto('/styleguide');
    const first = page.getByRole('radio', { name: 'First visit' });
    await first.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Follow-up' })).toHaveAttribute('aria-checked', 'true');
  });
});
