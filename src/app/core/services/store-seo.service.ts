import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StoreSeoSettings } from '../models/store-seo.model';

const DEFAULT_SETTINGS: StoreSeoSettings = {
  siteName: 'Sri Renga Traders',
  siteUrl: environment.siteUrl,
  currency: 'INR',
};

@Injectable({ providedIn: 'root' })
export class StoreSeoService {
  private readonly http = inject(HttpClient);
  private readonly storeUrl = `${environment.apiUrl}/api/store/seo-settings`;

  readonly settings = signal<StoreSeoSettings>(DEFAULT_SETTINGS);
  readonly loaded = signal(false);

  loadSettings(): void {
    this.http
      .get<StoreSeoSettings>(this.storeUrl)
      .pipe(
        tap((settings) => {
          this.settings.set({ ...DEFAULT_SETTINGS, ...settings });
          this.loaded.set(true);
        }),
        catchError(() => {
          this.settings.set(DEFAULT_SETTINGS);
          this.loaded.set(true);
          return of(DEFAULT_SETTINGS);
        })
      )
      .subscribe();
  }

  resolveSiteUrl(): string {
    const siteUrl = this.settings().siteUrl || environment.siteUrl;
    return siteUrl.replace(/\/+$/, '');
  }
}
