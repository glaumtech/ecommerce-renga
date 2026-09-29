import { expect, test } from '@playwright/test';

test.describe('full stack smoke (requires backend e2e + ng serve)', () => {
  test('home page hero is visible', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: /Pooja Essentials, Brassware/i,
      })
    ).toBeVisible();
  });

  test('shop page shows collection and seeded product', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.getByRole('heading', { name: 'Our Collection' })).toBeVisible();
    await expect(page.getByText('E2E Brass Lamp')).toBeVisible({ timeout: 15_000 });
  });
});
