import { environment } from '../environments/environment';

describe('Playwright e2e acceptance guards', () => {
  it('storefront apiUrl targets local backend port 8081 for e2e runs', () => {
    expect(environment.apiUrl).toBe('http://localhost:8081');
  });
});
