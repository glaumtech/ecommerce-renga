import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCardComponent, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);

  readonly loading = this.productService.loading;
  readonly featuredProducts = computed(() => this.productService.products().slice(0, 4));

  readonly categoryHighlights = computed(() => {
    const mains = this.productService.categories();
    return mains.slice(0, 3).map((main) => ({
      id: main.id,
      title: main.name,
      img: main.imageUrl || '',
      desc: main.description || 'Explore our curated collection.',
    }));
  });

  ngOnInit(): void {
    this.productService.loadCategories();
    this.productService.loadProducts();
  }

  addToCart(product: Parameters<CartService['addToCart']>[0]): void {
    this.cartService.addToCart(product);
  }
}
