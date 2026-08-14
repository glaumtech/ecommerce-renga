import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getCategoryHubByName } from '../../core/constants/category-seo.constants';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { VideoAdService } from '../../core/services/video-ad.service';
import { CategoryCarouselComponent } from '../../shared/components/category-carousel/category-carousel.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { VideoAdsCarouselComponent } from '../../shared/components/video-ads-carousel/video-ads-carousel.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CategoryCarouselComponent, ProductCardComponent, LoadingSpinnerComponent, VideoAdsCarouselComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly videoAdService = inject(VideoAdService);

  readonly loading = this.productService.loading;
  readonly featuredProducts = computed(() => this.productService.products().slice(0, 4));
  readonly videoAds = this.videoAdService.ads;

  readonly categoryHighlights = computed(() =>
    this.productService.categories().map((main) => {
      const hub = getCategoryHubByName(main.name);
      return {
        id: main.id,
        title: main.name,
        img: main.imageUrl || '',
        desc: main.description || 'Explore our curated collection.',
        hubSlug: hub?.slug,
        imageAlt: hub?.imageAlt || `${main.name} products`,
      };
    })
  );

  ngOnInit(): void {
    this.productService.loadCategories();
    this.productService.loadProducts();
    this.videoAdService.load();
  }

  addToCart(product: Parameters<CartService['addToCart']>[0]): void {
    this.cartService.addToCart(product);
  }
}
