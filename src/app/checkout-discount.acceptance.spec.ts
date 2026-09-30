import { HttpClient, provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom, of, Subject } from 'rxjs';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { OrderService } from './core/services/order.service';
import { SeoService } from './core/services/seo.service';
import { StoreOfferService } from './core/services/store-offer.service';
import { CheckoutOfferEvaluation } from './core/models/offer.model';
import { BASE_SHIPPING_FEE } from './core/utils/shipping-fee.util';
import { AdminOffersComponent } from './features/admin/offers/admin-offers.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrderSummaryComponent } from './shared/components/order-summary/order-summary.component';
import { mockCartItem } from './testing/mock-cart-item';

/**
 * Maps ACCEPTANCE.md criteria to automated contracts (ecommerce-site).
 */
describe('checkout discount acceptance (ecommerce-site)', () => {
  it('happy path: checkout route exists separate from admin offers', () => {
    const shell = routes.find((r) => r.path === '');
    const checkout = shell?.children?.find((c) => c.path === 'checkout');
    expect(checkout).toBeDefined();
    expect(CheckoutComponent.name).toBe('CheckoutComponent');
    expect(AdminOffersComponent.name).toBe('AdminOffersComponent');
  });

  it('admin offers dashboard route remains registered (no admin regression)', () => {
    const adminRoute = routes.find((r) => r.path === 'admin');
    const dashboard = adminRoute?.children?.find((r) => r.path === 'dashboard');
    const offers = dashboard?.children?.find((r) => r.path === 'offers');
    expect(offers).toBeDefined();
  });

  it('README documents discount-change checkout summary (total before discount, finalAmount, total)', async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    }).compileComponents();
    const readme = await firstValueFrom(
      TestBed.inject(HttpClient).get('/README.md', { responseType: 'text' })
    );
    const readmeLower = readme.toLowerCase();
    expect(readmeLower).toContain('subtotal before discount');
    expect(readmeLower).toContain('total before discount');
    expect(readmeLower).toContain('finalamount');
    expect(readmeLower).toContain('not shown as its own summary row');
  });

  it('README documents evaluate-checkout, offerId on store orders, and server re-apply', async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    }).compileComponents();
    const readme = await firstValueFrom(
      TestBed.inject(HttpClient).get('/README.md', { responseType: 'text' })
    );
    expect(readme).toContain('evaluate-checkout');
    expect(readme).toContain('offerId');
    expect(readme).toContain('/api/store/orders');
    expect(readme.toLowerCase()).toContain('server');
  });

  describe('checkout UI and cart scope', () => {
    let fixture: ComponentFixture<CheckoutComponent>;
    let storeOfferService: jasmine.SpyObj<StoreOfferService>;

    beforeEach(async () => {
      const orderService = jasmine.createSpyObj<OrderService>(
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
      orderService.placeOrder.and.returnValue(
        of({ orderRef: 'ORD-1', orderDate: '2026-09-30', total: 140, status: 'Pending', items: [] })
      );

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

    it('checkout order summary shows Discount row and orderTotal formula inputs', () => {
      fixture.componentInstance.form.patchValue({ zipCode: '600001' });
      fixture.detectChanges();
      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain('Discount');
      expect(fixture.componentInstance.discountAmount()).toBe(20);
      expect(fixture.componentInstance.displayedSubtotalBeforeDiscount()).toBe(100);
      expect(fixture.componentInstance.orderTotal()).toBe(80 + BASE_SHIPPING_FEE);
    });

    it('shows offer evaluation loading hint while evaluate-checkout is in flight', () => {
      const pending = new Subject<CheckoutOfferEvaluation>();
      storeOfferService.evaluateCheckout.and.returnValue(pending.asObservable());
      const loadingFixture = TestBed.createComponent(CheckoutComponent);
      loadingFixture.detectChanges();
      expect(loadingFixture.nativeElement.textContent).toContain('Checking available offers');
      pending.complete();
    });
  });

  it('cart order summary does not reference checkout offer evaluation', async () => {
    const cartService = jasmine.createSpyObj<CartService>('CartService', [], {
      cartCount: signal(2),
      cartTotal: signal(200),
      shippingFee: BASE_SHIPPING_FEE,
      orderTotal: signal(200 + BASE_SHIPPING_FEE),
    });

    await TestBed.configureTestingModule({
      imports: [OrderSummaryComponent],
      providers: [provideRouter([]), { provide: CartService, useValue: cartService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderSummaryComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).not.toContain('Discount');
    expect(text).not.toContain('Total before discount');
    expect(text).not.toContain('Subtotal after discount');
    expect(text).not.toContain('Checking available offers');
    expect(text).toContain('Total');
    expect(OrderSummaryComponent.name).toBe('OrderSummaryComponent');
  });
});
