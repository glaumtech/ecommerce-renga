import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { productSlugGuard } from './core/guards/product-slug.guard';
import { productSeoResolver } from './core/resolvers/product-seo.resolver';
import { categoryHubGuard } from './core/guards/category-hub.guard';
import { ShellComponent } from './shared/layout/shell/shell.component';

export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-shell.component').then((m) => m.AdminShellComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-login.component').then((m) => m.AdminLoginComponent),
      },
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
        children: [
          { path: '', redirectTo: 'orders', pathMatch: 'full' },
          {
            path: 'orders',
            loadComponent: () =>
              import('./features/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
          },
          {
            path: 'categories',
            loadComponent: () =>
              import('./features/admin/categories/admin-categories.component').then(
                (m) => m.AdminCategoriesComponent
              ),
          },
          {
            path: 'video-ads',
            loadComponent: () =>
              import('./features/admin/video-ads/admin-video-ads.component').then(
                (m) => m.AdminVideoAdsComponent
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'login',
    redirectTo: 'account',
    pathMatch: 'full',
  },
  {
    path: 'register',
    redirectTo: 'account',
    pathMatch: 'full',
  },
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'shop/:categorySlug',
        canActivate: [categoryHubGuard],
        loadComponent: () => import('./features/shop/shop.component').then((m) => m.ShopComponent),
      },
      {
        path: 'shop',
        loadComponent: () => import('./features/shop/shop.component').then((m) => m.ShopComponent),
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
      },
      {
        path: 'account',
        loadComponent: () => import('./features/account/account.component').then((m) => m.AccountComponent),
      },
      {
        path: 'about-us',
        loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'return-policy',
        loadComponent: () =>
          import('./features/return-policy/return-policy.component').then((m) => m.ReturnPolicyComponent),
      },
      {
        path: ':slug',
        canActivate: [productSlugGuard],
        resolve: { seo: productSeoResolver },
        loadComponent: () =>
          import('./features/product/product-detail.component').then((m) => m.ProductDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
