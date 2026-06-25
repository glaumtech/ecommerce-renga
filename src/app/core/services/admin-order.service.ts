import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminOrder,
  OrderStatus,
  SHIPPING_FEE,
  normalizeOrderStatus,
} from '../models/order.model';
import { toUserFriendlyErrorMessage } from '../utils/api-error.util';

interface AdminStoreOrderDto {
  orderRef: string;
  orderDate: string;
  createdAt?: string;
  total: number;
  shippingFee?: number;
  status: string;
  paymentMethod: string;
  staffNotes?: string;
  shippingAddress: {
    name: string;
    email: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
  };
  items: { name: string; qty: number; unitPrice: number }[];
}

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/store/admin/orders`;

  readonly orders = signal<AdminOrder[]>([]);
  readonly selectedOrder = signal<AdminOrder | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly fulfillmentScreenshotMode = signal(false);

  readonly statusCounts = computed(() => {
    const counts = { Pending: 0, Accepted: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    for (const order of this.orders()) {
      const status = normalizeOrderStatus(order.status);
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    }
    return counts;
  });

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<AdminStoreOrderDto[]>(this.baseUrl)
      .pipe(
        catchError((err) => {
          this.error.set(
            toUserFriendlyErrorMessage(err, 'Failed to load admin orders. Please try again.')
          );
          return of([] as AdminStoreOrderDto[]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((orders) => {
        const mapped = orders.map((o) => this.mapDto(o));
        this.orders.set(mapped);
        const selectedRef = this.selectedOrder()?.id;
        if (selectedRef) {
          const updated = mapped.find((o) => o.id === selectedRef);
          this.selectedOrder.set(updated ?? (mapped.length > 0 ? mapped[0] : null));
        } else if (mapped.length > 0) {
          this.selectedOrder.set(mapped[0]);
        }
      });
  }

  selectOrder(orderRef: string): void {
    const order = this.orders().find((o) => o.id === orderRef);
    if (order) {
      this.selectedOrder.set(order);
    }
  }

  updateStatus(orderRef: string, status: OrderStatus): void {
    this.http
      .patch<AdminStoreOrderDto>(`${this.baseUrl}/${orderRef}/status`, { status })
      .pipe(
        catchError((err) => {
          this.error.set(
            toUserFriendlyErrorMessage(err, 'Failed to update order status.')
          );
          return of(null);
        })
      )
      .subscribe((updated) => {
        if (updated) {
          this.applyOrderUpdate(this.mapDto(updated));
        }
      });
  }

  updateStaffNotes(orderRef: string, staffNotes: string): void {
    this.http
      .patch<AdminStoreOrderDto>(`${this.baseUrl}/${orderRef}/notes`, { staffNotes })
      .pipe(
        catchError((err) => {
          this.error.set(
            toUserFriendlyErrorMessage(err, 'Failed to save staff notes.')
          );
          return of(null);
        })
      )
      .subscribe((updated) => {
        if (updated) {
          this.applyOrderUpdate(this.mapDto(updated));
        }
      });
  }

  private applyOrderUpdate(order: AdminOrder): void {
    this.orders.update((prev) =>
      prev.map((o) => (o.id === order.id ? order : o))
    );
    if (this.selectedOrder()?.id === order.id) {
      this.selectedOrder.set(order);
    }
  }

  private mapDto(dto: AdminStoreOrderDto): AdminOrder {
    return {
      id: dto.orderRef,
      date: dto.orderDate,
      createdAt: dto.createdAt,
      total: Number(dto.total),
      shippingFee: dto.shippingFee ?? SHIPPING_FEE,
      status: normalizeOrderStatus(dto.status),
      paymentMethod: dto.paymentMethod,
      staffNotes: dto.staffNotes,
      shippingAddress: {
        name: dto.shippingAddress.name,
        email: dto.shippingAddress.email ?? '',
        street: dto.shippingAddress.street ?? '',
        city: dto.shippingAddress.city ?? '',
        state: dto.shippingAddress.state ?? '',
        zip: dto.shippingAddress.zip ?? '',
        phone: dto.shippingAddress.phone ?? '',
      },
      items: dto.items.map((i) => ({
        name: i.name,
        qty: i.qty,
        price: Number(i.unitPrice),
      })),
    };
  }
}
