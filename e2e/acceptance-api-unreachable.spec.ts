import { expect, test } from '@playwright/test';

const unreachableApiBase = 'http://127.0.0.1:1';

test.describe('acceptance API coupling edge cases', () => {
  test('store products request does not succeed when e2e backend is not listening', async ({
    request,
  }) => {
    let succeeded = false;
    try {
      const response = await request.get(`${unreachableApiBase}/api/store/products`, {
        timeout: 3_000,
      });
      succeeded = response.ok();
    } catch {
      succeeded = false;
    }
    expect(succeeded).toBeFalsy();
  });
});
