import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CheckoutOfferEvaluation } from '../models/offer.model';
import { mockCartItem } from '../../testing/mock-cart-item';
import { StoreOfferService } from './store-offer.service';

describe('StoreOfferService', () => {
  let service: StoreOfferService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StoreOfferService],
    });
    service = TestBed.inject(StoreOfferService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('posts evaluate-checkout with mobile and cart lines', () => {
    const lines = [{ productId: 1, quantity: 2, price: 50 }];
    const response: CheckoutOfferEvaluation = {
      applicableOffers: [],
      bestOfferId: 3,
      offerName: 'Summer Sale',
      originalAmount: 100,
      discountAmount: 10,
      finalAmount: 90,
    };

    service.evaluateCheckout('9876543210', lines).subscribe((result) => {
      expect(result.bestOfferId).toBe(3);
      expect(result.discountAmount).toBe(10);
    });

    const req = http.expectOne(`${environment.apiUrl}/api/offers/evaluate-checkout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ mobile: '9876543210', items: lines });
    req.flush(response);
  });

  it('posts evaluate-checkout without mobile when mobile is empty', () => {
    const lines = [{ productId: 2, quantity: 1, price: 99 }];
    service.evaluateCheckout('  ', lines).subscribe();
    const req = http.expectOne(`${environment.apiUrl}/api/offers/evaluate-checkout`);
    expect(req.request.body).toEqual({ items: lines });
    req.flush({
      applicableOffers: [],
      originalAmount: 99,
      discountAmount: 0,
      finalAmount: 99,
    });
  });

  it('posts legacy applicable endpoint with cart lines only', () => {
    const lines = [{ productId: 1, quantity: 1, price: 10 }];
    service.getApplicableOffers(lines).subscribe((offers) => expect(offers).toEqual([]));
    const req = http.expectOne(`${environment.apiUrl}/api/offers/applicable`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(lines);
    req.flush([]);
  });

  it('posts legacy apply endpoint with cart lines only', () => {
    const lines = [{ productId: 1, quantity: 1, price: 10 }];
    service.applyOffer(7, lines).subscribe((result) => {
      expect(result.discountAmount).toBe(5);
    });
    const req = http.expectOne(`${environment.apiUrl}/api/offers/7/apply`);
    expect(req.request.body).toEqual(lines);
    req.flush({
      offerId: 7,
      offerName: 'Test',
      originalAmount: 10,
      discountAmount: 5,
      finalAmount: 5,
    });
  });

  it('maps cart items to checkout cart lines for preview', () => {
    const lines = service.toCartLines([
      mockCartItem({ id: 3, name: 'Brass Lamp', price: 250, quantity: 2 }),
    ]);
    expect(lines).toEqual([
      { productId: 3, productName: 'Brass Lamp', quantity: 2, price: 250 },
    ]);
  });
});
