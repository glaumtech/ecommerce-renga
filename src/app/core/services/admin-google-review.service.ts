import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GoogleReviewsListing } from '../data/google-reviews';
import { toUserFriendlyErrorMessage } from '../utils/api-error.util';

export interface GoogleReviewsAdminListing {
  listing: GoogleReviewsListing;
  syncedAt?: string | null;
  syncError?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AdminGoogleReviewService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/store/admin/google-reviews`;

  getListing(): Observable<GoogleReviewsAdminListing> {
    return this.http.get<GoogleReviewsAdminListing>(this.baseUrl).pipe(catchError(this.handleError));
  }

  syncFromGoogle(): Observable<GoogleReviewsAdminListing> {
    return this.http.post<GoogleReviewsAdminListing>(`${this.baseUrl}/sync`, null).pipe(catchError(this.handleError));
  }

  private handleError(error: unknown) {
    return throwError(() =>
      toUserFriendlyErrorMessage(error, 'Google review sync failed. Please try again.')
    );
  }
}
