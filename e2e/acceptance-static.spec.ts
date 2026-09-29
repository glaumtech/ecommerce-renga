import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..');

test.describe('acceptance static checks', () => {
  test('package.json defines e2e and e2e:ui scripts', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
    ) as { scripts?: Record<string, string> };
    expect(pkg.scripts?.['e2e']).toBe('playwright test');
    expect(pkg.scripts?.['e2e:ui']).toBe('playwright test --ui');
  });

  test('environment.ts keeps local backend apiUrl on port 8081', () => {
    const envSource = fs.readFileSync(
      path.join(projectRoot, 'src/environments/environment.ts'),
      'utf8'
    );
    expect(envSource).toContain("apiUrl: 'http://localhost:8081'");
  });

  test('playwright.config.ts defaults baseURL to localhost:4200 when E2E_BASE_URL unset', () => {
    const configSource = fs.readFileSync(
      path.join(projectRoot, 'playwright.config.ts'),
      'utf8'
    );
    expect(configSource).toContain(
      "process.env.E2E_BASE_URL ?? 'http://localhost:4200'"
    );
  });

  test('playwright.config.ts documents E2E_BASE_URL override', () => {
    const configSource = fs.readFileSync(
      path.join(projectRoot, 'playwright.config.ts'),
      'utf8'
    );
    expect(configSource).toContain('E2E_BASE_URL');
  });

  test('README documents e2e stack order and E2E_LOCAL reference', () => {
    const readme = fs.readFileSync(path.join(projectRoot, 'README.md'), 'utf8');
    expect(readme).toContain('SPRING_PROFILES_ACTIVE=e2e');
    expect(readme).toContain('npm start');
    expect(readme).toContain('npm run e2e');
    expect(readme).toContain('docs/E2E_LOCAL.md');
  });
});
