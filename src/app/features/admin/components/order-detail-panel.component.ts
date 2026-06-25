import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { AppCurrencyPipe } from '../../../shared/pipes/app-currency.pipe';
import { AdminOrder, OrderStatus, SHIPPING_FEE } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-detail-panel',
  imports: [DatePipe, AppCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (order(); as order) {
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 relative">
        <div class="flex justify-between items-start border-b border-slate-100 pb-6 mb-6 gap-4 flex-wrap">
          <div>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Order</span>
            <h3 class="text-2xl font-serif font-bold text-slate-800">{{ order.id }}</h3>
            <p class="text-xs text-slate-400 mt-0.5">Placed on {{ order.date | date:'longDate' }}</p>
          </div>
          <button
            type="button"
            (click)="screenshotMode.emit()"
            class="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl border border-slate-200 shadow-sm transition-all text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Packing Slip
          </button>
        </div>

        <div class="bg-slate-50 p-5 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p class="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold mb-0.5">Tracking Status</p>
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-slate-800">Current:</span>
              <span
                class="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full"
                [class.bg-amber-100]="order.status === 'Pending'"
                [class.text-amber-800]="order.status === 'Pending'"
                [class.bg-blue-100]="order.status === 'Accepted'"
                [class.text-blue-800]="order.status === 'Accepted'"
                [class.bg-indigo-100]="order.status === 'Shipped'"
                [class.text-indigo-800]="order.status === 'Shipped'"
                [class.bg-green-100]="order.status === 'Delivered'"
                [class.text-green-800]="order.status === 'Delivered'"
                [class.bg-red-100]="order.status === 'Cancelled'"
                [class.text-red-800]="order.status === 'Cancelled'"
              >
                {{ order.status }}
              </span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            @for (status of statuses; track status) {
              <button
                type="button"
                (click)="statusChange.emit(status)"
                class="text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors"
                [class.bg-amber-50]="order.status === status && status === 'Pending'"
                [class.text-amber-700]="status === 'Pending'"
                [class.bg-blue-50]="order.status === status && status === 'Accepted'"
                [class.text-blue-700]="status === 'Accepted'"
                [class.bg-indigo-50]="order.status === status && status === 'Shipped'"
                [class.text-indigo-700]="status === 'Shipped'"
                [class.bg-green-50]="order.status === status && status === 'Delivered'"
                [class.text-green-700]="status === 'Delivered'"
                [class.bg-red-50]="order.status === status && status === 'Cancelled'"
                [class.text-red-700]="status === 'Cancelled'"
              >
                {{ status }}
              </button>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h4 class="font-serif font-bold text-slate-800 text-[15px] mb-4 border-b pb-2">Products Ordered</h4>
            <div class="space-y-3">
              @for (item of order.items; track item.name) {
                <div class="flex items-start justify-between text-sm">
                  <div>
                    <span class="font-extrabold text-amber-600 mr-2">{{ item.qty }}x</span>
                    <span class="text-slate-600 font-medium">{{ item.name }}</span>
                  </div>
                  <span class="font-bold text-slate-800">{{ (item.price ?? 0) * item.qty | appCurrency }}</span>
                </div>
              }
              <div class="pt-4 border-t border-dashed border-slate-100 flex justify-between items-center text-sm">
                <span class="text-slate-400 font-medium">Delivery Surcharges</span>
                <span class="font-semibold text-slate-800">{{ shippingFee | appCurrency }}</span>
              </div>
              <div class="flex justify-between items-center text-base font-extrabold text-slate-800 pt-2">
                <span>Total Bill</span>
                <span class="text-amber-700">{{ order.total | appCurrency }}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-serif font-bold text-slate-800 text-[15px] mb-4 border-b pb-2">Delivery Address</h4>
            <div class="bg-amber-50/30 p-4 rounded-2xl border border-amber-100/30 space-y-2 text-sm text-slate-600">
              <p class="font-bold text-slate-800 text-base">{{ order.shippingAddress.name }}</p>
              <p>{{ order.shippingAddress.street }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} - {{ order.shippingAddress.zip }}</p>
              <div class="pt-3 border-t border-amber-100/30 flex flex-col gap-1 text-xs">
                <div class="flex items-center text-slate-500 font-medium">
                  <span class="font-bold text-slate-700 mr-2">Email:</span> {{ order.shippingAddress.email }}
                </div>
                <div class="flex items-center text-slate-500 font-medium">
                  <span class="font-bold text-slate-700 mr-2">Phone:</span> {{ order.shippingAddress.phone }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 class="font-serif font-bold text-slate-800 text-[15px] mb-2">Internal Staff Notes</h4>
          <textarea
            class="w-full border border-slate-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
            placeholder="Add packing instructions or dispatch feedback..."
            [value]="notesValue()"
            (input)="onNotesInput($event)"
            rows="3"
          ></textarea>
        </div>
      </div>
    } @else {
      <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-slate-300 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        <p class="font-medium text-slate-500 text-sm">Please select an order from the list on the left to verify packaging status and details.</p>
      </div>
    }
  `,
})
export class OrderDetailPanelComponent {
  readonly order = input.required<AdminOrder | null>();
  readonly statusChange = output<OrderStatus>();
  readonly screenshotMode = output<void>();
  readonly notesChange = output<string>();

  readonly shippingFee = SHIPPING_FEE;
  readonly statuses: OrderStatus[] = ['Pending', 'Accepted', 'Shipped', 'Delivered', 'Cancelled'];

  private notesTimer: ReturnType<typeof setTimeout> | null = null;
  private lastOrderId: string | null = null;
  readonly notesValue = signal('');

  constructor() {
    effect(() => {
      const order = this.order();
      if (order?.id !== this.lastOrderId) {
        this.lastOrderId = order?.id ?? null;
        this.notesValue.set(order?.staffNotes ?? '');
      }
    });
  }

  onNotesInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.notesValue.set(value);
    if (this.notesTimer) {
      clearTimeout(this.notesTimer);
    }
    this.notesTimer = setTimeout(() => this.notesChange.emit(value), 500);
  }
}
