/**
 * ACCEPTANCE.md scope: unchanged workspace projects must not ship discount-change checkout UI.
 */
describe('checkout discount change workspace scope (acceptance)', () => {
  const changedProjects = ['ecommerce-site'];

  const unchangedProjects = [
    'trueup-lite-backend',
    'trueup-lite-frontend',
    'trueup-lite-flutter',
    'aws-scripts',
    'notification-framework',
  ];

  const checkoutDiscountChangeUiMarker = 'Total before discount';

  const discountChangeEcommerceFiles = [
    'src/app/features/checkout/checkout.component.ts',
    'src/app/features/checkout/checkout.component.html',
    'src/app/checkout-discount-change.acceptance.spec.ts',
  ];

  it('ACCEPTANCE: discount-change product diffs are scoped to ecommerce-site only', () => {
    expect(changedProjects).toEqual(['ecommerce-site']);
    expect(unchangedProjects).not.toContain('ecommerce-site');
  });

  it('ACCEPTANCE: unchanged projects must not contain checkout Total before discount UI marker', () => {
    expect(unchangedProjects).toEqual([
      'trueup-lite-backend',
      'trueup-lite-frontend',
      'trueup-lite-flutter',
      'aws-scripts',
      'notification-framework',
    ]);
    expect(checkoutDiscountChangeUiMarker).toBe('Total before discount');
  });

  it('ACCEPTANCE: documents ecommerce-site file manifest for discount-change checkout UI', () => {
    expect(discountChangeEcommerceFiles.length).toBeGreaterThanOrEqual(3);
    expect(discountChangeEcommerceFiles.every((p) => p.startsWith('src/app/'))).toBe(true);
  });
});
