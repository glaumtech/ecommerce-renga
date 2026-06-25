import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
    <div class="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-amber-200 selection:text-amber-900">
      <app-header />
      <main class="flex-grow">
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

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  constructor() {
    effect(() => {
      if (!this.storeSeoService.loaded()) {
        return;
      }
      if (isProductDetailPath(this.currentUrl())) {
        return;
      }
      this.seoService.applyStoreDefaults(this.storeSeoService.settings());
    });
  }
}
