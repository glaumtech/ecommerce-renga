import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AdminOrderService } from '../../core/services/admin-order.service';
import { OrderStatus } from '../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { OrderDetailPanelComponent } from './components/order-detail-panel.component';
import { OrderListComponent } from './components/order-list.component';
import { OrderMetricsComponent } from './components/order-metrics.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    LoadingSpinnerComponent,
    OrderMetricsComponent,
    OrderListComponent,
    OrderDetailPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="mb-8 border-b border-slate-100 pb-5">
        <span class="text-amber-700 text-xs font-bold tracking-widest uppercase block mb-1">Administrative Center</span>
        <h2 class="text-3xl font-serif font-bold text-slate-800">Fulfillment Controls</h2>
      </div>

      @if (adminOrderService.loading()) {
        <app-loading-spinner message="Loading orders..." />
      } @else {
        @if (adminOrderService.error()) {
          <div class="bg-red-50 text-red-700 text-sm font-medium p-4 rounded-xl border border-red-200 mb-6">
            {{ adminOrderService.error() }}
          </div>
        }

        <app-order-metrics [counts]="adminOrderService.statusCounts()" />

        <div class="flex flex-col xl:flex-row gap-8">
          <div class="w-full xl:w-[420px] flex-shrink-0">
            <app-order-list
              [orders]="adminOrderService.orders()"
              [selectedId]="adminOrderService.selectedOrder()?.id ?? null"
              (selectOrder)="onSelectOrder($event)"
            />
          </div>
          <div class="flex-1">
            <app-order-detail-panel
              [order]="adminOrderService.selectedOrder()"
              (statusChange)="onStatusChange($event)"
              (screenshotMode)="adminOrderService.fulfillmentScreenshotMode.set(true)"
              (notesChange)="onNotesChange($event)"
            />
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  readonly adminOrderService = inject(AdminOrderService);

  ngOnInit(): void {
    this.adminOrderService.loadOrders();
  }

  onSelectOrder(orderRef: string): void {
    this.adminOrderService.selectOrder(orderRef);
  }

  onStatusChange(status: OrderStatus): void {
    const order = this.adminOrderService.selectedOrder();
    if (order) {
      this.adminOrderService.updateStatus(order.id, status);
    }
  }

  onNotesChange(notes: string): void {
    const order = this.adminOrderService.selectedOrder();
    if (order) {
      this.adminOrderService.updateStaffNotes(order.id, notes);
    }
  }
}
