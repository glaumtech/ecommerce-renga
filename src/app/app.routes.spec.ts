import { routes } from './app.routes';
import { adminGuard } from './core/guards/admin.guard';
import { AdminOffersComponent } from './features/admin/offers/admin-offers.component';

describe('app routes (admin offers acceptance)', () => {
  function dashboardChildren() {
    const adminRoute = routes.find((route) => route.path === 'admin');
    const dashboardRoute = adminRoute?.children?.find((route) => route.path === 'dashboard');
    return dashboardRoute;
  }

  it('protects admin dashboard with adminGuard (includes offers route)', () => {
    const dashboardRoute = dashboardChildren();
    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.canActivate).toContain(adminGuard);
  });

  it('registers lazy admin offers dashboard route', () => {
    const dashboardRoute = dashboardChildren();
    const offersRoute = dashboardRoute?.children?.find((route) => route.path === 'offers');
    expect(offersRoute).toBeDefined();
    expect(typeof offersRoute?.loadComponent).toBe('function');
  });

  it('lazy loads AdminOffersComponent for offers route', async () => {
    const dashboardRoute = dashboardChildren();
    const offersRoute = dashboardRoute?.children?.find((route) => route.path === 'offers');
    const loaded = await offersRoute?.loadComponent?.();
    expect(loaded).toBe(AdminOffersComponent);
  });

  it('keeps offers admin under /admin/dashboard not storefront shell', () => {
    const shellRoute = routes.find((route) => route.path === '');
    const storefrontPaths = shellRoute?.children?.map((c) => c.path) ?? [];
    expect(storefrontPaths).not.toContain('offers');
  });
});
