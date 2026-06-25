import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';

@Component({
  selector: 'app-order-summary',
  imports: [AppCurrencyPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 sticky top-24">
      <h3 class="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-200">Order Summary</h3>
      <div class="space-y-3 mb-4 text-sm text-slate-600">
        <div class="flex justify-between"><span>Subtotal ({{ cartService.cartCount() }} items)</span><span>{{ cartService.cartTotal() | appCurrency }}</span></div>
        <div class="flex justify-between"><span>Estimated Shipping</span><span>{{ cartService.shippingFee | appCurrency }}</span></div>
      </div>
      <div class="flex justify-between font-bold text-lg text-slate-800 mb-6 pt-4 border-t border-slate-200">
        <span>Total</span>
        <span>{{ cartService.orderTotal() | appCurrency }}</span>
      </div>
      @if (showCheckout()) {
        <a routerLink="/checkout" class="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center">
          Proceed to Checkout
        </a>
      }
      @if (showContinue()) {
        <a routerLink="/shop" class="w-full mt-3 text-sm text-center text-slate-500 hover:text-amber-600 font-medium py-2 block">
          Continue Shopping
        </a>
      }
      @if (submitLabel()) {
        <button type="button" (click)="submit.emit()" class="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md">
          {{ submitLabel() }}
        </button>
      }
    </div>
  `,
})
export class OrderSummaryComponent {
  readonly cartService = inject(CartService);
  readonly showCheckout = input(true);
  readonly showContinue = input(true);
  readonly submitLabel = input<string | null>(null);
  readonly submit = output<void>();
}
