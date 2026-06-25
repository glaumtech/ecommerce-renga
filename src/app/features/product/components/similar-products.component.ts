import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { AppCurrencyPipe } from '../../../shared/pipes/app-currency.pipe';
import { ProductImagePipe } from '../../../shared/pipes/product-image.pipe';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../../core/utils/product-image.util';

@Component({
  selector: 'app-similar-products',
  imports: [RouterLink, AppCurrencyPipe, ProductImagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (products().length > 0) {
      <div class="bg-white border border-slate-200 rounded-xl p-6 lg:p-8">
        <h2 class="text-xl font-bold text-slate-900 mb-6">Similar Items</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          @for (product of products(); track product.id) {
            <a
              [routerLink]="['/', product.slug]"
              class="group block no-underline text-inherit border border-slate-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div class="aspect-square bg-slate-50 overflow-hidden">
                <img
                  [src]="product.image | productImage"
                  [alt]="product.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  (error)="onImageError($event)"
                />
              </div>
              <div class="p-3">
                <p class="text-xs font-medium text-slate-800 line-clamp-2 leading-tight mb-1">{{ product.name }}</p>
                <p class="text-sm font-bold text-slate-900">{{ product.price | appCurrency }}</p>
              </div>
            </a>
          }
        </div>
      </div>
    }
  `,
})
export class SimilarProductsComponent {
  readonly products = input.required<Product[]>();

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = PRODUCT_PLACEHOLDER_IMAGE;
  }
}
