import { test, expect } from '@playwright/test';

test.describe('booking flow', () => {
  test('from the body map to a transfer and a confirmation with a reference', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Back & hips' }).click();
    await page.getByRole('link', { name: 'Book about this' }).click();
    await expect(page).toHaveURL(/\/book\?concern=back-hips/);

    // Step 1: the concern. The chip is clicked to move on.
    await page.getByRole('button', { name: 'Pain relief', exact: true }).click();

    // Step 2: a short appointment, so the test is quick and does not depend on the clinic's prices.
    await page.getByRole('button', { name: /Consultation & assessment only/ }).click();

    // Step 3: the first available time.
    const firstTime = page.locator('.period-group .chip').first();
    await expect(firstTime).toBeVisible({ timeout: 20_000 });
    await firstTime.click();

    // Step 4: details. The honeypot needs more than three seconds on the form, so wait before submitting.
    await page.getByLabel('Full name').fill('Playwright Test');
    await page.getByLabel('Phone number').fill('0803 640 4321');
    await page.getByLabel(/I agree to Happyday Acupuncture/).check();
    await page.waitForTimeout(3200);
    await page.getByRole('button', { name: 'Continue to payment' }).click();

    // Step 5: pay. The reference is shown for the narration, and the transfer is reported.
    await expect(page.getByText('Add this reference to the transfer narration')).toBeVisible();
    await page.getByRole('button', { name: 'I have made the transfer' }).click();

    await expect(page).toHaveURL(/\/book\/confirmed\/HD-[A-Z0-9]{5}\?t=/);
    await expect(page.getByRole('heading', { name: 'Request received.' })).toBeVisible();
    await expect(page.getByText(/HD-[A-Z0-9]{5}/).first()).toBeVisible();
  });
});
