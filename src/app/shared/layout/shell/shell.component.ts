import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, effect, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { isProductDetailPath } from '../../../core/constants/reserved-routes';
import { SeoService } from '../../../core/services/seo.service';
import { StoreSeoService } from '../../../core/services/store-seo.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen max-w-full min-w-0 flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-amber-200 selection:text-amber-900">
      <app-header />
      <main class="flex-grow min-w-0 max-w-full">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
})
export class ShellComponent {
  private readonly storeSeoService = inject(StoreSeoService);
  private readonly seoService = inject(SeoService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          takeUntilDestroyed()
        )
        .subscribe(() => {
          window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        });
    }

    effect(() => {
      if (!this.storeSeoService.loaded()) {
        return;
      }
      if (this.shouldSkipStoreDefaults(this.currentUrl())) {
        return;
      }
      this.seoService.applyStoreDefaults(this.storeSeoService.settings());
    });
  }

  private shouldSkipStoreDefaults(url: string): boolean {
    if (isProductDetailPath(url)) {
      return true;
    }
    const path = url.split('?')[0];
    if (path.startsWith('/shop') || path === '/about-us') {
      return true;
    }
    const privatePaths = ['/cart', '/checkout', '/account', '/admin'];
    return privatePaths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
  }
}
