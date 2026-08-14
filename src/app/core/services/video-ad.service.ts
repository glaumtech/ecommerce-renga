import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StoreVideoAd } from '../models/video-ad.model';
import { resolveProductImageUrl } from '../utils/product-image.util';

@Injectable({ providedIn: 'root' })
export class VideoAdService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/store/video-ads`;

  readonly ads = signal<StoreVideoAd[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    this.http
      .get<StoreVideoAd[]>(this.url)
      .pipe(catchError(() => of([] as StoreVideoAd[])))
      .subscribe((ads) => {
        this.ads.set(ads.map((ad) => this.mapAd(ad)));
        this.loading.set(false);
      });
  }

  private mapAd(ad: StoreVideoAd): StoreVideoAd {
    return {
      ...ad,
      videoUrl: resolveProductImageUrl(ad.videoUrl),
      productImage: ad.productImage ? resolveProductImageUrl(ad.productImage) : ad.productImage,
    };
  }
}
