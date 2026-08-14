import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminVideoAdService } from '../../../core/services/admin-video-ad.service';
import { ProductService } from '../../../core/services/product.service';
import { StoreVideoAd } from '../../../core/models/video-ad.model';
import { Product } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { resolveProductImageUrl } from '../../../core/utils/product-image.util';

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

@Component({
  selector: 'app-admin-video-ads',
  imports: [FormsModule, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-serif font-bold text-slate-800">Video Ads</h2>
          <p class="text-slate-500 text-xs mt-1">Upload 9:16 product reels for the ecommerce homepage</p>
        </div>
        <button
          type="button"
          (click)="openCreate()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-sm"
        >
          Upload Reel
        </button>
      </div>

      @if (error()) {
        <div class="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200">{{ error() }}</div>
      }

      @if (loading()) {
        <app-loading-spinner message="Loading video ads..." />
      } @else if (ads().length === 0) {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center text-sm text-slate-500">
          No homepage reels yet. Upload a product video to show it above Explore by Category.
        </div>
      } @else {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-blue-600 text-white font-bold">
                  <th class="py-4 px-6">Reel</th>
                  <th class="py-4 px-6">Product</th>
                  <th class="py-4 px-6 text-center">Order</th>
                  <th class="py-4 px-6 text-center">Status</th>
                  <th class="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                @for (ad of ads(); track ad.id) {
                  <tr class="hover:bg-slate-50/50">
                    <td class="py-4 px-6">
                      <video
                        [src]="videoSrc(ad)"
                        class="h-28 w-[4.5rem] rounded-lg object-cover bg-slate-900"
                        preload="metadata"
                        muted
                        playsinline
                      ></video>
                    </td>
                    <td class="py-4 px-6">
                      <p class="font-bold text-slate-800">{{ ad.productName }}</p>
                      @if (ad.title && ad.title !== ad.productName) {
                        <p class="text-slate-400 mt-0.5">{{ ad.title }}</p>
                      }
                    </td>
                    <td class="py-4 px-6 text-center">{{ ad.sortOrder }}</td>
                    <td class="py-4 px-6 text-center">
                      <span
                        class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase"
                        [class]="ad.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'"
                      >
                        {{ ad.active ? 'Active' : 'Hidden' }}
                      </span>
                    </td>
                    <td class="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button type="button" (click)="openEdit(ad)" class="text-blue-600 font-bold hover:underline">
                        Edit
                      </button>
                      <button type="button" (click)="askDelete(ad)" class="text-red-600 font-bold hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    @if (showModal()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <h3 class="font-serif font-extrabold text-lg">{{ editingId() ? 'Edit Reel' : 'Upload Reel' }}</h3>
          @if (formError()) {
            <p class="text-xs text-red-600">{{ formError() }}</p>
          }

          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Product *</label>
            <input
              type="text"
              placeholder="Search published products..."
              class="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs mb-2"
              [ngModel]="productQuery()"
              (ngModelChange)="productQuery.set($event)"
            />
            @if (selectedProduct(); as product) {
              <div class="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <img [src]="product.image" [alt]="product.name" class="w-10 h-10 rounded-lg object-cover" />
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-bold text-slate-800 truncate">{{ product.name }}</p>
                  <p class="text-[10px] text-slate-400">{{ product.category }}</p>
                </div>
                <button type="button" class="text-[10px] font-bold text-slate-500" (click)="clearProduct()">Change</button>
              </div>
            } @else {
              <div class="max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50">
                @for (product of filteredProducts(); track product.id) {
                  <button
                    type="button"
                    class="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                    (click)="selectProduct(product)"
                  >
                    {{ product.name }}
                  </button>
                } @empty {
                  <p class="px-4 py-3 text-xs text-slate-400">No published products match that search.</p>
                }
              </div>
            }
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Video * <span class="normal-case font-medium text-slate-400">(MP4, MOV, WebM · 9:16 · max 100MB)</span>
            </label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm"
              class="w-full text-xs"
              (change)="onFileChange($event)"
            />
          </div>

          @if (previewUrl(); as url) {
            <div class="flex justify-center">
              <video
                [src]="url"
                class="h-64 w-36 rounded-2xl object-cover bg-slate-900"
                controls
                playsinline
                muted
              ></video>
            </div>
          }

          <div>
            <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Overlay title</label>
            <input
              class="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs"
              placeholder="Defaults to product name"
              [ngModel]="formTitle()"
              (ngModelChange)="formTitle.set($event)"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Sort order</label>
              <input
                type="number"
                min="0"
                class="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs"
                [ngModel]="formSort()"
                (ngModelChange)="formSort.set(+$event)"
              />
            </div>
            <label class="flex items-end gap-2 pb-3 text-xs font-semibold text-slate-700">
              <input type="checkbox" [ngModel]="formActive()" (ngModelChange)="formActive.set($event)" />
              Active on homepage
            </label>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" (click)="closeModal()" class="text-xs font-bold text-slate-500 px-4 py-2">Cancel</button>
            <button
              type="button"
              (click)="save()"
              [disabled]="saving()"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-5 rounded-xl"
            >
              {{ saving() ? 'Saving…' : editingId() ? 'Save changes' : 'Upload reel' }}
            </button>
          </div>
        </div>
      </div>
    }

    @if (deletingAd(); as ad) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 space-y-4">
          <h3 class="font-serif font-extrabold text-lg">Delete reel?</h3>
          <p class="text-xs text-slate-500">This removes the homepage video for {{ ad.productName }}.</p>
          <div class="flex justify-end gap-3">
            <button type="button" (click)="deletingAd.set(null)" class="text-xs font-bold text-slate-500 px-4 py-2">Cancel</button>
            <button
              type="button"
              (click)="confirmDelete()"
              [disabled]="saving()"
              class="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl"
            >
              {{ saving() ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class AdminVideoAdsComponent implements OnInit, OnDestroy {
  private readonly videoAdService = inject(AdminVideoAdService);
  private readonly productService = inject(ProductService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly ads = signal<StoreVideoAd[]>([]);

  readonly showModal = signal(false);
  readonly editingId = signal<number | null>(null);
  readonly formError = signal<string | null>(null);
  readonly formTitle = signal('');
  readonly formSort = signal(1);
  readonly formActive = signal(true);
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly productQuery = signal('');
  readonly selectedProduct = signal<Product | null>(null);
  readonly deletingAd = signal<StoreVideoAd | null>(null);

  readonly filteredProducts = computed(() => {
    const q = this.productQuery().trim().toLowerCase();
    const products = this.productService.products();
    if (!q) {
      return products.slice(0, 12);
    }
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 12);
  });

  ngOnInit(): void {
    this.load();
    this.productService.loadProducts();
  }

  ngOnDestroy(): void {
    this.revokePreview();
  }

  videoSrc(ad: StoreVideoAd): string {
    return resolveProductImageUrl(ad.videoUrl);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.videoAdService.list().subscribe({
      next: (ads) => {
        this.ads.set(ads);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err));
        this.loading.set(false);
      },
    });
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formError.set(null);
    this.formTitle.set('');
    this.formSort.set(this.ads().length + 1);
    this.formActive.set(true);
    this.selectedProduct.set(null);
    this.productQuery.set('');
    this.selectedFile.set(null);
    this.revokePreview();
    this.showModal.set(true);
  }

  openEdit(ad: StoreVideoAd): void {
    this.editingId.set(ad.id);
    this.formError.set(null);
    this.formTitle.set(ad.title === ad.productName ? '' : ad.title || '');
    this.formSort.set(ad.sortOrder);
    this.formActive.set(ad.active);
    this.selectedFile.set(null);
    this.productQuery.set('');
    const match = this.productService.products().find((p) => p.id === ad.productId);
    this.selectedProduct.set(
      match ?? {
        id: ad.productId,
        slug: ad.productSlug,
        name: ad.productName,
        price: 0,
        category: '',
        rating: 0,
        reviews: 0,
        image: ad.productImage || '',
        desc: '',
      }
    );
    this.revokePreview();
    this.previewUrl.set(this.videoSrc(ad));
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId.set(null);
    this.selectedFile.set(null);
    this.revokePreview();
  }

  selectProduct(product: Product): void {
    this.selectedProduct.set(product);
    this.productQuery.set('');
  }

  clearProduct(): void {
    this.selectedProduct.set(null);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.formError.set(null);
    if (!file) {
      this.selectedFile.set(null);
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      this.formError.set('Video must be less than 100MB');
      input.value = '';
      return;
    }
    if (file.type && !ACCEPTED_VIDEO_TYPES.includes(file.type) && file.type !== 'application/octet-stream') {
      this.formError.set('Only MP4, MOV, and WebM videos are allowed');
      input.value = '';
      return;
    }
    this.selectedFile.set(file);
    this.revokePreview();
    this.previewUrl.set(URL.createObjectURL(file));
  }

  save(): void {
    const product = this.selectedProduct();
    if (!product) {
      this.formError.set('Please choose a product');
      return;
    }
    if (!this.editingId() && !this.selectedFile()) {
      this.formError.set('Please choose a video file');
      return;
    }
    this.saving.set(true);
    this.formError.set(null);
    const payload = {
      itemId: product.id,
      title: this.formTitle().trim() || undefined,
      sortOrder: this.formSort(),
      active: this.formActive(),
    };
    const request = this.editingId()
      ? this.videoAdService.update(this.editingId()!, payload, this.selectedFile())
      : this.videoAdService.create(payload, this.selectedFile()!);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.load();
      },
      error: (err) => {
        this.formError.set(String(err));
        this.saving.set(false);
      },
    });
  }

  askDelete(ad: StoreVideoAd): void {
    this.deletingAd.set(ad);
  }

  confirmDelete(): void {
    const ad = this.deletingAd();
    if (!ad) {
      return;
    }
    this.saving.set(true);
    this.videoAdService.delete(ad.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.deletingAd.set(null);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.deletingAd.set(null);
        this.error.set(String(err));
      },
    });
  }

  private revokePreview(): void {
    const url = this.previewUrl();
    if (url?.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    this.previewUrl.set(null);
  }
}
