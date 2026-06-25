import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, Product } from '../models/product.model';
import { toUserFriendlyErrorMessage } from '../utils/api-error.util';
import { resolveProductImageUrl } from '../utils/product-image.util';
import { resolveCategoryImageUrl } from '../utils/category-image.util';

const PRODUCTS_LOAD_ERROR =
  'We could not find any products right now. Please try again in a moment.';
const PRODUCT_NOT_FOUND = 'Product not found';

interface StoreProductDto {
  id: number;
  slug?: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  mainCategory?: string;
  brand?: string;
  qty?: number;
  image?: string;
  media?: StoreProductMediaDto[];
  rating?: number;
  reviews?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoRobots?: string;
  ogImage?: string;
  canonicalUrl?: string;
  googleProductCategory?: string;
  gtin?: string;
  itemCondition?: string;
}

interface StoreProductMediaDto {
  id: number;
  url: string;
  mediaType?: string;
  primary?: boolean;
  sortOrder?: number;
}

interface StoreCategoryDto {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  subCategories?: StoreCategoryDto[];
}

export interface ProductFilters {
  category?: string;
  q?: string;
  maxPrice?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly storeUrl = `${environment.apiUrl}/api/store`;

  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly selectedProduct = signal<Product | null>(null);
  readonly detailLoading = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly similarProducts = signal<Product[]>([]);

  loadProducts(filters: ProductFilters = {}): void {
    this.loading.set(true);
    this.error.set(null);

    let params = new HttpParams();
    if (filters.category && filters.category !== 'All') {
      params = params.set('category', filters.category);
    }
    if (filters.q) {
      params = params.set('q', filters.q);
    }
    if (filters.maxPrice != null) {
      params = params.set('maxPrice', String(filters.maxPrice));
    }

    this.http
      .get<StoreProductDto[]>(`${this.storeUrl}/products`, { params })
      .pipe(
        map((items) => items.map((item) => this.mapProduct(item))),
        catchError((err) => {
          this.error.set(
            toUserFriendlyErrorMessage(err, PRODUCTS_LOAD_ERROR)
          );
          return of([] as Product[]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((products) => this.products.set(products));
  }

  loadCategories(): void {
    this.http
      .get<StoreCategoryDto[]>(`${this.storeUrl}/categories`)
      .pipe(catchError(() => of([] as StoreCategoryDto[])))
      .subscribe((categories) => this.categories.set(categories.map((c) => this.mapCategory(c))));
  }

  fetchProductBySlug(slug: string) {
    return this.http
      .get<StoreProductDto>(`${this.storeUrl}/products/by-slug/${encodeURIComponent(slug)}`)
      .pipe(map((dto) => this.mapProduct(dto)));
  }

  loadProductBySlug(slug: string, onLoaded?: (product: Product | null) => void): void {
    this.detailLoading.set(true);
    this.detailError.set(null);
    this.selectedProduct.set(null);
    this.similarProducts.set([]);

    this.fetchProductBySlug(slug)
      .pipe(
        catchError(() => {
          this.detailError.set(PRODUCT_NOT_FOUND);
          return of(null);
        }),
        finalize(() => this.detailLoading.set(false))
      )
      .subscribe((product) => {
        if (product) {
          this.selectedProduct.set(product);
          this.loadSimilarProducts(product.category, product.slug);
        }
        onLoaded?.(product);
      });
  }

  loadSimilarProducts(category: string, excludeSlug: string): void {
    const params = new HttpParams().set('category', category);

    this.http
      .get<StoreProductDto[]>(`${this.storeUrl}/products`, { params })
      .pipe(
        map((items) =>
          items
            .map((item) => this.mapProduct(item))
            .filter((p) => p.slug !== excludeSlug)
            .slice(0, 6)
        ),
        catchError(() => of([] as Product[]))
      )
      .subscribe((products) => this.similarProducts.set(products));
  }

  clearSelectedProduct(): void {
    this.selectedProduct.set(null);
    this.detailError.set(null);
    this.detailLoading.set(false);
    this.similarProducts.set([]);
  }

  private mapCategory(dto: StoreCategoryDto): Category {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      imageUrl: resolveCategoryImageUrl(dto.imageUrl),
      subCategories: (dto.subCategories ?? []).map((sub) => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
      })),
    };
  }

  private mapProduct(dto: StoreProductDto): Product {
    return {
      id: dto.id,
      slug: dto.slug || '',
      name: dto.name,
      price: Number(dto.price),
      category: dto.category || 'Uncategorized',
      mainCategory: dto.mainCategory,
      rating: dto.rating ?? 4.5,
      reviews: dto.reviews ?? 0,
      image: resolveProductImageUrl(dto.image),
      media: (dto.media ?? []).map((item) => ({
        id: item.id,
        url: resolveProductImageUrl(item.url),
        mediaType: item.mediaType === 'video' ? 'video' : 'image',
        primary: item.primary,
        sortOrder: item.sortOrder,
      })),
      desc: dto.description || '',
      brand: dto.brand,
      qty: dto.qty,
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      seoRobots: dto.seoRobots,
      ogImage: dto.ogImage ? resolveProductImageUrl(dto.ogImage) : undefined,
      canonicalUrl: dto.canonicalUrl,
      googleProductCategory: dto.googleProductCategory,
      gtin: dto.gtin,
      itemCondition: dto.itemCondition,
    };
  }
}
