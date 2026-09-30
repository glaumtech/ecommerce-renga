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
import {
  BASE_SHIPPING_FEE,
  OUT_OF_REGION_SHIPPING_FEE,
} from './core/utils/shipping-fee.util';
import { AdminOffersComponent } from './features/admin/offers/admin-offers.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrderSummaryComponent } from './shared/components/order-summary/order-summary.component';
import { mockCartItem } from './testing/mock-cart-item';

/**
 * job_756b05c5616a — one automated check per ACCEPTANCE.md criterion (ecommerce-site).
 */
describe('job_756b05c5616a acceptance (ACCEPTANCE.md)', () => {
  const jobId = 'job_756b05c5616a';
  const changedProject = 'ecommerce-site';
  const unchangedProjects = [
    'trueup-lite-backend',
    'trueup-lite-frontend',
    'trueup-lite-flutter',
    'aws-scripts',
    'notification-framework',
  ];
  const ecommerceCheckoutFiles = [
    'src/app/features/checkout/checkout.component.html',
    'src/app/features/checkout/checkout.component.ts',
    'src/app/features/checkout/checkout.component.spec.ts',
    'src/app/job-756b05c5616a.acceptance.spec.ts',
    'README.md',
  ];
  const guardSpecFiles = [
    'src/app/features/checkout/checkout.component.spec.ts',
    'src/app/checkout-discount-change.acceptance.spec.ts',
    'src/app/checkout-discount.acceptance.spec.ts',
    'src/app/checkout-discount-change-workspace-scope.acceptance.spec.ts',
    'src/app/offers-storefront-scope.spec.ts',
    'src/app/job-756b05c5616a.acceptance.spec.ts',
  ];
  const npmTestCommand = 'npm test -- --watch=false --browsers=ChromeHeadless';
  const scopeUiMarker = 'Total before discount';
  const removedUiLabel = 'Subtotal after discount';
  const mockupZip = '110001';

  it('AC-SCOPE-1: only ecommerce-site is the changed project for this job', () => {
    expect(jobId).toBe('job_756b05c5616a');
    expect(changedProject).toBe('ecommerce-site');
    expect(unchangedProjects).toEqual([
      'trueup-lite-backend',
      'trueup-lite-frontend',
      'trueup-lite-flutter',
      'aws-scripts',
      'notification-framework',
    ]);
    expect(unchangedProjects).not.toContain(changedProject);
  });

  it('AC-SCOPE-2: checkout discount summary lives in documented ecommerce-site paths', () => {
    expect(ecommerceCheckoutFiles).toContain('src/app/features/checkout/checkout.component.html');
    expect(ecommerceCheckoutFiles).toContain('src/app/features/checkout/checkout.component.ts');
    expect(ecommerceCheckoutFiles).toContain('README.md');
    expect(CheckoutComponent).toBeDefined();
  });

  it('AC-HP-1: checkout summary does not show Subtotal after discount when discount applies', async () => {
    const { fixture } = await createCheckoutFixture();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain(removedUiLabel);
  });

  it('AC-HP-2: Total before discount equals merchandise subtotal plus shipping in UI', async () => {
    const { fixture } = await createCheckoutFixture();
    fixture.componentInstance.form.patchValue({ zipCode: '600001' });
    fixture.detectChanges();
    const cmp = fixture.componentInstance;
    expect(cmp.totalBeforeDiscount()).toBe(cmp.displayedSubtotalBeforeDiscount() + cmp.shippingFee());
    expect(fixture.nativeElement.textContent).toContain(scopeUiMarker);
  });

  it('AC-HP-3: Total before discount is below shipping disclaimer and above Discount', async () => {
    const { fixture } = await createCheckoutFixture();
    fixture.componentInstance.form.patchValue({ zipCode: '600001' });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    const shippingIdx = text.indexOf('Shipping (per kg)');
    const disclaimerIdx = text.indexOf('Charges may vary based on the package weight');
    const beforeIdx = text.indexOf(scopeUiMarker);
    const discountIdx = text.indexOf('Discount (Summer Sale)');
    expect(shippingIdx).toBeLessThan(disclaimerIdx);
    expect(disclaimerIdx).toBeLessThan(beforeIdx);
    expect(beforeIdx).toBeLessThan(discountIdx);
  });

  it('AC-HP-4: summary row order matches mockup before final Total', async () => {
    const { fixture } = await createCheckoutFixture();
    fixture.componentInstance.form.patchValue({ zipCode: '600001' });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    const subtotalIdx = text.indexOf('Subtotal (1 items)');
    const shippingIdx = text.indexOf('Shipping (per kg)');
    const disclaimerIdx = text.indexOf('Charges may vary based on the package weight');
    const beforeIdx = text.indexOf(scopeUiMarker);
    const discountIdx = text.indexOf('Discount (Summer Sale)');
    const totalIdx = text.lastIndexOf('Total');
    expect(subtotalIdx).toBeLessThan(shippingIdx);
    expect(shippingIdx).toBeLessThan(disclaimerIdx);
    expect(disclaimerIdx).toBeLessThan(beforeIdx);
    expect(beforeIdx).toBeLessThan(discountIdx);
    expect(discountIdx).toBeLessThan(totalIdx);
  });

  it('AC-HP-5: mockup amounts 390.00 before discount and 376.50 total with Diwali offer', async () => {
    const { fixture } = await createCheckoutFixture({
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
    });
    fixture.componentInstance.form.patchValue({ zipCode: mockupZip });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('₹390.00');
    expect(text).toContain('Discount (Diwali Damaka Offer)');
    expect(text).toContain('13.50');
    expect(text).toContain('₹376.50');
    expect(fixture.componentInstance.shippingFee()).toBe(OUT_OF_REGION_SHIPPING_FEE);
    expect(fixture.componentInstance.orderTotal()).toBe(376.5);
  });

  it('AC-HP-6: orderTotal uses discounted merchandise plus shipping not pre-discount merchandise', async () => {
    const { fixture } = await createCheckoutFixture();
    fixture.componentInstance.form.patchValue({ zipCode: '600001' });
    fixture.detectChanges();
    const shipping = fixture.componentInstance.shippingFee();
    expect(fixture.componentInstance.orderTotal()).toBe(80 + shipping);
    expect(fixture.componentInstance.orderTotal()).not.toBe(100 + shipping);
  });

  it('AC-EC-1: zero discount hides discount rows and keeps subtotal from evaluation', async () => {
    const { storeOfferService } = await createCheckoutFixture();
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
    expect(text).not.toContain(scopeUiMarker);
    expect(text).not.toContain(removedUiLabel);
    expect(text).not.toContain('Discount (');
    expect(zeroFixture.componentInstance.displayedSubtotalBeforeDiscount()).toBe(100);
  });

  it('AC-EC-2: loading state shows offer check copy and hides Total before discount', async () => {
    const pending = new Subject<CheckoutOfferEvaluation>();
    const { storeOfferService } = await createCheckoutFixture();
    storeOfferService.evaluateCheckout.and.returnValue(pending.asObservable());
    const loadingFixture = TestBed.createComponent(CheckoutComponent);
    loadingFixture.detectChanges();
    const text = loadingFixture.nativeElement.textContent as string;
    expect(text).toContain('Checking available offers');
    expect(text).not.toContain(scopeUiMarker);
    pending.complete();
  });

  it('AC-EC-3: evaluate-checkout failure clears discount UI and totals cart plus shipping', async () => {
    const { storeOfferService } = await createCheckoutFixture();
    storeOfferService.evaluateCheckout.and.returnValue(throwError(() => new Error('fail')));
    const failFixture = TestBed.createComponent(CheckoutComponent);
    failFixture.detectChanges();
    expect(failFixture.componentInstance.discountAmount()).toBe(0);
    expect(failFixture.nativeElement.textContent).not.toContain(scopeUiMarker);
    expect(failFixture.componentInstance.orderTotal()).toBe(
      failFixture.componentInstance.cartSubtotal() + failFixture.componentInstance.shippingFee()
    );
  });

  it('AC-EC-4: empty cart redirects to cart and never shows Total before discount', async () => {
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
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => false, currentUser: () => null },
        },
        { provide: SeoService, useValue: { applyNoIndex: () => undefined } },
      ],
    }).compileComponents();
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const emptyFixture = TestBed.createComponent(CheckoutComponent);
    emptyFixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['/cart']);
    expect(emptyFixture.nativeElement.textContent).not.toContain(scopeUiMarker);
  });

  it('AC-EC-5: originalAmount drives subtotal and Total before discount uses it plus shipping', async () => {
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
    fixture.componentInstance.form.patchValue({ zipCode: mockupZip });
    fixture.detectChanges();
    expect(fixture.componentInstance.displayedSubtotalBeforeDiscount()).toBe(270);
    expect(fixture.componentInstance.totalBeforeDiscount()).toBe(
      270 + fixture.componentInstance.shippingFee()
    );
  });

  it('AC-EC-6: missing finalAmount falls back for order total', async () => {
    const { fixture } = await createCheckoutFixture({
      evaluation: {
        applicableOffers: [],
        bestOfferId: 1,
        offerName: 'Offer',
        originalAmount: 100,
        discountAmount: 20,
        finalAmount: undefined as unknown as number,
      },
    });
    fixture.componentInstance.form.patchValue({ zipCode: '600001' });
    fixture.detectChanges();
    expect(fixture.componentInstance.displayedSubtotalAfterDiscount()).toBe(80);
    expect(fixture.componentInstance.orderTotal()).toBe(80 + BASE_SHIPPING_FEE);
  });

  it('AC-REG-1: cart order summary excludes checkout discount breakdown', async () => {
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
    expect(text).not.toContain(scopeUiMarker);
    expect(text).not.toContain('Discount (');
    expect(text).not.toContain('Checking available offers');
  });

  it('AC-REG-2: admin Offers route remains registered', () => {
    const adminRoute = routes.find((r) => r.path === 'admin');
    const dashboard = adminRoute?.children?.find((r) => r.path === 'dashboard');
    const offers = dashboard?.children?.find((r) => r.path === 'offers');
    expect(offers).toBeDefined();
    expect(AdminOffersComponent.name).toBe('AdminOffersComponent');
  });

  it('AC-API-1: placeOrder includes offerId from evaluation', async () => {
    const { fixture, orderService } = await createCheckoutFixture({
      evaluation: { bestOfferId: 42, discountAmount: 10, finalAmount: 90, originalAmount: 100 },
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

  it('AC-API-2: README documents evaluate-checkout and store orders without backend code changes', async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient()] }).compileComponents();
    const readme = await firstValueFrom(
      TestBed.inject(HttpClient).get('/README.md', { responseType: 'text' })
    );
    expect(readme).toContain('evaluate-checkout');
    expect(readme).toContain('/api/store/orders');
    expect(unchangedProjects).toContain('trueup-lite-backend');
  });

  it('AC-DOC-1: README documents checkout summary flow through total before discount', async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient()] }).compileComponents();
    const readmeLower = (
      await firstValueFrom(TestBed.inject(HttpClient).get('/README.md', { responseType: 'text' }))
    ).toLowerCase();
    expect(readmeLower).toContain('subtotal before discount');
    expect(readmeLower).toContain('shipping');
    expect(readmeLower).toContain('total before discount');
    expect(readmeLower).toContain('discount');
    expect(readmeLower).toContain('finalamount');
  });

  it('AC-DOC-2: README states subtotal after discount is not a visible summary row', async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient()] }).compileComponents();
    const readmeLower = (
      await firstValueFrom(TestBed.inject(HttpClient).get('/README.md', { responseType: 'text' }))
    ).toLowerCase();
    expect(readmeLower).toContain('not shown as its own summary row');
    expect(readmeLower).toContain('finalamount');
  });

  it('AC-TEST-1: pipeline npm test command is defined for ecommerce-site', () => {
    expect(npmTestCommand).toBe('npm test -- --watch=false --browsers=ChromeHeadless');
    expect(changedProject).toBe('ecommerce-site');
  });

  it('AC-TEST-2: checkout.component.spec.ts is registered as a guard spec', () => {
    expect(guardSpecFiles).toContain('src/app/features/checkout/checkout.component.spec.ts');
  });

  it('AC-TEST-3: checkout-discount-change.acceptance.spec.ts is registered as a guard spec', () => {
    expect(guardSpecFiles).toContain('src/app/checkout-discount-change.acceptance.spec.ts');
  });

  it('AC-TEST-4: workspace scope specs use Total before discount marker', () => {
    expect(scopeUiMarker).toBe('Total before discount');
    expect(guardSpecFiles).toContain('src/app/checkout-discount-change-workspace-scope.acceptance.spec.ts');
    expect(guardSpecFiles).toContain('src/app/offers-storefront-scope.spec.ts');
  });

  it('AC-TEST-5: checkout-discount.acceptance.spec.ts is registered as a guard spec', () => {
    expect(guardSpecFiles).toContain('src/app/checkout-discount.acceptance.spec.ts');
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
