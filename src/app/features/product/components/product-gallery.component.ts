import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { Product, ProductMedia } from '../../../core/models/product.model';
import { PRODUCT_PLACEHOLDER_IMAGE } from '../../../core/utils/product-image.util';
import { ProductImagePipe } from '../../../shared/pipes/product-image.pipe';

@Component({
  selector: 'app-product-gallery',
  imports: [ProductImagePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div class="relative aspect-[4/3] bg-slate-50">
        @if (selectedMedia(); as media) {
          @if (media.mediaType === 'video') {
            <video
              [src]="media.url | productImage"
              class="w-full h-full object-cover"
              controls
              playsinline
              preload="metadata"
            ></video>
          } @else {
            <img
              [src]="media.url | productImage"
              [alt]="product().name"
              class="w-full h-full object-cover"
              (error)="onImageError()"
            />
          }
        } @else {
          <img
            [src]="displayImage() | productImage"
            [alt]="product().name"
            class="w-full h-full object-cover"
            (error)="onImageError()"
          />
        }
        <button
          type="button"
          class="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full border border-slate-200 text-slate-500 hover:text-orange-600 transition-colors"
          aria-label="Add to wishlist"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      @if (galleryItems().length > 1) {
        <div class="flex gap-2 p-3 border-t border-slate-200 overflow-x-auto">
          @for (item of galleryItems(); track item.id; let i = $index) {
            <button
              type="button"
              class="shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-colors"
              [class.border-orange-500]="selectedIndex() === i"
              [class.border-transparent]="selectedIndex() !== i"
              (click)="selectMedia(i)"
              [attr.aria-label]="item.mediaType === 'video' ? 'Product video ' + (i + 1) : 'Product image ' + (i + 1)"
            >
              @if (item.mediaType === 'video') {
                <div class="w-full h-full bg-slate-800 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"></path>
                  </svg>
                </div>
              } @else {
                <img
                  [src]="item.url | productImage"
                  [alt]="'Thumbnail ' + (i + 1)"
                  class="w-full h-full object-cover"
                />
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class ProductGalleryComponent {
  readonly product = input.required<Product>();
  private readonly imageFailed = signal(false);
  readonly selectedIndex = signal(0);

  readonly galleryItems = computed<ProductMedia[]>(() => {
    const media = this.product().media ?? [];
    if (media.length > 0) {
      return media;
    }
    const fallbackImage = this.product().image;
    if (!fallbackImage || this.imageFailed()) {
      return [];
    }
    return [{
      id: 0,
      url: fallbackImage,
      mediaType: 'image',
      primary: true,
      sortOrder: 0,
    }];
  });

  readonly selectedMedia = computed(() => {
    const items = this.galleryItems();
    if (items.length === 0) {
      return null;
    }
    const index = Math.min(this.selectedIndex(), items.length - 1);
    return items[index];
  });

  readonly displayImage = computed(() =>
    this.imageFailed() ? PRODUCT_PLACEHOLDER_IMAGE : this.product().image
  );

  constructor() {
    effect(() => {
      this.product();
      this.imageFailed.set(false);
      this.selectedIndex.set(0);
    });
  }

  selectMedia(index: number): void {
    this.selectedIndex.set(index);
    this.imageFailed.set(false);
  }

  onImageError(): void {
    this.imageFailed.set(true);
  }
}
