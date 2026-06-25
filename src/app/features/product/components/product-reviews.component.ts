import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-product-reviews',
  imports: [StarRatingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white border border-slate-200 rounded-xl p-6 lg:p-8">
      <h2 class="text-xl font-bold text-slate-900 mb-6">Customer Reviews</h2>

      <div class="flex flex-col sm:flex-row gap-8 mb-8">
        <div class="text-center sm:text-left">
          <p class="text-5xl font-bold text-slate-900">{{ product().rating }}</p>
          <app-star-rating [rating]="product().rating" [reviews]="product().reviews" />
          <p class="text-sm text-slate-500 mt-2">Based on {{ product().reviews }} reviews</p>
        </div>

        <div class="flex-1 space-y-2">
          @for (bar of distribution; track bar.stars) {
            <div class="flex items-center gap-3 text-sm">
              <span class="w-8 text-slate-600">{{ bar.stars }}★</span>
              <div class="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-orange-500 rounded-full" [style.width.%]="bar.percent"></div>
              </div>
              <span class="w-8 text-slate-400 text-right">{{ bar.percent }}%</span>
            </div>
          }
        </div>
      </div>

      <p class="text-sm text-slate-500 italic">Detailed reviews coming soon.</p>
    </div>
  `,
})
export class ProductReviewsComponent {
  readonly product = input.required<Product>();

  readonly distribution = [
    { stars: 5, percent: 72 },
    { stars: 4, percent: 18 },
    { stars: 3, percent: 6 },
    { stars: 2, percent: 3 },
    { stars: 1, percent: 1 },
  ];
}
