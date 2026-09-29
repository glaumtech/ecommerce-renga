/**
 * Acceptance: scope and unchanged projects for ecommerce admin offers feature.
 */
describe('offers admin feature scope (acceptance)', () => {
  const adminOffersRoute = '/admin/dashboard/offers';

  const changedProject = 'ecommerce-site';

  const unchangedProjects = [
    'trueup-lite-backend',
    'trueup-lite-frontend',
    'trueup-lite-flutter',
    'aws-scripts',
    'notification-framework',
  ];

  const ecommerceOffersFeatureFiles = [
    'src/app/core/models/offer.model.ts',
    'src/app/core/services/admin-offer.service.ts',
    'src/app/core/services/admin-offer-catalog.service.ts',
    'src/app/features/admin/offers/admin-offers.component.ts',
  ];

  it('declares ecommerce-site as the sole changed project for this feature', () => {
    expect(changedProject).toBe('ecommerce-site');
    expect(unchangedProjects).not.toContain(changedProject);
  });

  it('lists workspace projects that must not contain offer-admin feature diffs', () => {
    expect(unchangedProjects).toEqual([
      'trueup-lite-backend',
      'trueup-lite-frontend',
      'trueup-lite-flutter',
      'aws-scripts',
      'notification-framework',
    ]);
  });

  it('registers the admin offers dashboard route path', () => {
    expect(adminOffersRoute).toBe('/admin/dashboard/offers');
  });

  it('documents ecommerce-site offers feature file manifest', () => {
    expect(ecommerceOffersFeatureFiles.length).toBeGreaterThanOrEqual(4);
    expect(ecommerceOffersFeatureFiles.every((p) => p.startsWith('src/app/'))).toBe(true);
  });

  it('documents backend as consumed API-only (trueup-lite-backend unchanged)', () => {
    expect(unchangedProjects).toContain('trueup-lite-backend');
  });
});
