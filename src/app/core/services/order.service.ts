import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CheckoutPayload, Order, normalizeOrderStatus } from '../models/order.model';
import { toUserFriendlyErrorMessage } from '../utils/api-error.util';

interface StoreOrderDto {
  orderRef: string;
  orderDate: string;
  total: number;
  status: string;
  items: { name: string; qty: number }[];
}

export type OrderHttpError = Error & { status?: number };

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly ordersUrl = `${environment.apiUrl}/api/store/orders`;

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<StoreOrderDto[]>(this.ordersUrl)
      .pipe(
        catchError((err) => {
          this.error.set(
            toUserFriendlyErrorMessage(err, 'Failed to load orders. Please try again.')
          );
          return of([] as StoreOrderDto[]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((orders) =>
        this.orders.set(
          orders.map((o) => ({
            id: o.orderRef,
            date: o.orderDate,
            total: Number(o.total),
            status: normalizeOrderStatus(o.status),
            items: o.items,
          }))
        )
      );
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
}
