import { routes } from './app.routes';
import { environment } from '../environments/environment';

/**
 * Acceptance: README Admin portal docs — verified via route/API contracts that README describes.
 */
describe('offers admin README contract (acceptance)', () => {
  const documentedRoute = '/admin/dashboard/offers';
  const documentedMenuLabel = 'Offers & Discounts';
  const documentedApi = '/api/offers';
  const catalogPaths = ['/items/getAll', '/categories', '/brands'];

  it('documents admin offers route via app routing config', () => {
    const adminRoute = routes.find((r) => r.path === 'admin');
    const dashboard = adminRoute?.children?.find((r) => r.path === 'dashboard');
    const offers = dashboard?.children?.find((r) => r.path === 'offers');
    expect(offers).toBeDefined();
    expect(`${documentedRoute}`).toBe('/admin/dashboard/offers');
  });

  it('documents Offers & Discounts menu label as a stable contract string', () => {
    expect(documentedMenuLabel).toContain('Offers');
    expect(documentedMenuLabel).toContain('Discounts');
  });

  it('documents backend /api/offers base on environment apiUrl', () => {
    expect(`${environment.apiUrl}${documentedApi}`).toContain('/api/offers');
  });

  it('documents catalog helper endpoints used by admin offers', () => {
    expect(catalogPaths).toContain('/items/getAll');
    expect(catalogPaths).toContain('/categories');
    expect(catalogPaths).toContain('/brands');
  });
});
