import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GOOGLE_REVIEWS_LISTING, GoogleReviewsListing } from '../data/google-reviews';

const MIN_RATING = 4;

@Injectable({ providedIn: 'root' })
export class GoogleReviewService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/api/store/google-reviews`;

  readonly listing = signal<GoogleReviewsListing>(this.withFourStarReviews(GOOGLE_REVIEWS_LISTING));
  readonly loading = signal(false);
  private requested = false;

  load(): void {
    if (this.requested) {
      return;
    }
    this.requested = true;
    this.loading.set(true);
    this.http
      .get<GoogleReviewsListing>(this.url)
      .pipe(catchError(() => of(null)))
      .subscribe((live) => {
        const filtered = live ? this.withFourStarReviews(live) : null;
        if (filtered && (filtered.reviews.length > 0 || filtered.reviewCount > 0)) {
          this.listing.set(filtered);
        } else {
          this.listing.set(this.withFourStarReviews(GOOGLE_REVIEWS_LISTING));
        }
        this.loading.set(false);
      });
  }

  private withFourStarReviews(listing: GoogleReviewsListing): GoogleReviewsListing {
    return {
      ...listing,
      reviews: (listing.reviews || []).filter(
        (review) => review.rating >= MIN_RATING && !!review.text?.trim()
      ),
    };
  }
}
