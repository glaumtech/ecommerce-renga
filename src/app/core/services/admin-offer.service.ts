import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DiscountType, Offer, OfferCreate, OfferStatistics, OfferType, TargetAudience } from '../models/offer.model';

@Injectable({ providedIn: 'root' })
export class AdminOfferService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/offers`;

  getAll(): Observable<Offer[]> {
    return this.http.get<Offer[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  getById(id: number): Observable<Offer> {
    return this.http.get<Offer>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  create(dto: OfferCreate): Observable<Offer> {
    return this.http.post<Offer>(this.apiUrl, dto).pipe(catchError(this.handleError));
  }

  update(id: number, dto: OfferCreate): Observable<Offer> {
    return this.http.put<Offer>(`${this.apiUrl}/${id}`, dto).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  toggleStatus(id: number): Observable<Offer> {
    return this.http.post<Offer>(`${this.apiUrl}/${id}/toggle-status`, {}).pipe(catchError(this.handleError));
  }

  search(query: string): Observable<Offer[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<Offer[]>(`${this.apiUrl}/search`, { params }).pipe(catchError(this.handleError));
  }

  getStatistics(id: number): Observable<OfferStatistics> {
    return this.http.get<OfferStatistics>(`${this.apiUrl}/${id}/statistics`).pipe(catchError(this.handleError));
  }

  getOfferTypes(): Observable<OfferType[]> {
    return this.http.get<OfferType[]>(`${this.apiUrl}/types`).pipe(catchError(this.handleError));
  }

  getDiscountTypes(): Observable<DiscountType[]> {
    return this.http.get<DiscountType[]>(`${this.apiUrl}/discount-types`).pipe(catchError(this.handleError));
  }

  getTargetAudiences(): Observable<TargetAudience[]> {
    return this.http.get<TargetAudience[]>(`${this.apiUrl}/target-audiences`).pipe(catchError(this.handleError));
  }

  private handleError(error: { error?: { message?: string }; message?: string }): Observable<never> {
    const msg = error.error?.message || error.message || 'Offer request failed';
    return throwError(() => msg);
  }
}
