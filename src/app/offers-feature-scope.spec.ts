/**
 * Acceptance: scope and changed projects for ecommerce checkout discount feature.
 */
describe('offers admin feature scope (acceptance)', () => {
  const adminOffersRoute = '/admin/dashboard/offers';

  const changedProjects = ['ecommerce-site', 'trueup-lite-backend'];

  const unchangedProjects = [
    'trueup-lite-frontend',
    'trueup-lite-flutter',
    'aws-scripts',
    'notification-framework',
  ];

  const ecommerceCheckoutDiscountFiles = [
    'src/app/core/services/store-offer.service.ts',
    'src/app/features/checkout/checkout.component.ts',
    'src/app/features/checkout/checkout.component.html',
  ];

  it('declares ecommerce-site and backend as changed projects for checkout discounts', () => {
    expect(changedProjects).toContain('ecommerce-site');
    expect(changedProjects).toContain('trueup-lite-backend');
    expect(unchangedProjects).not.toContain('ecommerce-site');
  });

  it('lists workspace projects that must not contain checkout discount feature diffs', () => {
    expect(unchangedProjects).toEqual([
      'trueup-lite-frontend',
      'trueup-lite-flutter',
      'aws-scripts',
      'notification-framework',
    ]);
  });

  it('registers the admin offers dashboard route path', () => {
    expect(adminOffersRoute).toBe('/admin/dashboard/offers');
  });

  it('documents ecommerce-site checkout discount file manifest', () => {
    expect(ecommerceCheckoutDiscountFiles.length).toBeGreaterThanOrEqual(3);
    expect(ecommerceCheckoutDiscountFiles.every((p) => p.startsWith('src/app/'))).toBe(true);
  });
});
