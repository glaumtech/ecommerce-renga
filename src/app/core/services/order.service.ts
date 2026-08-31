import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutPayload, Order, normalizeOrderStatus } from '../models/order.model';
import { toUserFriendlyErrorMessage } from '../utils/api-error.util';
import {
  getSessionItem,
  removeSessionItem,
  setSessionItem,
} from '../utils/browser-storage.util';

interface StoreOrderDto {
  orderRef: string;
  orderDate: string;
  total: number;
  status: string;
  items: { name: string; qty: number }[];
}

interface StoreOrdersByMobileDto {
  customerName: string | null;
  orders: StoreOrderDto[];
}

export interface SavedCheckoutAddress {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  mobile?: string | null;
}

export const LOOKUP_MOBILE_KEY = 'ananda_lookup_mobile';

export type OrderHttpError = Error & { status?: number };

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly ordersUrl = `${environment.apiUrl}/api/store/orders`;

  readonly orders = signal<Order[]>([]);
  readonly customerName = signal<string | null>(null);
  readonly lookupMobile = signal<string | null>(this.readStoredMobile());
  readonly savedAddresses = signal<SavedCheckoutAddress[]>([]);
  readonly addressesLoading = signal(false);
  readonly loading = signal(false);
  readonly cancellingOrderId = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  loadAddressesByMobile(mobile: string): Observable<SavedCheckoutAddress[]> {
    const normalized = mobile.trim();
    if (!normalized) {
      this.savedAddresses.set([]);
      return of([]);
    }

    this.addressesLoading.set(true);

    return this.http
      .get<SavedCheckoutAddress[]>(
        `${this.ordersUrl}/addresses/by-mobile/${encodeURIComponent(normalized)}`
      )
      .pipe(
        catchError(() => of([] as SavedCheckoutAddress[])),
        tap((addresses) => this.savedAddresses.set(addresses)),
        finalize(() => this.addressesLoading.set(false))
      );
  }

  loadAddressesForCurrentUser(): Observable<SavedCheckoutAddress[]> {
    this.addressesLoading.set(true);

    return this.http.get<SavedCheckoutAddress[]>(`${this.ordersUrl}/addresses`).pipe(
      catchError(() => of([] as SavedCheckoutAddress[])),
      tap((addresses) => this.savedAddresses.set(addresses)),
      finalize(() => this.addressesLoading.set(false))
    );
  }

  loadOrdersByMobile(mobile: string): void {
    const normalized = mobile.trim();
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<StoreOrdersByMobileDto>(`${this.ordersUrl}/by-mobile/${encodeURIComponent(normalized)}`)
      .pipe(
        catchError((err) => {
          this.error.set(
            toUserFriendlyErrorMessage(err, 'Failed to load orders. Please try again.')
          );
          return of({ customerName: null, orders: [] } as StoreOrdersByMobileDto);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((response) => {
        this.setLookupMobile(normalized);
        this.customerName.set(response.customerName);
        this.orders.set(this.mapOrders(response.orders));
      });
  }

  placeOrder(payload: CheckoutPayload) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<StoreOrderDto>(this.ordersUrl, payload).pipe(
      catchError((err: OrderHttpError) => {
        const message = toUserFriendlyErrorMessage(
          err,
          'Unable to place your order. Please try again.'
        );
        this.error.set(message);
        const wrapped = new Error(message) as OrderHttpError;
        wrapped.status = err.status;
        return throwError(() => wrapped);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  cancelOrder(orderRef: string, mobile: string) {
    this.cancellingOrderId.set(orderRef);
    this.error.set(null);

    return this.http
      .post<StoreOrderDto>(`${this.ordersUrl}/${encodeURIComponent(orderRef)}/cancel`, { mobile })
      .pipe(
        tap((updated) => {
          const status = normalizeOrderStatus(updated.status);
          this.orders.update((orders) =>
            orders.map((order) => (order.id === orderRef ? { ...order, status } : order))
          );
        }),
        catchError((err: OrderHttpError) => {
          const message =
            err.status === 401
              ? 'Unable to cancel this order. Please try again.'
              : toUserFriendlyErrorMessage(err, 'Unable to cancel this order. Please try again.');
          this.error.set(message);
          const wrapped = new Error(message) as OrderHttpError;
          wrapped.status = err.status;
          return throwError(() => wrapped);
        }),
        finalize(() => this.cancellingOrderId.set(null))
      );
  }

  setLookupMobile(mobile: string): void {
    setSessionItem(LOOKUP_MOBILE_KEY, mobile);
    this.lookupMobile.set(mobile);
  }

  clearAddresses(): void {
    this.savedAddresses.set([]);
    this.addressesLoading.set(false);
  }

  clearLookup(): void {
    removeSessionItem(LOOKUP_MOBILE_KEY);
    this.lookupMobile.set(null);
    this.customerName.set(null);
    this.orders.set([]);
    this.savedAddresses.set([]);
    this.error.set(null);
  }

  private readStoredMobile(): string | null {
    return getSessionItem(LOOKUP_MOBILE_KEY);
  }

  private mapOrders(orders: StoreOrderDto[]): Order[] {
    return orders.map((o) => ({
      id: o.orderRef,
      date: o.orderDate,
      total: Number(o.total),
      status: normalizeOrderStatus(o.status),
      items: o.items,
    }));
  }
}
