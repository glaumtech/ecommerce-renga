import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { AdminOfferCatalogService } from '../../../core/services/admin-offer-catalog.service';
import { AdminOfferService } from '../../../core/services/admin-offer.service';
import {
  BrandOption,
  CategoryOption,
  CatalogItem,
  DISCOUNT_TYPE_INFO,
  DiscountType,
  OFFER_STATUS_INFO,
  OFFER_TYPE_INFO,
  Offer,
  OfferCreate,
  OfferStatistics,
  OfferType,
  ProductSelection,
  TARGET_AUDIENCE_INFO,
  TargetAudience,
} from '../../../core/models/offer.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

function toDatetimeLocalValue(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toApiDateTime(localValue: string): string {
  const d = new Date(localValue);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

@Component({
  selector: 'app-admin-offers',
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 class="text-3xl font-serif font-bold text-slate-800">Discounts, Offers &amp; Combo Pricing</h2>
          <p class="text-slate-500 text-xs mt-1">Create and manage promotional pricing strategies</p>
        </div>
        <button
          type="button"
          (click)="toggleForm()"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-sm"
        >
          {{ showForm() ? 'Cancel' : 'Create offer' }}
        </button>
      </div>

      @if (successMessage()) {
        <div class="bg-green-50 border border-green-100 text-green-800 text-sm font-semibold rounded-2xl p-4">
          {{ successMessage() }}
        </div>
      }
      @if (error()) {
        <div class="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold rounded-2xl p-4">
          {{ error() }}
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p class="text-slate-400 text-[10px] uppercase font-black tracking-wider">Total offers</p>
          <p class="text-3xl font-black text-slate-800">{{ stats().total }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p class="text-slate-400 text-[10px] uppercase font-black tracking-wider">Active</p>
          <p class="text-3xl font-black text-green-600">{{ stats().active }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p class="text-slate-400 text-[10px] uppercase font-black tracking-wider">Inactive</p>
          <p class="text-3xl font-black text-slate-500">{{ stats().inactive }}</p>
        </div>
      </div>

      @if (showForm()) {
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 class="text-lg font-bold text-slate-800">{{ isEditing() ? 'Edit offer' : 'Create new offer' }}</h3>
          <form [formGroup]="offerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="block text-xs font-bold text-slate-600">
                Offer name *
                <input formControlName="name" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </label>
              <label class="block text-xs font-bold text-slate-600">
                Offer type *
                <select formControlName="type" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                  <option [ngValue]="null">Select type</option>
                  @for (t of offerTypes; track t) {
                    <option [ngValue]="t">{{ OFFER_TYPE_INFO[t].label }}</option>
                  }
                </select>
              </label>
            </div>
            <label class="block text-xs font-bold text-slate-600">
              Description
              <textarea formControlName="description" rows="2" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"></textarea>
            </label>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="block text-xs font-bold text-slate-600">
                Discount type *
                <select formControlName="discountType" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                  <option [ngValue]="null">Select</option>
                  @for (d of discountTypes; track d) {
                    <option [ngValue]="d">{{ DISCOUNT_TYPE_INFO[d].label }}</option>
                  }
                </select>
              </label>
              <label class="block text-xs font-bold text-slate-600">
                Target audience
                <select formControlName="targetAudience" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                  @for (a of targetAudiences; track a) {
                    <option [ngValue]="a">{{ TARGET_AUDIENCE_INFO[a] }}</option>
                  }
                </select>
              </label>
            </div>

            @if (offerForm.get('type')?.value === OfferType.FLAT_DISCOUNT || offerForm.get('type')?.value === OfferType.CATEGORY_DISCOUNT || offerForm.get('type')?.value === OfferType.BRAND_DISCOUNT || offerForm.get('type')?.value === OfferType.CART_DISCOUNT) {
              <label class="block text-xs font-bold text-slate-600">
                Discount value *
                <input type="number" formControlName="discountValue" min="0.01" step="0.01" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </label>
            }
            @if (offerForm.get('type')?.value === OfferType.COMBO_OFFER) {
              <label class="block text-xs font-bold text-slate-600">
                Combo price *
                <input type="number" formControlName="comboPrice" min="0.01" step="0.01" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </label>
            }
            @if (offerForm.get('type')?.value === OfferType.BUY_X_GET_Y) {
              <div class="grid grid-cols-2 gap-4">
                <label class="block text-xs font-bold text-slate-600">
                  Buy quantity *
                  <input type="number" formControlName="buyQuantity" min="1" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </label>
                <label class="block text-xs font-bold text-slate-600">
                  Get quantity *
                  <input type="number" formControlName="getQuantity" min="1" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
                </label>
              </div>
            }
            @if (offerForm.get('type')?.value === OfferType.CATEGORY_DISCOUNT) {
              <label class="block text-xs font-bold text-slate-600">
                Category *
                <select formControlName="categoryId" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                  <option [ngValue]="null">Select category</option>
                  @for (c of categories(); track c.id) {
                    <option [ngValue]="c.id">{{ c.name }}</option>
                  }
                </select>
              </label>
            }
            @if (offerForm.get('type')?.value === OfferType.BRAND_DISCOUNT) {
              <label class="block text-xs font-bold text-slate-600">
                Brand *
                <select formControlName="brandId" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm">
                  <option [ngValue]="null">Select brand</option>
                  @for (b of brands(); track b.id) {
                    <option [ngValue]="b.id">{{ b.name }}</option>
                  }
                </select>
              </label>
            }
            @if (offerForm.get('type')?.value === OfferType.CART_DISCOUNT) {
              <label class="block text-xs font-bold text-slate-600">
                Minimum purchase (₹) *
                <input type="number" formControlName="minimumPurchaseAmount" min="0.01" step="0.01" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </label>
            }
            <label class="block text-xs font-bold text-slate-600">
              Maximum discount cap (₹, optional)
              <input type="number" formControlName="maximumDiscountAmount" min="0" step="0.01" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
            </label>

            @if (needsProducts()) {
              <div class="border border-slate-100 rounded-2xl p-4 space-y-3">
                <p class="text-xs font-black uppercase text-slate-500">Products</p>
                <div class="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search products..."
                    class="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                    [value]="productSearch()"
                    (input)="onProductSearchInput($event)"
                  />
                </div>
                @if (productResults().length) {
                  <ul class="max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y">
                    @for (p of productResults(); track p.id) {
                      <li>
                        <button type="button" class="w-full text-left px-3 py-2 text-xs hover:bg-slate-50" (click)="addProduct(p)">
                          {{ p.name }} @if (p.unit) { ({{ p.unit }}) }
                        </button>
                      </li>
                    }
                  </ul>
                }
                @for (sel of selectedProducts(); track sel.product.id; let i = $index) {
                  <div class="flex flex-wrap items-center gap-2 bg-slate-50 rounded-xl p-2 text-xs">
                    <span class="font-semibold">{{ sel.product.name }}</span>
                    <label class="flex items-center gap-1">
                      Qty
                      <input type="number" min="1" class="w-16 border rounded px-1" [value]="sel.quantity" (change)="updateProductQty(i, $event)" />
                    </label>
                    <label class="flex items-center gap-1">
                      <input type="checkbox" [checked]="sel.isFreeItem" (change)="toggleFreeItem(i, $event)" />
                      Free item
                    </label>
                    <button type="button" class="text-red-600 font-bold" (click)="removeProduct(i)">Remove</button>
                  </div>
                }
              </div>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="block text-xs font-bold text-slate-600">
                Start *
                <input type="datetime-local" formControlName="startDate" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </label>
              <label class="block text-xs font-bold text-slate-600">
                End *
                <input type="datetime-local" formControlName="endDate" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </label>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label class="block text-xs font-bold text-slate-600">
                Usage limit (total)
                <input type="number" formControlName="usageLimit" min="1" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </label>
              <label class="block text-xs font-bold text-slate-600">
                Per customer limit
                <input type="number" formControlName="usageLimitPerCustomer" min="1" class="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" />
              </label>
            </div>
            <label class="flex items-center gap-2 text-xs font-bold text-slate-600">
              <input type="checkbox" formControlName="isActive" />
              Active
            </label>
            <button
              type="submit"
              [disabled]="submitting()"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs py-3 px-6 rounded-xl"
            >
              {{ submitting() ? 'Saving…' : isEditing() ? 'Update offer' : 'Create offer' }}
            </button>
          </form>
        </div>
      }

      <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search offers..."
          class="flex-1 min-w-[200px] text-xs font-semibold focus:outline-none"
          [value]="searchQuery()"
          (input)="onSearchInput($event)"
        />
        <select class="text-xs border border-slate-200 rounded-xl px-3 py-2" [value]="typeFilter()" (change)="onTypeFilter($event)">
          <option value="">All types</option>
          @for (t of offerTypes; track t) {
            <option [value]="t">{{ OFFER_TYPE_INFO[t].label }}</option>
          }
        </select>
        <select class="text-xs border border-slate-200 rounded-xl px-3 py-2" [value]="statusFilter()" (change)="onStatusFilter($event)">
          <option value="">All statuses</option>
          @for (s of statusOptions; track s) {
            <option [value]="s">{{ OFFER_STATUS_INFO[s].label }}</option>
          }
        </select>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        <div class="space-y-3">
          @for (offer of filteredOffers(); track offer.id) {
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="font-bold text-slate-800">{{ offer.name }}</h4>
                    <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {{ OFFER_TYPE_INFO[offer.type].label }}
                    </span>
                    <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-900">
                      {{ OFFER_STATUS_INFO[offer.status]?.label || offer.status }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-1">{{ offer.displayText }}</p>
                  <p class="text-[10px] text-slate-400 mt-1">
                    {{ offer.startDate | date: 'medium' }} — {{ offer.endDate | date: 'medium' }}
                  </p>
                  @if (statsOfferId() === offer.id && offerStats()) {
                    <p class="text-xs text-slate-600 mt-2">
                      Uses: {{ offerStats()!.usageCount }} · Total discount: ₹{{ offerStats()!.totalDiscountGiven }}
                    </p>
                  }
                </div>
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg" (click)="loadStats(offer.id)">
                    Stats
                  </button>
                  <button type="button" class="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded-lg" (click)="editOffer(offer)">
                    Edit
                  </button>
                  <button type="button" class="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-2 rounded-lg" (click)="toggleStatus(offer)">
                    {{ offer.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button type="button" class="text-xs font-bold text-red-700 bg-red-50 px-3 py-2 rounded-lg" (click)="deleteOffer(offer)">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <p class="text-sm text-slate-500 text-center py-8">No offers found.</p>
          }
        </div>
      }
    </div>
  `,
})
export class AdminOffersComponent implements OnInit {
  private readonly offerService = inject(AdminOfferService);
  private readonly catalogService = inject(AdminOfferCatalogService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();
  private readonly productSearchSubject = new Subject<string>();

  readonly OfferType = OfferType;
  readonly OFFER_TYPE_INFO = OFFER_TYPE_INFO;
  readonly DISCOUNT_TYPE_INFO = DISCOUNT_TYPE_INFO;
  readonly TARGET_AUDIENCE_INFO = TARGET_AUDIENCE_INFO;
  readonly OFFER_STATUS_INFO = OFFER_STATUS_INFO;

  readonly offerTypes = Object.values(OfferType);
  readonly discountTypes = Object.values(DiscountType);
  readonly targetAudiences = Object.values(TargetAudience);
  readonly statusOptions = Object.keys(OFFER_STATUS_INFO);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly isEditing = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly offers = signal<Offer[]>([]);
  readonly searchQuery = signal('');
  readonly typeFilter = signal('');
  readonly statusFilter = signal('');

  readonly categories = signal<CategoryOption[]>([]);
  readonly brands = signal<BrandOption[]>([]);
  readonly productSearch = signal('');
  readonly productResults = signal<CatalogItem[]>([]);
  readonly selectedProducts = signal<ProductSelection[]>([]);

  readonly statsOfferId = signal<number | null>(null);
  readonly offerStats = signal<OfferStatistics | null>(null);

  readonly stats = computed(() => {
    const list = this.offers();
    return {
      total: list.length,
      active: list.filter((o) => o.isActive).length,
      inactive: list.filter((o) => !o.isActive).length,
    };
  });

  readonly filteredOffers = computed(() => {
    let list = [...this.offers()];
    const type = this.typeFilter();
    const status = this.statusFilter();
    if (type) {
      list = list.filter((o) => o.type === type);
    }
    if (status) {
      list = list.filter((o) => o.status === status);
    }
    return list;
  });

  offerForm!: FormGroup;

  ngOnInit(): void {
    this.offerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', Validators.maxLength(500)],
      type: [null, Validators.required],
      discountType: [null, Validators.required],
      discountValue: [null],
      comboPrice: [null],
      buyQuantity: [null],
      getQuantity: [null],
      minimumPurchaseAmount: [null],
      maximumDiscountAmount: [null],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      isActive: [true],
      targetAudience: [TargetAudience.ALL_CUSTOMERS],
      usageLimit: [null],
      usageLimitPerCustomer: [null],
      categoryId: [null],
      brandId: [null],
    });

    this.offerForm
      .get('type')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => {
        this.updateValidators(type as OfferType | null);
        if (type) {
          this.clearTypeSpecificFields(type as OfferType);
        }
      });

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => (q.trim() ? this.offerService.search(q.trim()) : this.offerService.getAll())),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (offers) => {
          this.offers.set(offers);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(String(err));
          this.loading.set(false);
        },
      });

    this.productSearchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => this.catalogService.searchProducts(q, 0, 30)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (items) => this.productResults.set(items),
        error: () => this.productResults.set([]),
      });

    this.loadOffers();
    this.catalogService.getCategoryOptions().subscribe({
      next: (c) => this.categories.set(c),
      error: () => {},
    });
    this.catalogService.getBrands().subscribe({
      next: (b) => this.brands.set(b),
      error: () => {},
    });
  }

  needsProducts(): boolean {
    const t = this.offerForm?.get('type')?.value;
    return t === OfferType.COMBO_OFFER || t === OfferType.BUY_X_GET_Y;
  }

  toggleForm(): void {
    if (this.showForm()) {
      this.resetForm();
      this.showForm.set(false);
    } else {
      this.showForm.set(true);
    }
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.loading.set(true);
    this.searchSubject.next(value);
  }

  onTypeFilter(event: Event): void {
    this.typeFilter.set((event.target as HTMLSelectElement).value);
  }

  onStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  onProductSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.productSearch.set(value);
    this.productSearchSubject.next(value);
  }

  addProduct(product: CatalogItem): void {
    if (this.selectedProducts().some((s) => s.product.id === product.id)) {
      return;
    }
    this.selectedProducts.update((list) => [
      ...list,
      { product, quantity: 1, isFreeItem: false },
    ]);
    this.productSearch.set('');
    this.productResults.set([]);
  }

  removeProduct(index: number): void {
    this.selectedProducts.update((list) => list.filter((_, i) => i !== index));
  }

  updateProductQty(index: number, event: Event): void {
    const qty = Number((event.target as HTMLInputElement).value);
    if (qty > 0) {
      this.selectedProducts.update((list) =>
        list.map((item, i) => (i === index ? { ...item, quantity: qty } : item))
      );
    }
  }

  toggleFreeItem(index: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedProducts.update((list) =>
      list.map((item, i) => (i === index ? { ...item, isFreeItem: checked } : item))
    );
  }

  editOffer(offer: Offer): void {
    this.isEditing.set(true);
    this.editingId.set(offer.id);
    this.showForm.set(true);
    this.offerForm.patchValue({
      name: offer.name,
      description: offer.description ?? '',
      type: offer.type,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      comboPrice: offer.comboPrice,
      buyQuantity: offer.buyQuantity,
      getQuantity: offer.getQuantity,
      minimumPurchaseAmount: offer.minimumPurchaseAmount,
      maximumDiscountAmount: offer.maximumDiscountAmount,
      startDate: toDatetimeLocalValue(offer.startDate),
      endDate: toDatetimeLocalValue(offer.endDate),
      isActive: offer.isActive,
      targetAudience: offer.targetAudience,
      usageLimit: offer.usageLimit,
      usageLimitPerCustomer: offer.usageLimitPerCustomer,
      categoryId: offer.categoryId,
      brandId: offer.brandId,
    });
    this.updateValidators(offer.type);
    if (offer.products?.length) {
      this.selectedProducts.set(
        offer.products.map((op) => ({
          product: {
            id: op.productId,
            name: op.productName ?? `Product #${op.productId}`,
            unit: op.unit,
          },
          quantity: op.requiredQuantity,
          isFreeItem: op.isFreeItem ?? false,
          discountedPrice: op.discountedPrice,
          discountPercentage: op.discountPercentage,
        }))
      );
    } else {
      this.selectedProducts.set([]);
    }
  }

  deleteOffer(offer: Offer): void {
    if (!confirm(`Delete offer "${offer.name}"?`)) {
      return;
    }
    this.offerService.delete(offer.id).subscribe({
      next: () => {
        this.flashSuccess('Offer deleted');
        this.loadOffers();
      },
      error: (err) => this.error.set(String(err)),
    });
  }

  toggleStatus(offer: Offer): void {
    this.offerService.toggleStatus(offer.id).subscribe({
      next: () => {
        this.flashSuccess('Offer status updated');
        this.loadOffers();
      },
      error: (err) => this.error.set(String(err)),
    });
  }

  loadStats(offerId: number): void {
    this.statsOfferId.set(offerId);
    this.offerService.getStatistics(offerId).subscribe({
      next: (s) => this.offerStats.set(s),
      error: (err) => this.error.set(String(err)),
    });
  }

  onSubmit(): void {
    if (this.offerForm.invalid) {
      this.offerForm.markAllAsTouched();
      return;
    }
    const v = this.offerForm.value;
    const payload: OfferCreate = {
      name: v.name,
      description: v.description || undefined,
      type: v.type,
      discountType: v.discountType,
      discountValue: v.discountValue ?? undefined,
      comboPrice: v.comboPrice ?? undefined,
      buyQuantity: v.buyQuantity ?? undefined,
      getQuantity: v.getQuantity ?? undefined,
      minimumPurchaseAmount: v.minimumPurchaseAmount ?? undefined,
      maximumDiscountAmount: v.maximumDiscountAmount ?? undefined,
      startDate: toApiDateTime(v.startDate),
      endDate: toApiDateTime(v.endDate),
      isActive: v.isActive,
      targetAudience: v.targetAudience,
      usageLimit: v.usageLimit ?? undefined,
      usageLimitPerCustomer: v.usageLimitPerCustomer ?? undefined,
      categoryId: v.categoryId ?? undefined,
      brandId: v.brandId ?? undefined,
      products: this.selectedProducts().map((sp) => ({
        productId: sp.product.id,
        requiredQuantity: sp.quantity,
        isFreeItem: sp.isFreeItem,
        discountedPrice: sp.discountedPrice,
        discountPercentage: sp.discountPercentage,
      })),
    };

    this.submitting.set(true);
    this.error.set(null);
    const id = this.editingId();
    const req$ = id ? this.offerService.update(id, payload) : this.offerService.create(payload);
    req$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.flashSuccess(id ? 'Offer updated' : 'Offer created');
        this.resetForm();
        this.showForm.set(false);
        this.loadOffers();
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(String(err));
      },
    });
  }

  private loadOffers(): void {
    this.loading.set(true);
    this.offerService.getAll().subscribe({
      next: (offers) => {
        this.offers.set(offers);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err));
        this.loading.set(false);
      },
    });
  }

  private resetForm(): void {
    this.offerForm.reset({
      isActive: true,
      targetAudience: TargetAudience.ALL_CUSTOMERS,
    });
    this.selectedProducts.set([]);
    this.isEditing.set(false);
    this.editingId.set(null);
  }

  private flashSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  private updateValidators(offerType: OfferType | null): void {
    const fields = [
      'discountValue',
      'comboPrice',
      'buyQuantity',
      'getQuantity',
      'minimumPurchaseAmount',
      'categoryId',
      'brandId',
    ];
    fields.forEach((f) => {
      this.offerForm.get(f)?.clearValidators();
      this.offerForm.get(f)?.updateValueAndValidity({ emitEvent: false });
    });
    if (!offerType) {
      return;
    }
    switch (offerType) {
      case OfferType.FLAT_DISCOUNT:
        this.offerForm.get('discountValue')?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case OfferType.COMBO_OFFER:
        this.offerForm.get('comboPrice')?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case OfferType.BUY_X_GET_Y:
        this.offerForm.get('buyQuantity')?.setValidators([Validators.required, Validators.min(1)]);
        this.offerForm.get('getQuantity')?.setValidators([Validators.required, Validators.min(1)]);
        break;
      case OfferType.CATEGORY_DISCOUNT:
        this.offerForm.get('categoryId')?.setValidators([Validators.required]);
        this.offerForm.get('discountValue')?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case OfferType.BRAND_DISCOUNT:
        this.offerForm.get('brandId')?.setValidators([Validators.required]);
        this.offerForm.get('discountValue')?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
      case OfferType.CART_DISCOUNT:
        this.offerForm.get('minimumPurchaseAmount')?.setValidators([Validators.required, Validators.min(0.01)]);
        this.offerForm.get('discountValue')?.setValidators([Validators.required, Validators.min(0.01)]);
        break;
    }
    fields.forEach((f) => this.offerForm.get(f)?.updateValueAndValidity({ emitEvent: false }));
  }

  private clearTypeSpecificFields(currentType: OfferType): void {
    const allFields: Record<OfferType, string[]> = {
      [OfferType.FLAT_DISCOUNT]: ['comboPrice', 'buyQuantity', 'getQuantity', 'categoryId', 'brandId', 'minimumPurchaseAmount'],
      [OfferType.COMBO_OFFER]: ['discountValue', 'buyQuantity', 'getQuantity', 'categoryId', 'brandId', 'minimumPurchaseAmount'],
      [OfferType.BUY_X_GET_Y]: ['discountValue', 'comboPrice', 'categoryId', 'brandId', 'minimumPurchaseAmount'],
      [OfferType.CATEGORY_DISCOUNT]: ['comboPrice', 'buyQuantity', 'getQuantity', 'brandId', 'minimumPurchaseAmount'],
      [OfferType.BRAND_DISCOUNT]: ['comboPrice', 'buyQuantity', 'getQuantity', 'categoryId', 'minimumPurchaseAmount'],
      [OfferType.CART_DISCOUNT]: ['comboPrice', 'buyQuantity', 'getQuantity', 'categoryId', 'brandId'],
    };
    for (const field of allFields[currentType] ?? []) {
      this.offerForm.get(field)?.setValue(null, { emitEvent: false });
    }
    if (currentType !== OfferType.COMBO_OFFER && currentType !== OfferType.BUY_X_GET_Y) {
      this.selectedProducts.set([]);
    }
  }
}
