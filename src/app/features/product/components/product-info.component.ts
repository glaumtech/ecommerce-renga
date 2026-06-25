import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { AppCurrencyPipe } from '../../../shared/pipes/app-currency.pipe';
@Component({
  selector: 'app-product-info',
  imports: [AppCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white border border-slate-200 rounded-xl p-6 lg:p-8">
      @if (product().brand) {
        <p class="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-2">{{ product().brand }}</p>
      }
      <h1 class="text-2xl lg:text-3xl font-bold text-slate-900 mb-6 leading-tight">{{ product().name }}</h1>

      <div class="mb-4">
        <span class="text-3xl font-bold text-slate-900">{{ product().price | appCurrency }}</span>
        <span class="text-sm text-slate-500 ml-2">Inclusive of all taxes</span>
      </div>

      @if (product().desc) {
        <p class="text-slate-600 text-sm leading-relaxed mb-6">{{ product().desc }}</p>
      }

      <div class="flex items-center gap-4 mb-6">
        <span class="text-sm font-medium text-slate-700">Quantity</span>
        <div class="flex items-center border border-slate-200 rounded-lg overflow-hidden">
          <button
            type="button"
            (click)="decrement.emit()"
            class="px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span class="px-4 py-2 text-sm font-semibold text-slate-900 min-w-[3rem] text-center">{{ quantity() }}</span>
          <button
            type="button"
            (click)="increment.emit()"
            class="px-3 py-2 text-slate-600 hover:bg-slate-50 transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        @if (product().qty != null && product().qty! > 0) {
          <span class="text-sm text-green-600 font-medium">In stock</span>
        } @else {
          <span class="text-sm text-red-600 font-medium">Out of stock</span>
        }
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          (click)="buyNow.emit()"
          [disabled]="!inStock()"
          class="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Buy Now
        </button>
        <button
          type="button"
          (click)="addToCart.emit()"
          [disabled]="!inStock()"
          class="flex-1 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  `,
})
export class ProductInfoComponent {
  readonly product = input.required<Product>();
  readonly quantity = input(1);
  readonly increment = output<void>();
  readonly decrement = output<void>();
  readonly addToCart = output<void>();
  readonly buyNow = output<void>();

  inStock(): boolean {
    const qty = this.product().qty;
    return qty == null || qty > 0;
  }
}
