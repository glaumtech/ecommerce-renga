import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { AdminOfferService } from './admin-offer.service';
import { DiscountType, OfferType, TargetAudience } from '../models/offer.model';

describe('AdminOfferService (acceptance HTTP contract)', () => {
  let service: AdminOfferService;
  let http: HttpTestingController;
  const base = `${environment.apiUrl}/api/offers`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminOfferService],
    });
    service = TestBed.inject(AdminOfferService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll calls GET /api/offers', () => {
    service.getAll().subscribe();
    const req = http.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getById calls GET /api/offers/:id', () => {
    service.getById(7).subscribe();
    const req = http.expectOne(`${base}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('create calls POST /api/offers', () => {
    const dto = {
      name: 'Test',
      type: OfferType.FLAT_DISCOUNT,
      discountType: DiscountType.PERCENTAGE,
      startDate: '2026-01-01T00:00:00',
      endDate: '2026-02-01T00:00:00',
    };
    service.create(dto).subscribe();
    const req = http.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });

  it('update calls PUT /api/offers/:id', () => {
    const dto = {
      name: 'Updated',
      type: OfferType.CART_DISCOUNT,
      discountType: DiscountType.FIXED_AMOUNT,
      startDate: '2026-01-01T00:00:00',
      endDate: '2026-02-01T00:00:00',
    };
    service.update(3, dto).subscribe();
    const req = http.expectOne(`${base}/3`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('delete calls DELETE /api/offers/:id', () => {
    service.delete(2).subscribe();
    const req = http.expectOne(`${base}/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'ok' });
  });

  it('toggleStatus calls POST /api/offers/:id/toggle-status', () => {
    service.toggleStatus(5).subscribe();
    const req = http.expectOne(`${base}/5/toggle-status`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('search calls GET /api/offers/search?query=', () => {
    service.search('festive').subscribe();
    const req = http.expectOne((r) => r.url === `${base}/search` && r.params.get('query') === 'festive');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getStatistics calls GET /api/offers/:id/statistics', () => {
    service.getStatistics(9).subscribe();
    const req = http.expectOne(`${base}/9/statistics`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('loads enum helper endpoints', () => {
    service.getOfferTypes().subscribe((types) => expect(types).toEqual([]));
    http.expectOne(`${base}/types`).flush([]);

    service.getDiscountTypes().subscribe((types) => expect(types).toEqual([]));
    http.expectOne(`${base}/discount-types`).flush([]);

    service.getTargetAudiences().subscribe((audiences) =>
      expect(audiences).toEqual([TargetAudience.ALL_CUSTOMERS])
    );
    http.expectOne(`${base}/target-audiences`).flush([TargetAudience.ALL_CUSTOMERS]);
  });

  it('maps backend ErrorResponse.message on failure', (done) => {
    service.getAll().subscribe({
      error: (err) => {
        expect(err).toBe('Duplicate name');
        done();
      },
    });
    const req = http.expectOne(base);
    req.flush({ message: 'Duplicate name' }, { status: 400, statusText: 'Bad Request' });
  });
});
