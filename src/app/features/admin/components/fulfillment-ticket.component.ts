import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AppCurrencyPipe } from '../../../shared/pipes/app-currency.pipe';
import { AdminOrder, SHIPPING_FEE } from '../../../core/models/order.model';

@Component({
  selector: 'app-fulfillment-ticket',
  imports: [DatePipe, AppCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (order(); as order) {
      <article class="fulfillment-slip bg-white rounded-xl sm:rounded-2xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl shadow-slate-900/20 text-slate-800 animate-in">
        <!-- Header -->
        <header class="relative bg-gradient-to-br from-[#5c2505] to-[#773710] px-4 pt-4 pb-3 text-white sticky top-0 z-10">
          <button
            type="button"
            (click)="close.emit()"
            class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
            aria-label="Close packing slip"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div class="pr-8 mb-2">
            <h1 class="text-base font-serif font-bold leading-tight">Sri Renga Pooja &amp; Herbal</h1>
            <p class="text-amber-200/80 text-[11px] font-medium">Packing Slip</p>
          </div>

          <div class="flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span class="bg-white/10 rounded-full px-2.5 py-0.5">{{ order.id }}</span>
            <span class="bg-white/10 rounded-full px-2.5 py-0.5">{{ order.date | date:'d MMM y' }}</span>
            <span [class]="statusBadgeClass(order.status)">{{ order.status }}</span>
          </div>
        </header>

        <div class="px-4 py-3 space-y-3">
          <!-- Items -->
          <section>
            <h2 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Items ({{ itemCount() }})</h2>
            <ul class="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              @for (item of order.items; track item.name) {
                <li class="flex items-start gap-2 px-2.5 py-2 bg-white">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-slate-800 leading-snug">{{ item.name }}</p>
                    <p class="text-[10px] text-slate-400 mt-0.5">
                      {{ item.qty }} × {{ (item.price ?? 0) | appCurrency }}
                    </p>
                  </div>
                  <span class="text-xs font-bold text-slate-800 flex-shrink-0 pt-0.5">
                    {{ lineTotal(item) | appCurrency }}
                  </span>
                </li>
              }
            </ul>
          </section>

          <!-- Ship to -->
          <section>
            <h2 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Ship To</h2>
            <div class="rounded-lg bg-amber-50/70 border border-amber-100/80 px-3 py-2.5 text-xs text-slate-700 space-y-1">
              <p class="font-bold text-slate-900">{{ order.shippingAddress.name }}</p>
              <p class="leading-snug">{{ order.shippingAddress.street }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zip }}</p>
              <p class="font-medium text-slate-800 pt-1">{{ order.shippingAddress.phone }}</p>
              @if (order.shippingAddress.email) {
                <p class="text-slate-500 truncate">{{ order.shippingAddress.email }}</p>
              }
            </div>
          </section>

          @if (order.staffNotes) {
            <section class="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Note</p>
              <p class="text-xs text-slate-700 leading-snug">{{ order.staffNotes }}</p>
            </section>
          }

          <!-- Bill summary -->
          <section class="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 space-y-1.5 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span class="font-semibold text-slate-800">{{ subtotal() | appCurrency }}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Courier</span>
              <span class="font-semibold text-slate-800">{{ shippingFee() | appCurrency }}</span>
            </div>
            <div class="flex justify-between pt-1.5 border-t border-slate-200">
              <span class="font-bold text-slate-800">Total ({{ order.paymentMethod }})</span>
              <span class="text-base font-serif font-bold text-[#5c2505]">{{ order.total | appCurrency }}</span>
            </div>
          </section>
        </div>
      </article>
    }
  `,
})
export class FulfillmentTicketComponent {
  readonly order = input.required<AdminOrder | null>();
  readonly close = output<void>();

  readonly itemCount = computed(() => {
    const o = this.order();
    if (!o) return 0;
    return o.items.reduce((sum, item) => sum + item.qty, 0);
  });

  readonly subtotal = computed(() => {
    const o = this.order();
    if (!o) return 0;
    return o.items.reduce((sum, item) => sum + this.lineTotal(item), 0);
  });

  readonly shippingFee = computed(() => {
    const o = this.order();
    return o?.shippingFee ?? SHIPPING_FEE;
  });

  lineTotal(item: { qty: number; price?: number }): number {
    return (item.price ?? 0) * item.qty;
  }

  statusBadgeClass(status: string): string {
    const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide';
    switch (status) {
      case 'Accepted':
        return `${base} bg-blue-400/20 text-blue-100`;
      case 'Shipped':
        return `${base} bg-indigo-400/20 text-indigo-100`;
      case 'Delivered':
        return `${base} bg-green-400/20 text-green-100`;
      case 'Cancelled':
        return `${base} bg-red-400/20 text-red-100`;
      default:
        return `${base} bg-amber-400/20 text-amber-100`;
    }
  }
}
