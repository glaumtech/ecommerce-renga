import { ChangeDetectionStrategy, Component, OnInit, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeaderComponent } from '../../components/header/header.component';
import { SeoService } from '../../../core/services/seo.service';
import { StoreSeoService } from '../../../core/services/store-seo.service';

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
export class ShellComponent implements OnInit {
  private readonly storeSeoService = inject(StoreSeoService);
  private readonly seoService = inject(SeoService);

  constructor() {
    effect(() => {
      if (this.storeSeoService.loaded()) {
        this.seoService.applyStoreDefaults(this.storeSeoService.settings());
      }
    });
  }

  ngOnInit(): void {
    this.storeSeoService.loadSettings();
  }
}
