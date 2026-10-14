import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AppCurrencyPipe } from '../../pipes/app-currency.pipe';

type PriceSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<PriceSize, { price: string; meta: string }> = {
  sm: { price: 'text-sm', meta: 'text-xs' },
  md: { price: 'text-lg', meta: 'text-xs' },
  lg: { price: 'text-3xl', meta: 'text-base' },
};

@Component({
  selector: 'app-product-price',
  imports: [AppCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex flex-wrap items-baseline gap-x-2">
      <span class="font-bold text-slate-900" [class]="sizeClasses().price">{{ price() | appCurrency }}</span>
      @if (discountPercent() > 0) {
        <s class="text-slate-400" [class]="sizeClasses().meta">{{ mrp() | appCurrency }}</s>
        <span class="font-semibold text-green-600" [class]="sizeClasses().meta">({{ discountPercent() }}% off)</span>
      }
    </span>
  `,
})
export class ProductPriceComponent {
  readonly price = input.required<number>();
  readonly mrp = input<number | undefined>();
  readonly size = input<PriceSize>('md');

  readonly sizeClasses = computed(() => SIZE_CLASSES[this.size()]);

  readonly discountPercent = computed(() => {
    const mrp = this.mrp() ?? 0;
    const price = this.price();
    if (!(mrp > 0) || !(price < mrp)) {
      return 0;
    }
    return Math.round(((mrp - price) / mrp) * 100);
  });
}
