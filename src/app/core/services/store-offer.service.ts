import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItem } from '../models/cart.model';
import {
  CheckoutCartLine,
  CheckoutOfferEvaluation,
  Offer,
  OfferApplicationResult,
} from '../models/offer.model';

@Injectable({ providedIn: 'root' })
export class StoreOfferService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/offers`;

  toCartLines(cart: CartItem[]): CheckoutCartLine[] {
    return cart.map((item) => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
  }

  getApplicableOffers(lines: CheckoutCartLine[]): Observable<Offer[]> {
    return this.http.post<Offer[]>(`${this.apiUrl}/applicable`, lines).pipe(catchError(this.handleError));
  }

  applyOffer(id: number, lines: CheckoutCartLine[]): Observable<OfferApplicationResult> {
    return this.http
      .post<OfferApplicationResult>(`${this.apiUrl}/${id}/apply`, lines)
      .pipe(catchError(this.handleError));
  }

  evaluateCheckout(mobile: string | null, lines: CheckoutCartLine[]): Observable<CheckoutOfferEvaluation> {
    const body: { mobile?: string; items: CheckoutCartLine[] } = { items: lines };
    const normalized = mobile?.trim();
    if (normalized) {
      body.mobile = normalized;
    }
    return this.http
      .post<CheckoutOfferEvaluation>(`${this.apiUrl}/evaluate-checkout`, body)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: { error?: { message?: string }; message?: string }): Observable<never> {
    const msg = error.error?.message || error.message || 'Offer request failed';
    return throwError(() => msg);
  }
}
