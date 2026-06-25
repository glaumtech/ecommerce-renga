import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
@Component({
  selector: 'app-product-card',
  imports: [RouterLink, AppCurrencyPipe, ProductImagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-100 transition-all duration-300 group flex flex-col h-full">
      <a
        [routerLink]="product().slug ? ['/', product().slug] : ['/shop']"
        class="block no-underline text-inherit hover:no-underline"
      >
        <div class="relative aspect-[4/3] overflow-hidden bg-slate-50">
          <img [src]="product().image | productImage" [alt]="product().name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          @if (product().rating >= 4.8) {
            <span class="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">Bestseller</span>
          }
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <p class="text-xs text-amber-600 font-semibold mb-1 uppercase tracking-wider">{{ product().category }}</p>
          @if (product().brand) {
            <p class="text-xs text-slate-500 font-medium mb-1">{{ product().brand }}</p>
          }
          <h4 class="my-0 font-semibold text-slate-800 line-clamp-2 leading-tight flex-grow">{{ product().name }}</h4>
        </div>
      </a>
      <div class="px-5 pb-2.5 flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
 
        <span class="text-lg font-bold text-slate-900">{{ product().price | appCurrency }}</span>
        <button
          (click)="onAddToCart($event)"
          class="flex items-center justify-center bg-slate-900 hover:bg-amber-600 text-white p-2.5 rounded-lg transition-colors"
          title="Add to cart"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </button>
      </div>
    </div>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly addToCart = output<Product>();

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }
}
