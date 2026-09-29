import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GoogleReviewService } from './core/services/google-review.service';

describe('Google reviews storefront integration', () => {
  let service: GoogleReviewService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleReviewService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GoogleReviewService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads the same synced listing the public API exposes after admin sync', () => {
    service.load();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/store/google-reviews'));
    req.flush({
      placeName: 'Sri Renga Pooja & Herbal Traders',
      rating: 4.9,
      reviewCount: 19,
      mapsUrl: 'https://maps.app.goo.gl/nz3z1G6tutW1werVA',
      reviews: [{ author: 'Post-sync Author', rating: 5, text: 'Post-sync text', relativeTime: '1 hour ago' }],
    });

    expect(service.listing().reviews[0].author).toBe('Post-sync Author');
    expect(service.listing().reviews[0].text).toBe('Post-sync text');
  });
});
