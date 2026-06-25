import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-order-metrics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <p class="text-slate-400 text-[11px] uppercase tracking-wider font-extrabold mb-1">Pending Orders</p>
        <p class="text-3xl font-bold text-amber-600">{{ counts().Pending }}</p>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <p class="text-slate-400 text-[11px] uppercase tracking-wider font-extrabold mb-1">Accepted</p>
        <p class="text-3xl font-bold text-blue-600">{{ counts().Accepted }}</p>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <p class="text-slate-400 text-[11px] uppercase tracking-wider font-extrabold mb-1">Shipped</p>
        <p class="text-3xl font-bold text-indigo-600">{{ counts().Shipped }}</p>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <p class="text-slate-400 text-[11px] uppercase tracking-wider font-extrabold mb-1">Completed</p>
        <p class="text-3xl font-bold text-green-600">{{ counts().Delivered }}</p>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <p class="text-slate-400 text-[11px] uppercase tracking-wider font-extrabold mb-1">Cancelled</p>
        <p class="text-3xl font-bold text-red-600">{{ counts().Cancelled }}</p>
      </div>
    </div>
  `,
})
export class OrderMetricsComponent {
  readonly counts = input.required<{
    Pending: number;
    Accepted: number;
    Shipped: number;
    Delivered: number;
    Cancelled: number;
  }>();
}
