import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ALL_CATEGORY, Category } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { FiltersSidebarComponent } from '../../shared/components/filters-sidebar/filters-sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-shop',
  imports: [ProductCardComponent, FiltersSidebarComponent, LoadingSpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shop.component.html',
})
export class ShopComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = this.productService.loading;
  readonly error = this.productService.error;
  readonly searchQuery = signal('');
  readonly selectedCategory = signal(ALL_CATEGORY);

  readonly categoryTree = computed(() =>
    sortCategoryTreeByName(this.productService.categories())
  );

  readonly mobileCategoryOptions = computed(() => {
    const options = [ALL_CATEGORY];
    for (const main of this.categoryTree()) {
      options.push(main.name);
      for (const sub of main.subCategories ?? []) {
        options.push(sub.name);
      }
    }
    return options;
  });

  readonly filteredProducts = computed(() => this.productService.products());

  readonly showClearFilters = computed(
    () => this.selectedCategory() !== ALL_CATEGORY || !!this.searchQuery()
  );

  readonly filtersOpen = signal(false);

  ngOnInit(): void {
    this.productService.loadCategories();
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category');
      const q = params.get('q');
      if (category) {
        this.selectedCategory.set(category);
      }
      if (q) {
        this.searchQuery.set(q);
      }
      this.loadProducts();
    });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.updateQueryParams();
    this.loadProducts();
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  clearFilters(): void {
    this.selectedCategory.set(ALL_CATEGORY);
    this.searchQuery.set('');
    this.router.navigate(['/shop']);
    this.loadProducts();
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.updateQueryParams();
    this.loadProducts();
  }

  retry(): void {
    this.loadProducts();
  }

  addToCart(product: Parameters<CartService['addToCart']>[0]): void {
    this.cartService.addToCart(product);
  }

  private loadProducts(): void {
    this.productService.loadProducts({
      category: this.selectedCategory(),
      q: this.searchQuery(),
    });
  }

  private updateQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory() !== ALL_CATEGORY ? this.selectedCategory() : null,
        q: this.searchQuery() || null,
      },
      queryParamsHandling: 'merge',
    });
  }
}

function sortCategoryTreeByName(categories: Category[]): Category[] {
  const byName = (a: Category, b: Category) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

  return [...categories]
    .sort(byName)
    .map((main) => ({
      ...main,
      subCategories: [...(main.subCategories ?? [])].sort(byName),
    }));
}
