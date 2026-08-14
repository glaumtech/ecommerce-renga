import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StoreVideoAd, StoreVideoAdWritePayload } from '../models/video-ad.model';
import { toUserFriendlyErrorMessage } from '../utils/api-error.util';

@Injectable({ providedIn: 'root' })
export class AdminVideoAdService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/store/admin/video-ads`;

  list(): Observable<StoreVideoAd[]> {
    return this.http.get<StoreVideoAd[]>(this.baseUrl).pipe(catchError(this.handleError));
  }

  create(payload: StoreVideoAdWritePayload, file: File): Observable<StoreVideoAd> {
    return this.http
      .post<StoreVideoAd>(this.baseUrl, this.toFormData(payload, file))
      .pipe(catchError(this.handleError));
  }

  update(id: number, payload: StoreVideoAdWritePayload, file?: File | null): Observable<StoreVideoAd> {
    return this.http
      .put<StoreVideoAd>(`${this.baseUrl}/${id}`, this.toFormData(payload, file))
      .pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private toFormData(payload: StoreVideoAdWritePayload, file?: File | null): FormData {
    const form = new FormData();
    form.append('ad', JSON.stringify(payload));
    if (file) {
      form.append('file', file);
    }
    return form;
  }

  private handleError(error: unknown) {
    return throwError(() => toUserFriendlyErrorMessage(error, 'Video ad request failed. Please try again.'));
  }
}
