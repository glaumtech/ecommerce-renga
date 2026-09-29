import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminOfferCatalogService } from '../../../core/services/admin-offer-catalog.service';
import { AdminOfferService } from '../../../core/services/admin-offer.service';
import {
  DiscountType,
  Offer,
  OfferStatistics,
  OfferType,
  TargetAudience,
} from '../../../core/models/offer.model';
import { AdminOffersComponent } from './admin-offers.component';
import { OFFER_TYPE_INFO } from '../../../core/models/offer.model';

describe('AdminOffersComponent (acceptance)', () => {
  let fixture: ComponentFixture<AdminOffersComponent>;
  let offerService: jasmine.SpyObj<AdminOfferService>;
  let catalogService: jasmine.SpyObj<AdminOfferCatalogService>;

  const sampleOffer: Offer = {
    id: 1,
    name: 'Summer Sale',
    type: OfferType.FLAT_DISCOUNT,
    discountType: DiscountType.PERCENTAGE,
    discountValue: 10,
    startDate: '2026-06-01T00:00:00',
    endDate: '2026-08-01T00:00:00',
    isActive: true,
    targetAudience: TargetAudience.ALL_CUSTOMERS,
    usageCount: 0,
    createdAt: '2026-01-01T00:00:00',
    updatedAt: '2026-01-01T00:00:00',
    status: 'ACTIVE',
    canBeUsed: true,
    displayText: '10% off',
  };

  const inactiveOffer: Offer = {
    ...sampleOffer,
    id: 2,
    name: 'Winter Pause',
    isActive: false,
    status: 'INACTIVE',
    displayText: 'Inactive',
  };

  beforeEach(async () => {
    offerService = jasmine.createSpyObj<AdminOfferService>('AdminOfferService', [
      'getAll',
      'search',
      'create',
      'update',
      'delete',
      'toggleStatus',
      'getStatistics',
    ]);
    catalogService = jasmine.createSpyObj<AdminOfferCatalogService>('AdminOfferCatalogService', [
      'getCategoryOptions',
      'getBrands',
      'searchProducts',
    ]);

    offerService.getAll.and.returnValue(of([sampleOffer, inactiveOffer]));
    offerService.search.and.returnValue(of([sampleOffer]));
    catalogService.getCategoryOptions.and.returnValue(of([{ id: 5, name: 'Herbal', level: 'MAIN' }]));
    catalogService.getBrands.and.returnValue(of([{ id: 3, name: 'Ananda' }]));
    catalogService.searchProducts.and.returnValue(of([{ id: 99, name: 'Dhoop', unit: 'pkt' }]));

    await TestBed.configureTestingModule({
      imports: [AdminOffersComponent],
      providers: [
        { provide: AdminOfferService, useValue: offerService },
        { provide: AdminOfferCatalogService, useValue: catalogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminOffersComponent);
    fixture.detectChanges();
  });

  function el(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('shows page title and offer list fields from GET /api/offers', () => {
    expect(el().textContent).toContain('Discounts, Offers & Combo Pricing');
    expect(el().textContent).toContain('Summer Sale');
    expect(el().textContent).toContain(OFFER_TYPE_INFO[OfferType.FLAT_DISCOUNT].label);
    expect(el().textContent).toContain('Active');
    expect(el().textContent).toContain('10% off');
  });

  it('computes stats total, active, and inactive from loaded offers', () => {
    expect(el().textContent).toContain('Total offers');
    const component = fixture.componentInstance;
    expect(component.stats().total).toBe(2);
    expect(component.stats().active).toBe(1);
    expect(component.stats().inactive).toBe(1);
  });

  it('shows error banner when initial load fails', () => {
    offerService.getAll.and.returnValue(throwError(() => 'Load failed'));
    fixture = TestBed.createComponent(AdminOffersComponent);
    fixture.detectChanges();
    expect(el().textContent).toContain('Load failed');
  });

  it('opens create form with base fields', () => {
    fixture.componentInstance.toggleForm();
    fixture.detectChanges();
    const text = el().textContent ?? '';
    expect(text).toContain('Offer name');
    expect(text).toContain('Offer type');
    expect(text).toContain('Discount type');
    expect(text).toContain('Target audience');
    expect(text).toContain('Active');
  });

  it('submits CART_DISCOUNT create with ISO-style dates via POST contract', () => {
    offerService.create.and.returnValue(of(sampleOffer));
    offerService.getAll.calls.reset();
    offerService.getAll.and.returnValue(of([sampleOffer]));

    const component = fixture.componentInstance;
    component.toggleForm();
    component.offerForm.patchValue({
      name: 'New Offer',
      type: OfferType.CART_DISCOUNT,
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 50,
      minimumPurchaseAmount: 500,
      startDate: '2026-07-01T10:00',
      endDate: '2026-07-31T23:59',
      isActive: true,
      targetAudience: TargetAudience.ALL_CUSTOMERS,
    });
    component.onSubmit();

    expect(offerService.create).toHaveBeenCalled();
    const dto = offerService.create.calls.mostRecent().args[0];
    expect(dto.name).toBe('New Offer');
    expect(dto.type).toBe(OfferType.CART_DISCOUNT);
    expect(dto.minimumPurchaseAmount).toBe(500);
    expect(dto.startDate).toContain('2026-07-01');
    expect(offerService.getAll).toHaveBeenCalled();
  });

  it('calls PUT on edit submit', () => {
    offerService.update.and.returnValue(of(sampleOffer));
    const component = fixture.componentInstance;
    component.editOffer(sampleOffer);
    component.offerForm.patchValue({ name: 'Renamed Summer' });
    component.onSubmit();
    expect(offerService.update).toHaveBeenCalledWith(1, jasmine.objectContaining({ name: 'Renamed Summer' }));
  });

  it('calls toggleStatus when activating/deactivating', () => {
    offerService.toggleStatus.and.returnValue(of(inactiveOffer));
    fixture.componentInstance.toggleStatus(sampleOffer);
    expect(offerService.toggleStatus).toHaveBeenCalledWith(1);
  });

  it('calls delete when confirm accepted', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    offerService.delete.and.returnValue(of({ message: 'ok' }));
    fixture.componentInstance.deleteOffer(sampleOffer);
    expect(offerService.delete).toHaveBeenCalledWith(1);
  });

  it('does not delete when confirm dismissed', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    fixture.componentInstance.deleteOffer(sampleOffer);
    expect(offerService.delete).not.toHaveBeenCalled();
  });

  it('loads statistics when Stats is requested', () => {
    const stats: OfferStatistics = {
      offerId: 1,
      offerName: 'Summer Sale',
      usageCount: 4,
      totalDiscountGiven: 120,
      averageDiscountPerUse: 30,
    };
    offerService.getStatistics.and.returnValue(of(stats));
    fixture.componentInstance.loadStats(1);
    fixture.detectChanges();
    expect(offerService.getStatistics).toHaveBeenCalledWith(1);
    expect(el().textContent).toContain('Uses: 4');
    expect(el().textContent).toContain('120');
  });

  it('does not call create when form is invalid', () => {
    const component = fixture.componentInstance;
    component.toggleForm();
    component.onSubmit();
    expect(offerService.create).not.toHaveBeenCalled();
  });

  it('shows API error on failed create', () => {
    offerService.create.and.returnValue(throwError(() => 'Name already exists'));
    const component = fixture.componentInstance;
    component.toggleForm();
    component.offerForm.patchValue({
      name: 'Dup',
      type: OfferType.FLAT_DISCOUNT,
      discountType: DiscountType.PERCENTAGE,
      discountValue: 5,
      startDate: '2026-07-01T10:00',
      endDate: '2026-07-31T23:59',
    });
    component.onSubmit();
    fixture.detectChanges();
    expect(el().textContent).toContain('Name already exists');
  });

  it('debounces search to GET /api/offers/search', fakeAsync(() => {
    offerService.search.calls.reset();
    fixture.componentInstance.onSearchInput({ target: { value: 'summer' } } as unknown as Event);
    tick(300);
    expect(offerService.search).toHaveBeenCalledWith('summer');
  }));

  it('reloads full list when search cleared', fakeAsync(() => {
    offerService.getAll.calls.reset();
    fixture.componentInstance.onSearchInput({ target: { value: '' } } as unknown as Event);
    tick(300);
    expect(offerService.getAll).toHaveBeenCalled();
  }));

  it('filters list by offer type client-side', () => {
    const component = fixture.componentInstance;
    component.onTypeFilter({ target: { value: OfferType.FLAT_DISCOUNT } } as unknown as Event);
    fixture.detectChanges();
    expect(component.filteredOffers().every((o) => o.type === OfferType.FLAT_DISCOUNT)).toBe(true);
  });

  it('filters list by status client-side', () => {
    const component = fixture.componentInstance;
    component.onStatusFilter({ target: { value: 'INACTIVE' } } as unknown as Event);
    fixture.detectChanges();
    expect(component.filteredOffers()).toEqual([inactiveOffer]);
  });

  describe('offer type form sections', () => {
    it('requires discount value for FLAT_DISCOUNT', () => {
      const component = fixture.componentInstance;
      component.toggleForm();
      component.offerForm.patchValue({
        name: 'Flat',
        type: OfferType.FLAT_DISCOUNT,
        discountType: DiscountType.PERCENTAGE,
        startDate: '2026-07-01T10:00',
        endDate: '2026-07-31T23:59',
      });
      component.onSubmit();
      expect(offerService.create).not.toHaveBeenCalled();
    });

    it('shows combo price and product search for COMBO_OFFER', () => {
      const component = fixture.componentInstance;
      component.toggleForm();
      component.offerForm.patchValue({ type: OfferType.COMBO_OFFER });
      fixture.detectChanges();
      expect(el().textContent).toContain('Combo price');
      expect(el().textContent).toContain('Products');
    });

    it('shows buy/get quantities and products for BUY_X_GET_Y', () => {
      const component = fixture.componentInstance;
      component.toggleForm();
      component.offerForm.patchValue({ type: OfferType.BUY_X_GET_Y });
      fixture.detectChanges();
      expect(el().textContent).toContain('Buy quantity');
      expect(el().textContent).toContain('Get quantity');
    });

    it('shows category select for CATEGORY_DISCOUNT', () => {
      const component = fixture.componentInstance;
      component.toggleForm();
      component.offerForm.patchValue({ type: OfferType.CATEGORY_DISCOUNT });
      fixture.detectChanges();
      expect(el().textContent).toContain('Category');
      expect(el().textContent).toContain('Herbal');
    });

    it('shows brand select for BRAND_DISCOUNT', () => {
      const component = fixture.componentInstance;
      component.toggleForm();
      component.offerForm.patchValue({ type: OfferType.BRAND_DISCOUNT });
      fixture.detectChanges();
      expect(el().textContent).toContain('Brand');
      expect(el().textContent).toContain('Ananda');
    });

    it('shows minimum purchase for CART_DISCOUNT', () => {
      const component = fixture.componentInstance;
      component.toggleForm();
      component.offerForm.patchValue({ type: OfferType.CART_DISCOUNT });
      fixture.detectChanges();
      expect(el().textContent).toContain('Minimum purchase');
    });

    it('debounces product search to catalog service', fakeAsync(() => {
      const component = fixture.componentInstance;
      component.toggleForm();
      component.offerForm.patchValue({ type: OfferType.COMBO_OFFER });
      catalogService.searchProducts.calls.reset();
      component.onProductSearchInput({ target: { value: 'dhoop' } } as unknown as Event);
      tick(300);
      expect(catalogService.searchProducts).toHaveBeenCalledWith('dhoop', 0, 30);
    }));
  });
});
