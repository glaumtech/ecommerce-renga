import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResolveFn } from '@angular/router';
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StoreSeoSettings } from '../models/store-seo.model';
import { SeoService } from '../services/seo.service';
import { ProductService } from '../services/product.service';
import { StoreSeoService } from '../services/store-seo.service';

const SLUG_PATTERN = /^[a-z0-9_]+$/;

export const productSeoResolver: ResolveFn<boolean> = async (route) => {
  const slug = route.paramMap.get('slug');
  if (!slug || !SLUG_PATTERN.test(slug)) {
    return true;
  }

  const http = inject(HttpClient);
  const productService = inject(ProductService);
  const storeSeoService = inject(StoreSeoService);
  const seoService = inject(SeoService);
  const storeUrl = `${environment.apiUrl}/api/store`;

  if (!storeSeoService.loaded()) {
    await firstValueFrom(
      http.get<StoreSeoSettings>(`${storeUrl}/seo-settings`).pipe(
        tap((settings) => {
          storeSeoService.settings.set({
            siteName: settings.siteName || 'Sri Renga Traders',
            siteUrl: settings.siteUrl || environment.siteUrl,
            defaultDescription: settings.defaultDescription,
            googleSiteVerification: settings.googleSiteVerification,
            ogDefaultImage: settings.ogDefaultImage,
            currency: settings.currency || 'INR',
          });
          storeSeoService.loaded.set(true);
        }),
        catchError(() => {
          storeSeoService.loaded.set(true);
          return of(null);
        })
      )
    );
  }

  const product = await firstValueFrom(
    productService.fetchProductBySlug(slug).pipe(
      catchError(() => of(null))
    )
  );

  if (product) {
    productService.selectedProduct.set(product);
    seoService.applyProductSeo(product, storeSeoService.settings());
  }

  return true;
};
