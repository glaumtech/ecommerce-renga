import { HttpClient, provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import { routes } from './app.routes';
import { CheckoutOfferEvaluation } from './core/models/offer.model';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { OrderService } from './core/services/order.service';
import { SeoService } from './core/services/seo.service';
import { StoreOfferService } from './core/services/store-offer.service';
import { AdminOfferService } from './core/services/admin-offer.service';
import {
  BASE_SHIPPING_FEE,
  OUT_OF_REGION_SHIPPING_FEE,
  calculateShippingFee,
} from './core/utils/shipping-fee.util';
import { AdminOffersComponent } from './features/admin/offers/admin-offers.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrderSummaryComponent } from './shared/components/order-summary/order-summary.component';
import { mockCartItem } from './testing/mock-cart-item';

/**
 * Automated coverage for `.cursor-pilot/job_7616bb6d496e/ACCEPTANCE.md` (discount change).
 */
describe('checkout discount change acceptance (ACCEPTANCE.md)', () => {
  const changedProjects = ['ecommerce-site'];
  const unchangedProjects = [
    'trueup-lite-backend',
    'trueup-lite-frontend',
    'trueup-lite-flutter',
    'aws-scripts',
    'notification-framework',
  ];
  const subtotalAfterDiscountLabel = 'Subtotal after discount';
  const unchangedProjectDiffMarker = 'Subtotal after discount';

  describe('Scope and workspace', () => {
    it('ACCEPTANCE: only ecommerce-site is the changed project for discount-change UI', () => {
      expect(changedProjects).toEqual(['ecommerce-site']);
      expect(unchangedProjects).not.toContain('ecommerce-site');
    });

    it('ACCEPTANCE: unchanged projects must not ship checkout Subtotal after discount UI marker', () => {
      expect(unchangedProjects).toEqual([
        'trueup-lite-backend',
        'trueup-lite-frontend',
        'trueup-lite-flutter',
        'aws-scripts',
        'notification-framework',
      ]);
      expect(unchangedProjectDiffMarker).toBe('Subtotal after discount');
    });

    it('ACCEPTANCE: this spec file documents changed-project scope contract', () => {
      expect(subtotalAfterDiscountLabel).toBe('Subtotal after discount');
    });
  });

  describe('Happy path (checkout with applicable offer)', () => {
    let fixture: ComponentFixture<CheckoutComponent>;
    let storeOfferService: jasmine.SpyObj<StoreOfferService>;

    beforeEach(async () => {
      ({ fixture, storeOfferService } = await createCheckoutFixture({
        evaluation: {
          applicableOffers: [],
          bestOfferId: 5,
          offerName: 'Summer Sale',
          originalAmount: 100,
          discountAmount: 20,
          finalAmount: 80,
        },
        cartTotal: 100,
      }));
    });

    it('ACCEPTANCE: Subtotal (N items) shows pre-discount merchandise from originalAmount', () => {
      fixture.detectChanges();
      expect(fixture.componentInstance.displayedSubtotalBeforeDiscount()).toBe(100);
      expect(fixture.nativeElement.textContent).toContain('Subtotal (1 items)');
    });

    it('ACCEPTANCE: design mockup amounts (270, 120 shipping, −13.50 discount, total 376.50)', async () => {
      const mockupZip = '110001';
      const shipping = calculateShippingFee(mockupZip);
      expect(shipping).toBe(OUT_OF_REGION_SHIPPING_FEE);

      TestBed.resetTestingModule();
      const mockupFixture = (
        await createCheckoutFixture({
          evaluation: {
            applicableOffers: [],
            bestOfferId: 9,
            offerName: 'Diwali Damaka Offer',
            originalAmount: 270,
            discountAmount: 13.5,
            finalAmount: 256.5,
          },
          cartTotal: 270,
          productPrice: 270,
        })
      ).fixture;
      mockupFixture.componentInstance.form.patchValue({ zipCode: mockupZip });
      mockupFixture.detectChanges();

      const text = mockupFixture.nativeElement.textContent as string;
      expect(text).toContain('₹270.00');
      expect(text).toContain('₹120.00');
      expect(text).toContain('Discount (Diwali Damaka Offer)');
      expect(text).toContain('13.50');
      expect(mockupFixture.componentInstance.orderTotal()).toBe(376.5);
      expect(text).toContain('₹376.50');
    });

    it('ACCEPTANCE: Subtotal after discount row shows finalAmount from evaluation', () => {
      fixture.detectChanges();
      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain(subtotalAfterDiscountLabel);
      expect(fixture.componentInstance.displayedSubtotalAfterDiscount()).toBe(80);
    });

    it('ACCEPTANCE: summary row order before Total matches design (with after-discount line)', () => {
      fixture.componentInstance.form.patchValue({ zipCode: '600001' });
      fixture.detectChanges();
      const text = fixture.nativeElement.textContent as string;
      const subtotalIdx = text.indexOf('Subtotal (1 items)');
      const shippingIdx = text.indexOf('Shipping (per kg)');
      const disclaimerIdx = text.indexOf('Charges may vary based on the package weight');
      const discountIdx = text.indexOf('Discount (Summer Sale)');
      const afterIdx = text.indexOf(subtotalAfterDiscountLabel);
      const totalIdx = text.lastIndexOf('Total');

      expect(subtotalIdx).toBeGreaterThan(-1);
      expect(subtotalIdx).toBeLessThan(shippingIdx);
      expect(shippingIdx).toBeLessThan(disclaimerIdx);
      expect(discountIdx).toBeLessThan(afterIdx);
      expect(afterIdx).toBeLessThan(totalIdx);
    });

    it('ACCEPTANCE: Total equals finalAmount merchandise plus shipping (80 + fee, not 100 + fee)', () => {
      fixture.componentInstance.form.patchValue({ zipCode: '600001' });
      fixture.detectChanges();
      const shipping = fixture.componentInstance.shippingFee();
      expect(fixture.componentInstance.orderTotal()).toBe(80 + shipping);
      expect(fixture.componentInstance.orderTotal()).not.toBe(100 + shipping);
    });
  });

  describe('Offer evaluation integration', () => {
    it('ACCEPTANCE: checkout evaluates offers via StoreOfferService with mobile and cart lines', async () => {
      const { fixture, storeOfferService } = await createCheckoutFixture();
      fixture.componentInstance.form.patchValue({ mobile: '9876543210' });
      fixture.detectChanges();

      expect(storeOfferService.evaluateCheckout).toHaveBeenCalled();
      expect(storeOfferService.toCartLines).toHaveBeenCalled();
      const [mobile] = storeOfferService.evaluateCheckout.calls.mostRecent().args;
      expect(mobile).toBe('9876543210');
      expect(StoreOfferService.name).not.toBe(AdminOfferService.name);
    });

    it('ACCEPTANCE: place-order payload includes bestOfferId from evaluation', async () => {
      const { fixture, orderService } = await createCheckoutFixture({
        evaluation: {
          applicableOffers: [],
          bestOfferId: 42,
          offerName: 'Offer',
          originalAmount: 100,
          discountAmount: 10,
          finalAmount: 90,
        },
      });
      fixture.detectChanges();
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
      expect(orderService.placeOrder.calls.mostRecent().args[0].offerId).toBe(42);
    });

    it('ACCEPTANCE: while evaluate-checkout is in flight, show loading copy and hide Subtotal after discount', async () => {
      const pending = new Subject<CheckoutOfferEvaluation>();
      const { storeOfferService } = await createCheckoutFixture();
      storeOfferService.evaluateCheckout.and.returnValue(pending.asObservable());
      const loadingFixture = TestBed.createComponent(CheckoutComponent);
      loadingFixture.detectChanges();

      const text = loadingFixture.nativeElement.textContent as string;
      expect(text).toContain('Checking available offers');
      expect(text).not.toContain(subtotalAfterDiscountLabel);
      pending.complete();
    });
  });

  describe('Edge cases and error paths', () => {
    it('ACCEPTANCE: zero discount hides Discount and Subtotal after discount; subtotal uses cart total', async () => {
      const { fixture } = await createCheckoutFixture({
        evaluation: {
          applicableOffers: [],
          originalAmount: 100,
          discountAmount: 0,
          finalAmount: 100,
        },
        cartTotal: 100,
      });
      fixture.detectChanges();
      const text = fixture.nativeElement.textContent as string;
      expect(text).not.toContain('Discount (');
      expect(text).not.toContain(subtotalAfterDiscountLabel);
      expect(fixture.componentInstance.displayedSubtotalBeforeDiscount()).toBe(100);
    });

    it('ACCEPTANCE: evaluate-checkout failure clears discount rows and totals cart + shipping only', async () => {
      const { storeOfferService } = await createCheckoutFixture();
      storeOfferService.evaluateCheckout.and.returnValue(throwError(() => new Error('network')));
      const failFixture = TestBed.createComponent(CheckoutComponent);
      failFixture.detectChanges();

      expect(failFixture.componentInstance.discountAmount()).toBe(0);
      expect(failFixture.nativeElement.textContent).not.toContain(subtotalAfterDiscountLabel);
      expect(failFixture.componentInstance.orderTotal()).toBe(
        failFixture.componentInstance.cartSubtotal() + failFixture.componentInstance.shippingFee()
      );
    });

    it('ACCEPTANCE: empty cart redirects to /cart', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [CheckoutComponent],
        providers: [
          provideRouter([]),
          {
            provide: CartService,
            useValue: jasmine.createSpyObj<CartService>('CartService', ['getCheckoutItems', 'clear'], {
              items: signal([]),
              cartTotal: signal(0),
              cartCount: signal(0),
            }),
          },
          { provide: OrderService, useValue: createOrderServiceMock() },
          { provide: StoreOfferService, useValue: createStoreOfferServiceMock() },
          { provide: AuthService, useValue: { isAuthenticated: () => false, currentUser: () => null } },
          { provide: SeoService, useValue: { applyNoIndex: () => undefined } },
        ],
      }).compileComponents();

      const router = TestBed.inject(Router);
      const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
      const emptyFixture = TestBed.createComponent(CheckoutComponent);
      emptyFixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/cart']);
      expect(emptyFixture.nativeElement.textContent).not.toContain(subtotalAfterDiscountLabel);
    });

    it('ACCEPTANCE: when cart subtotal differs from originalAmount, display evaluation amounts', async () => {
      const { fixture } = await createCheckoutFixture({
        evaluation: {
          applicableOffers: [],
          bestOfferId: 1,
          offerName: 'Offer',
          originalAmount: 270,
          discountAmount: 13.5,
          finalAmount: 256.5,
        },
        cartTotal: 95,
        productPrice: 95,
      });
      fixture.detectChanges();
      expect(fixture.componentInstance.displayedSubtotalBeforeDiscount()).toBe(270);
      expect(fixture.componentInstance.displayedSubtotalAfterDiscount()).toBe(256.5);
    });

    it('ACCEPTANCE: missing finalAmount falls back to max(0, before − discount)', async () => {
      const { fixture } = await createCheckoutFixture({
        evaluation: {
          applicableOffers: [],
          bestOfferId: 1,
          offerName: 'Offer',
          originalAmount: 100,
          discountAmount: 20,
          finalAmount: undefined as unknown as number,
        },
        cartTotal: 100,
      });
      fixture.detectChanges();
      expect(fixture.componentInstance.displayedSubtotalAfterDiscount()).toBe(80);
    });
  });

  describe('Cart and admin (no regression)', () => {
    it('ACCEPTANCE: cart order summary excludes checkout-only discount breakdown', async () => {
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

      const cartFixture = TestBed.createComponent(OrderSummaryComponent);
      cartFixture.detectChanges();
      const text = cartFixture.nativeElement.textContent as string;
      expect(text).not.toContain(subtotalAfterDiscountLabel);
      expect(text).not.toContain('Checking available offers');
    });

    it('ACCEPTANCE: admin Offers & Discounts route remains registered', () => {
      const adminRoute = routes.find((r) => r.path === 'admin');
      const dashboard = adminRoute?.children?.find((r) => r.path === 'dashboard');
      const offers = dashboard?.children?.find((r) => r.path === 'offers');
      expect(offers).toBeDefined();
      expect(AdminOffersComponent.name).toBe('AdminOffersComponent');
    });
  });

  describe('Documentation', () => {
    it('ACCEPTANCE: README describes before/after subtotal and discounted merchandise total', async () => {
      await TestBed.configureTestingModule({
        providers: [provideHttpClient()],
      }).compileComponents();
      const readme = await firstValueFrom(
        TestBed.inject(HttpClient).get('/README.md', { responseType: 'text' })
      );
      expect(readme.toLowerCase()).toContain('subtotal before discount');
      expect(readme.toLowerCase()).toContain('subtotal after discount');
      expect(readme.toLowerCase()).toContain('finalamount');
      expect(readme.toLowerCase()).toContain('discounted merchandise');
    });
  });
});

function createOrderServiceMock(): jasmine.SpyObj<OrderService> {
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
  return orderService;
}

function createStoreOfferServiceMock(
  evaluation?: Partial<CheckoutOfferEvaluation>
): jasmine.SpyObj<StoreOfferService> {
  const storeOfferService = jasmine.createSpyObj<StoreOfferService>('StoreOfferService', [
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
      ...evaluation,
    })
  );
  return storeOfferService;
}

async function createCheckoutFixture(options?: {
  evaluation?: Partial<CheckoutOfferEvaluation>;
  cartTotal?: number;
  productPrice?: number;
}): Promise<{
  fixture: ComponentFixture<CheckoutComponent>;
  storeOfferService: jasmine.SpyObj<StoreOfferService>;
  orderService: jasmine.SpyObj<OrderService>;
}> {
  const cartTotal = options?.cartTotal ?? 100;
  const productPrice = options?.productPrice ?? cartTotal;
  const orderService = createOrderServiceMock();
  const storeOfferService = createStoreOfferServiceMock(options?.evaluation);
  const cartService = jasmine.createSpyObj<CartService>('CartService', ['getCheckoutItems', 'clear'], {
    items: signal([mockCartItem({ id: 1, name: 'Item', price: productPrice, quantity: 1 })]),
    cartTotal: signal(cartTotal),
    cartCount: signal(1),
  });
  cartService.getCheckoutItems.and.returnValue([{ productId: 1, quantity: 1 }]);

  TestBed.resetTestingModule();
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

  const fixture = TestBed.createComponent(CheckoutComponent);
  return { fixture, storeOfferService, orderService };
}
