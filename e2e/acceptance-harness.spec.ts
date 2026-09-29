import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..');
const e2eDir = path.join(projectRoot, 'e2e');

test.describe('acceptance harness (spec presence and smoke contracts)', () => {
  test('storefront-api spec covers products, categories, and google reviews', () => {
    const source = fs.readFileSync(path.join(e2eDir, 'storefront-api.spec.ts'), 'utf8');
    expect(source).toContain('E2E Brass Lamp');
    expect(source).toContain('e2e-brass-lamp');
    expect(source).toContain('/api/store/categories');
    expect(source).toContain('subCategories');
    expect(source).toContain('/api/store/google-reviews');
    expect(source).toContain('maps.app.goo.gl');
    expect(source).toContain('process.env.E2E_API_URL');
  });

  test('storefront-smoke spec documents hero and shop seeded product expectations', () => {
    const source = fs.readFileSync(path.join(e2eDir, 'storefront-smoke.spec.ts'), 'utf8');
    expect(source).toMatch(/Pooja Essentials, Brassware/i);
    expect(source).toContain('Our Collection');
    expect(source).toContain('E2E Brass Lamp');
  });

  test('package.json e2e script runs full playwright test directory', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
    ) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.['e2e']).toBe('playwright test');
  });
});
