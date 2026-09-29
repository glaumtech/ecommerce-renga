import { routes } from './app.routes';

describe('app routes (google reviews admin)', () => {
  it('registers lazy admin google-reviews dashboard route', () => {
    const adminRoute = routes.find((route) => route.path === 'admin');
    expect(adminRoute).toBeDefined();

    const dashboardRoute = adminRoute?.children?.find((route) => route.path === 'dashboard');
    expect(dashboardRoute).toBeDefined();

    const googleReviewsRoute = dashboardRoute?.children?.find((route) => route.path === 'google-reviews');
    expect(googleReviewsRoute).toBeDefined();
    expect(typeof googleReviewsRoute?.loadComponent).toBe('function');
  });
});
