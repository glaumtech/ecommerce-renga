import { ChangeDetectionStrategy, Component, OnDestroy, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { isReservedRoutePath } from '../../core/constants/reserved-routes';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { SeoService } from '../../core/services/seo.service';
import { StoreSeoService } from '../../core/services/store-seo.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ProductBreadcrumbComponent } from './components/product-breadcrumb.component';
import { ProductFaqComponent } from './components/product-faq.component';
import { ProductGalleryComponent } from './components/product-gallery.component';
import { ProductInfoComponent } from './components/product-info.component';
import { ProductTrustBadgesComponent } from './components/product-trust-badges.component';
import { SimilarProductsComponent } from './components/similar-products.component';

const SLUG_PATTERN = /^[a-z0-9_]+$/;

@Component({
  selector: 'app-product-detail',
  imports: [
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ProductBreadcrumbComponent,
    ProductGalleryComponent,
    ProductInfoComponent,
    ProductTrustBadgesComponent,
    ProductFaqComponent,
    SimilarProductsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnDestroy {
  readonly slug = input.required<string>();

  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);
  private readonly seoService = inject(SeoService);
  private readonly storeSeoService = inject(StoreSeoService);

  readonly selectedProduct = this.productService.selectedProduct;
  readonly detailLoading = this.productService.detailLoading;
  readonly detailError = this.productService.detailError;
  readonly similarProducts = this.productService.similarProducts;
  readonly quantity = signal(1);

  constructor() {
    effect(() => {
      const slug = this.slug();
      this.quantity.set(1);
      if (slug && isReservedRoutePath(slug)) {
        void this.router.navigate(['/', slug]);
        return;
      }
      if (!slug || !SLUG_PATTERN.test(slug)) {
        this.productService.clearSelectedProduct();
        this.productService.detailError.set('not-found');
        return;
      }
      const existing = this.selectedProduct();
      if (existing?.slug === slug) {
        this.seoService.applyProductSeo(existing, this.storeSeoService.settings());
        return;
      }
      this.productService.loadProductBySlug(slug, (product) => {
        if (product) {
          this.seoService.applyProductSeo(product, this.storeSeoService.settings());
        }
      });
    });

  }

  ngOnDestroy(): void {
    this.seoService.clearProductSeo(this.storeSeoService.settings());
    this.productService.clearSelectedProduct();
  }

  incrementQuantity(): void {
    this.quantity.update((q) => q + 1);
  }

  decrementQuantity(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addToCart(): void {
    const product = this.selectedProduct();
    if (!product) {
      return;
    }
    this.cartService.addToCart(product, this.quantity());
  }

  buyNow(): void {
    this.addToCart();
    void this.router.navigate(['/checkout']);
  }

  goToShop(): void {
    void this.router.navigate(['/shop']);
  }
}
