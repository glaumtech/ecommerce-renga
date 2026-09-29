import { environment } from '../environments/environment';

describe('e2e feature scope (non-regression)', () => {
  it('keeps storefront pointed at local backend for e2e runs', () => {
    expect(environment.apiUrl).toBe('http://localhost:8081');
  });
});
