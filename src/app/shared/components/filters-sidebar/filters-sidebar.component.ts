import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ALL_CATEGORY, Category } from '../../../core/models/product.model';

@Component({
  selector: 'app-filters-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filters-sidebar.component.html',
})
export class FiltersSidebarComponent {
  readonly allCategory = ALL_CATEGORY;
  readonly categoryTree = input<Category[]>([]);
  readonly selectedCategory = input('All');
  readonly showClear = input(false);
  /** When false, drops sticky positioning and outer card chrome (e.g. mobile drawer). */
  readonly sticky = input(true);
  readonly categoryChange = output<string>();
  readonly clearFilters = output<void>();
}
