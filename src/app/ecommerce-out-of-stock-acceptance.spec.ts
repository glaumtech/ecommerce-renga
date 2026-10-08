import { ECOMMERCE_AVAILABLE_SOON } from './core/utils/product-availability.util';

describe('Ecommerce out of stock acceptance (job_dd8b3817f3bd)', () => {
  it('AC-EC-12 uses documented Will be available soon copy for storefront messaging', () => {
    expect(ECOMMERCE_AVAILABLE_SOON).toBe('Will be available soon');
  });
});
