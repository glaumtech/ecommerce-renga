import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

interface TawkApi {
  hideWidget?: () => void;
  showWidget?: () => void;
  onLoad?: () => void;
}

interface TawkWindow extends Window {
  Tawk_API?: TawkApi;
  Tawk_LoadStart?: Date;
}

@Injectable({ providedIn: 'root' })
export class TawkService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private started = false;

  /**
   * Loads live chat for shoppers and keeps the bubble off admin screens.
   *
   * Business requirement: customers can open chat from any store page.
   * Decision: inject the embed in the browser and toggle it on navigation,
   * because prerender must not run the script and /admin must stay clear.
   * Constraints: skipped when either id is empty, and the script is added once.
   */
  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.started) {
      return;
    }

    const propertyId = environment.tawkPropertyId;
    const widgetId = environment.tawkWidgetId;
    if (!propertyId || !widgetId) {
      return;
    }

    const win = this.document.defaultView as TawkWindow | null;
    if (!win) {
      return;
    }

    this.started = true;

    const api: TawkApi = win.Tawk_API ?? {};
    win.Tawk_API = api;
    win.Tawk_LoadStart = new Date();
    api.onLoad = () => this.syncVisibility(this.router.url);

    const script = this.document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    this.document.body.appendChild(script);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.syncVisibility(event.urlAfterRedirects));
  }

  private syncVisibility(url: string): void {
    const api = (this.document.defaultView as TawkWindow | null)?.Tawk_API;
    if (!api?.hideWidget || !api.showWidget) {
      return;
    }
    if (url.startsWith('/admin')) {
      api.hideWidget();
      return;
    }
    api.showWidget();
  }
}
