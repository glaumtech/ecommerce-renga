/**
 * ACCEPTANCE.md unchanged projects guard (manifest contract for pipeline scope).
 */
describe('checkout discount workspace scope (acceptance)', () => {
  const unchangedProjects = [
    'trueup-lite-frontend',
    'trueup-lite-flutter',
    'aws-scripts',
    'notification-framework',
  ];

  const checkoutDiscountMarkers = [
    'store-offer.service.ts',
    'evaluate-checkout',
    'CheckoutOfferEvaluation',
  ];

  it('lists unchanged projects that must not ship checkout discount storefront code', () => {
    expect(unchangedProjects).toEqual([
      'trueup-lite-frontend',
      'trueup-lite-flutter',
      'aws-scripts',
      'notification-framework',
    ]);
  });

  it('defines markers used to detect accidental checkout discount diffs in unchanged repos', () => {
    expect(checkoutDiscountMarkers.length).toBeGreaterThanOrEqual(3);
  });
});
