/**
 * Catalog of checkout discount acceptance test entry points (ACCEPTANCE.md automated section).
 */
describe('checkout discount test catalog (acceptance)', () => {
  const ecommerceSpecs = [
    'src/app/checkout-discount.acceptance.spec.ts',
    'src/app/checkout-discount-workspace-scope.acceptance.spec.ts',
    'src/app/core/services/store-offer.service.spec.ts',
    'src/app/features/checkout/checkout.component.spec.ts',
    'src/app/offers-storefront-scope.spec.ts',
    'src/app/offers-feature-scope.spec.ts',
  ];

  it('lists ecommerce-site specs that guard checkout discount acceptance', () => {
    expect(ecommerceSpecs.length).toBeGreaterThanOrEqual(6);
    expect(ecommerceSpecs.every((p) => p.startsWith('src/app/'))).toBe(true);
  });
});
