import { test, expect } from '@playwright/test';

test.describe('admin', () => {
  // The sign-in test changes the shared owner password, so it runs once, on desktop only.
  test('signs in, changes the forced password, and reaches Today', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'runs once');
    await page.goto('/admin');
    await page.getByLabel('Email').fill('owner@localhost.test');
    await page.getByLabel('Password', { exact: true }).fill('dev-owner-password-1');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('heading', { name: 'Set a new password' })).toBeVisible();
    await page.getByLabel('Current password').fill('dev-owner-password-1');
    await page.getByLabel('New password').fill('a-new-long-password-2');
    await page.getByRole('button', { name: 'Save new password' }).click();

    await expect(page.getByRole('navigation', { name: 'Admin sections' })).toBeVisible();
    await expect(page.getByText(/Needs checking/)).toBeVisible();
  });

  test('is not indexed', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
});
