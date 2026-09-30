import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BASE_SHIPPING_FEE } from '../../core/utils/shipping-fee.util';
import { signal } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { SeoService } from '../../core/services/seo.service';
import { StoreOfferService } from '../../core/services/store-offer.service';
import { CheckoutOfferEvaluation } from '../../core/models/offer.model';
import { mockCartItem } from '../../testing/mock-cart-item';
import { CheckoutComponent } from './checkout.component';
import { Subject } from 'rxjs';

describe('CheckoutComponent', () => {
  let fixture: ComponentFixture<CheckoutComponent>;
  let orderService: jasmine.SpyObj<OrderService>;
  let storeOfferService: jasmine.SpyObj<StoreOfferService>;

  beforeEach(async () => {
    orderService = jasmine.createSpyObj<OrderService>(
      'OrderService',
      [
        'placeOrder',
        'loadAddressesByMobile',
        'setLookupMobile',
        'clearAddresses',
        'loadAddressesForCurrentUser',
      ],
      {
        loading: signal(false),
        addressesLoading: signal(false),
        savedAddresses: signal([]),
        error: signal(null),
        lookupMobile: signal(null),
      }
    );
    orderService.loadAddressesByMobile.and.returnValue(of([]));
    orderService.loadAddressesForCurrentUser.and.returnValue(of([]));
    orderService.placeOrder.and.returnValue(of({ orderRef: 'ORD-1', orderDate: '2026-09-30', total: 140, status: 'Pending', items: [] }));

    storeOfferService = jasmine.createSpyObj<StoreOfferService>('StoreOfferService', [
      'evaluateCheckout',
      'toCartLines',
    ]);
    storeOfferService.toCartLines.and.returnValue([{ productId: 1, quantity: 1, price: 100 }]);
    storeOfferService.evaluateCheckout.and.returnValue(
      of({
        applicableOffers: [],
        bestOfferId: 5,
        offerName: 'Summer Sale',
        originalAmount: 100,
        discountAmount: 20,
        finalAmount: 80,
      })
    );

    const cartService = jasmine.createSpyObj<CartService>('CartService', ['getCheckoutItems', 'clear'], {
      items: signal([mockCartItem({ id: 1, name: 'Item', price: 100, quantity: 1 })]),
      cartTotal: signal(100),
      cartCount: signal(1),
    });
    cartService.getCheckoutItems.and.returnValue([{ productId: 1, quantity: 1 }]);

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: cartService },
        { provide: OrderService, useValue: orderService },
        { provide: StoreOfferService, useValue: storeOfferService },
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => false, currentUser: () => null },
        },
        { provide: SeoService, useValue: { applyNoIndex: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    fixture.detectChanges();
  });

  it('AC-HP-2: totalBeforeDiscount matches displayed merchandise subtotal plus shipping', () => {
    fixture.componentInstance.form.patchValue({ zipCode: '600001' });
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    expect(cmp.totalBeforeDiscount()).toBe(cmp.displayedSubtotalBeforeDiscount() + cmp.shippingFee());
  });

  it('shows discount row when evaluation returns a discount', () => {
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Discount');
    expect(text).toContain('Summer Sale');
    expect(text).toContain('Total before discount');
    expect(text).not.toContain('Subtotal after discount');
    const beforeIdx = text.indexOf('Total before discount');
    const discountIdx = text.indexOf('Discount');
    const totalIdx = text.lastIndexOf('Total');
    expect(beforeIdx).toBeGreaterThan(-1);
    expect(beforeIdx).toBeLessThan(discountIdx);
    expect(discountIdx).toBeLessThan(totalIdx);
  });

  it('shows merchandise subtotal before discount and after discount from evaluation', () => {
    fixture.detectChanges();
    expect(fixture.componentInstance.displayedSubtotalBeforeDiscount()).toBe(100);
    expect(fixture.componentInstance.displayedSubtotalAfterDiscount()).toBe(80);
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Subtotal (1 items)');
  });

  it('orderTotal equals subtotal after discount plus shipping for entered PIN', () => {
    fixture.componentInstance.form.patchValue({ zipCode: '600001' });
    fixture.detectChanges();
    expect(fixture.componentInstance.discountAmount()).toBe(20);
    expect(fixture.componentInstance.displayedSubtotalBeforeDiscount()).toBe(100);
    expect(fixture.componentInstance.displayedSubtotalAfterDiscount()).toBe(80);
    expect(fixture.componentInstance.shippingFee()).toBe(BASE_SHIPPING_FEE);
    expect(fixture.componentInstance.orderTotal()).toBe(80 + BASE_SHIPPING_FEE);
  });

  it('calls evaluateCheckout with mobile when checkout mobile is set', () => {
    fixture.componentInstance.form.patchValue({ mobile: '9876543210' });
    fixture.detectChanges();
    expect(storeOfferService.evaluateCheckout).toHaveBeenCalled();
    const [mobile] = storeOfferService.evaluateCheckout.calls.mostRecent().args;
    expect(mobile).toBe('9876543210');
  });

  it('clears discount when offer evaluation fails', fakeAsync(() => {
    storeOfferService.evaluateCheckout.and.returnValue(throwError(() => new Error('fail')));
    const failFixture = TestBed.createComponent(CheckoutComponent);
    failFixture.detectChanges();
    tick();
    expect(failFixture.componentInstance.discountAmount()).toBe(0);
    expect(failFixture.componentInstance.selectedOfferId()).toBeNull();
    expect(failFixture.componentInstance.orderTotal()).toBe(
      failFixture.componentInstance.cartSubtotal() + failFixture.componentInstance.shippingFee()
    );
    expect(failFixture.nativeElement.textContent).not.toContain('Total before discount');
    expect(failFixture.nativeElement.textContent).not.toContain('Subtotal after discount');
  }));

  it('shows offer evaluation loading hint while evaluate-checkout is in flight', () => {
    const pending = new Subject<CheckoutOfferEvaluation>();
    storeOfferService.evaluateCheckout.and.returnValue(pending.asObservable());
    const loadingFixture = TestBed.createComponent(CheckoutComponent);
    loadingFixture.detectChanges();
    expect(loadingFixture.nativeElement.textContent).toContain('Checking available offers');
    expect(loadingFixture.nativeElement.textContent).not.toContain('Total before discount');
    expect(loadingFixture.nativeElement.textContent).not.toContain('Subtotal after discount');
    pending.complete();
  });

  it('hides discount rows when evaluate-checkout returns zero discount', () => {
    storeOfferService.evaluateCheckout.and.returnValue(
      of({
        applicableOffers: [],
        originalAmount: 100,
        discountAmount: 0,
        finalAmount: 100,
      })
    );
    const zeroFixture = TestBed.createComponent(CheckoutComponent);
    zeroFixture.detectChanges();
    const text = zeroFixture.nativeElement.textContent as string;
    expect(text).not.toContain('Total before discount');
    expect(text).not.toContain('Subtotal after discount');
    expect(zeroFixture.componentInstance.displayedSubtotalBeforeDiscount()).toBe(100);
  });

  it('prefers evaluation originalAmount over cart total when they differ', () => {
    storeOfferService.evaluateCheckout.and.returnValue(
      of({
        applicableOffers: [],
        bestOfferId: 1,
        offerName: 'Offer',
        originalAmount: 270,
        discountAmount: 13.5,
        finalAmount: 256.5,
      })
    );
    const diffFixture = TestBed.createComponent(CheckoutComponent);
    diffFixture.detectChanges();
    expect(diffFixture.componentInstance.displayedSubtotalBeforeDiscount()).toBe(270);
    expect(diffFixture.componentInstance.displayedSubtotalAfterDiscount()).toBe(256.5);
  });

  it('computes after-discount merchandise when finalAmount is omitted', () => {
    storeOfferService.evaluateCheckout.and.returnValue(
      of({
        applicableOffers: [],
        bestOfferId: 1,
        offerName: 'Offer',
        originalAmount: 100,
        discountAmount: 20,
        finalAmount: undefined as unknown as number,
      })
    );
    const fallbackFixture = TestBed.createComponent(CheckoutComponent);
    fallbackFixture.detectChanges();
    expect(fallbackFixture.componentInstance.displayedSubtotalAfterDiscount()).toBe(80);
  });

  it('includes offerId when placing order', () => {
    fixture.componentInstance.form.patchValue({
      firstName: 'A',
      lastName: 'B',
      mobile: '9876543210',
      streetAddress: '1 Main',
      city: 'Chennai',
      state: 'TN',
      zipCode: '600001',
    });
    fixture.componentInstance.handleCheckout();
    expect(orderService.placeOrder).toHaveBeenCalled();
    const payload = orderService.placeOrder.calls.mostRecent().args[0];
    expect(payload.offerId).toBe(5);
  });
});
