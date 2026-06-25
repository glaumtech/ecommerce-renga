import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppCurrencyPipe } from '../../../shared/pipes/app-currency.pipe';
import { AdminOrder } from '../../../core/models/order.model';

@Component({
  selector: 'app-order-list',
  imports: [DatePipe, AppCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div class="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-serif font-bold text-slate-800">Latest Orders</h3>
        <span class="text-xs font-bold text-slate-500">{{ orders().length }} total</span>
      </div>
      <div class="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
        @for (order of orders(); track order.id) {
          <button
            type="button"
            (click)="selectOrder.emit(order.id)"
            class="w-full text-left p-4 cursor-pointer transition-colors flex justify-between items-start"
            [class]="selectedId() === order.id
              ? 'bg-amber-50/50 border-l-4 border-l-amber-600'
              : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'"
          >
            <div>
              <h4 class="font-bold text-slate-800 text-[14px]">{{ order.id }}</h4>
              <p class="text-xs text-slate-400 font-medium">{{ order.date | date:'mediumDate' }}</p>
              <p class="text-xs text-slate-500 font-medium mt-1 truncate max-w-[200px]">{{ order.shippingAddress.name }}</p>
            </div>
            <div class="text-right flex flex-col items-end">
              <span class="text-sm font-bold text-slate-800">{{ order.total | appCurrency }}</span>
              <span
                class="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full mt-2"
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
          </button>
        } @empty {
          <div class="p-8 text-center text-slate-400 text-sm">No orders yet.</div>
        }
      </div>
    </div>
  `,
})
export class OrderListComponent {
  readonly orders = input.required<AdminOrder[]>();
  readonly selectedId = input<string | null>(null);
  readonly selectOrder = output<string>();
}
