import { expect, test } from '@playwright/test';

const apiBase = process.env.E2E_API_URL ?? 'http://localhost:8081';

test.describe('storefront API coupling', () => {
  test('seeded products are served from mock backend', async ({ request }) => {
    const response = await request.get(`${apiBase}/api/store/products`);
    expect(response.ok()).toBeTruthy();
    const body = await response.text();
    expect(body).toContain('E2E Brass Lamp');
    expect(body).toContain('e2e-brass-lamp');
  });

  test('categories API returns category trees from mock backend', async ({ request }) => {
    const response = await request.get(`${apiBase}/api/store/categories`);
    expect(response.ok()).toBeTruthy();
    const categories = (await response.json()) as Array<{ subCategories?: unknown[] }>;
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((c) => Array.isArray(c.subCategories) && c.subCategories.length > 0)).toBe(
      true
    );
  });
});
