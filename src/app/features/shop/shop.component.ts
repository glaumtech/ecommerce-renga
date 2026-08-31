import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { combineLatest, distinctUntilChanged, filter, map } from 'rxjs';
import {
  CategoryHubSeo,
  getCategoryHubByName,
  getCategoryHubBySlug,
} from '../../core/constants/category-seo.constants';
import { ALL_CATEGORY, Category, Product } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { StoreSeoService } from '../../core/services/store-seo.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { FiltersSidebarComponent } from '../../shared/components/filters-sidebar/filters-sidebar.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

type ProductSortOption = 'name' | 'price';

interface ShopRouteState {
  hub: CategoryHubSeo | undefined;
  category: string;
  q: string;
}

@Component({
  selector: 'app-shop',
  imports: [ProductCardComponent, FiltersSidebarComponent, LoadingSpinnerComponent, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shop.component.html',
})
export class ShopComponent {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seoService = inject(SeoService);
  private readonly storeSeoService = inject(StoreSeoService);

  readonly loading = this.productService.loading;
  readonly error = this.productService.error;
  readonly searchQuery = signal('');
  readonly selectedCategory = signal(ALL_CATEGORY);
  readonly sortBy = signal<ProductSortOption>('name');
  readonly activeHub = signal(getCategoryHubBySlug(this.route.snapshot.paramMap.get('categorySlug') || ''));

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

  readonly filteredProducts = computed(() =>
    sortProducts(this.productService.products(), this.sortBy())
  );

  readonly showClearFilters = computed(
    () => this.selectedCategory() !== ALL_CATEGORY || !!this.searchQuery()
  );

  readonly filtersOpen = signal(false);

  constructor() {
    if (this.productService.categories().length === 0) {
      this.productService.loadCategories();
    }

    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(
        takeUntilDestroyed(),
        map(([params, query]) => this.resolveRouteState(params, query)),
        filter((state): state is ShopRouteState => state !== null),
        distinctUntilChanged((a, b) => a.category === b.category && a.q === b.q)
      )
      .subscribe((state) => {
        this.activeHub.set(state.hub);
        this.selectedCategory.set(state.category);
        this.searchQuery.set(state.q);
        this.applyPageSeo();
        this.loadProducts();
      });
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ProductSortOption;
    this.sortBy.set(value);
  }

  onCategoryChange(category: string): void {
    if (category === this.selectedCategory()) {
      this.filtersOpen.set(false);
      return;
    }

    this.filtersOpen.set(false);

    const hub = getCategoryHubByName(category);
    if (hub) {
      this.router.navigate(['/shop', hub.slug], {
        queryParams: this.searchQuery() ? { q: this.searchQuery() } : {},
      });
      return;
    }

    this.router.navigate(['/shop'], {
      queryParams: {
        category: category !== ALL_CATEGORY ? category : null,
        q: this.searchQuery() || null,
      },
    });
  }

  closeFilters(): void {
    this.filtersOpen.set(false);
  }

  clearFilters(): void {
    this.filtersOpen.set(false);
    this.router.navigate(['/shop']);
  }

  clearSearch(): void {
    this.updateQueryParams('');
  }

  retry(): void {
    this.loadProducts();
  }

  addToCart(product: Parameters<CartService['addToCart']>[0]): void {
    this.cartService.addToCart(product);
  }

  categoryHubLink(categoryName: string): (string | Record<string, string>)[] {
    const hub = getCategoryHubByName(categoryName);
    return hub ? ['/shop', hub.slug] : ['/shop'];
  }

  private resolveRouteState(params: ParamMap, query: ParamMap): ShopRouteState | null {
    const hubSlug = params.get('categorySlug') || '';
    const hub = getCategoryHubBySlug(hubSlug);
    const categoryParam = query.get('category');
    const q = query.get('q') || '';

    if (!hubSlug && categoryParam) {
      const categoryHub = getCategoryHubByName(categoryParam);
      if (categoryHub) {
        this.router.navigate(['/shop', categoryHub.slug], {
          queryParams: q ? { q } : {},
          replaceUrl: true,
        });
        return null;
      }
    }

    return {
      hub,
      category: hub?.categoryName ?? (categoryParam || ALL_CATEGORY),
      q,
    };
  }

  private loadProducts(): void {
    this.productService.loadProducts({
      category: this.selectedCategory(),
      q: this.searchQuery(),
    });
  }

  private applyPageSeo(): void {
    const settings = this.storeSeoService.settings();
    const hub = this.activeHub();
    if (hub) {
      this.seoService.applyCategoryHubSeo(hub, settings);
      return;
    }
    this.seoService.applyShopSeo(settings);
  }

  private updateQueryParams(searchQuery: string): void {
    const hub = this.activeHub();
    if (hub) {
      this.router.navigate(['/shop', hub.slug], {
        queryParams: { q: searchQuery || null },
      });
      return;
    }

    this.router.navigate(['/shop'], {
      queryParams: {
        category: this.selectedCategory() !== ALL_CATEGORY ? this.selectedCategory() : null,
        q: searchQuery || null,
      },
    });
  }
}

function sortProducts(products: Product[], sortBy: ProductSortOption): Product[] {
  const copy = [...products];
  if (sortBy === 'price') {
    return copy.sort((a, b) => a.price - b.price);
  }
  return copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
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
