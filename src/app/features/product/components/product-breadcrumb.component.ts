import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-breadcrumb',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="mb-6" aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-y-1 list-none m-0 p-0 text-sm">
        <li class="inline-flex items-center">
          <a routerLink="/" class="text-slate-500 no-underline hover:text-orange-600 transition-colors">Home</a>
          <span class="mx-2 text-slate-300 select-none" aria-hidden="true">/</span>
        </li>
        <li class="inline-flex items-center">
          <a routerLink="/shop" class="text-slate-500 no-underline hover:text-orange-600 transition-colors">Shop</a>
          <span class="mx-2 text-slate-300 select-none" aria-hidden="true">/</span>
        </li>
        @if (product().category) {
          <li class="inline-flex items-center">
            <a
              [routerLink]="['/shop']"
              [queryParams]="{ category: product().category }"
              class="text-slate-500 no-underline hover:text-orange-600 transition-colors"
            >
              {{ product().category }}
            </a>
            <span class="mx-2 text-slate-300 select-none" aria-hidden="true">/</span>
          </li>
        }
        <li class="inline-flex items-center min-w-0 max-w-full">
          <span class="text-slate-800 font-medium truncate" aria-current="page">{{ product().name }}</span>
        </li>
      </ol>
    </nav>
  `,
})
export class ProductBreadcrumbComponent {
  readonly product = input.required<Product>();
}
