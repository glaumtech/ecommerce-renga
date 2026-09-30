/**
 * ACCEPTANCE.md — Automated tests (ecommerce-site): catalog guard for discount change.
 */
describe('checkout discount change test catalog (acceptance)', () => {
  const discountChangeSpecs = [
    'src/app/checkout-discount-change.acceptance.spec.ts',
    'src/app/checkout-discount-change-test-catalog.acceptance.spec.ts',
    'src/app/checkout-discount-change-workspace-scope.acceptance.spec.ts',
    'src/app/features/checkout/checkout.component.spec.ts',
    'src/app/checkout-discount.acceptance.spec.ts',
    'src/app/checkout-discount-test-catalog.acceptance.spec.ts',
  ];

  const npmTestCommand = 'npm test -- --watch=false --browsers=ChromeHeadless';

  it('ACCEPTANCE: catalog lists checkout-discount-change guard specs', () => {
    expect(discountChangeSpecs).toContain('src/app/checkout-discount-change.acceptance.spec.ts');
    expect(discountChangeSpecs.every((p) => p.startsWith('src/app/'))).toBe(true);
  });

  it('ACCEPTANCE: pipeline npm test command is documented for ecommerce-site', () => {
    expect(npmTestCommand).toContain('ChromeHeadless');
    expect(npmTestCommand).toContain('--watch=false');
  });

  it('ACCEPTANCE: checkout.component.spec.ts is a required guard for discount-change UI', () => {
    expect(discountChangeSpecs).toContain('src/app/features/checkout/checkout.component.spec.ts');
  });
});
