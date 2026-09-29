import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminGoogleReviewService } from './admin-google-review.service';

describe('AdminGoogleReviewService', () => {
  let service: AdminGoogleReviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminGoogleReviewService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminGoogleReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads admin listing from authenticated admin endpoint', () => {
    service.getListing().subscribe((listing) => {
      expect(listing.listing.placeName).toBe('Sri Renga Pooja & Herbal Traders');
      expect(listing.syncedAt).toBe('2026-09-29T10:00:00');
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/store/admin/google-reviews'));
    expect(req.request.method).toBe('GET');
    req.flush({
      listing: {
        placeName: 'Sri Renga Pooja & Herbal Traders',
        rating: 4.9,
        reviewCount: 19,
        mapsUrl: 'https://maps.app.goo.gl/nz3z1G6tutW1werVA',
        reviews: [{ author: 'Newest', rating: 5, text: 'Latest', relativeTime: '1 day ago' }],
      },
      syncedAt: '2026-09-29T10:00:00',
      syncError: null,
    });
  });

  it('posts sync request to admin sync endpoint', () => {
    service.syncFromGoogle().subscribe((listing) => {
      expect(listing.listing.reviews[0].author).toBe('Newest');
    });

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/store/admin/google-reviews/sync'));
    expect(req.request.method).toBe('POST');
    req.flush({
      listing: {
        placeName: 'Sri Renga Pooja & Herbal Traders',
        rating: 4.9,
        reviewCount: 19,
        mapsUrl: 'https://maps.app.goo.gl/nz3z1G6tutW1werVA',
        reviews: [{ author: 'Newest', rating: 5, text: 'Latest', relativeTime: '1 day ago' }],
      },
      syncedAt: '2026-09-29T10:05:00',
      syncError: null,
    });
  });
});
