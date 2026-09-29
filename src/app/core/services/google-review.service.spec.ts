import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GOOGLE_REVIEWS_LISTING } from '../data/google-reviews';
import { GoogleReviewService } from './google-review.service';

describe('GoogleReviewService', () => {
  let service: GoogleReviewService;
  let httpMock: HttpTestingController;

  const MAPS_URL = 'https://maps.app.goo.gl/nz3z1G6tutW1werVA';

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

  it('uses API listing when stored snapshot has reviews', () => {
    service.load();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/store/google-reviews'));
    expect(req.request.method).toBe('GET');
    req.flush({
      placeName: 'Sri Renga Pooja & Herbal Traders',
      rating: 4.9,
      reviewCount: 20,
      mapsUrl: MAPS_URL,
      reviews: [{ author: 'New Reviewer', rating: 5, text: 'Fresh review', relativeTime: '2 days ago' }],
    });

    expect(service.listing().reviews[0].author).toBe('New Reviewer');
    expect(service.listing().reviews[0].author).not.toBe(GOOGLE_REVIEWS_LISTING.reviews[0].author);
    expect(service.listing().reviewCount).toBe(20);
  });

  it('uses API listing when snapshot has reviewCount but empty reviews array', () => {
    service.load();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/store/google-reviews'));
    req.flush({
      placeName: 'Sri Renga Pooja & Herbal Traders',
      rating: 4.9,
      reviewCount: 25,
      mapsUrl: MAPS_URL,
      reviews: [],
    });

    expect(service.listing().reviewCount).toBe(25);
    expect(service.listing().mapsUrl).toBe(MAPS_URL);
  });

  it('shows newest synced review first from API payload', () => {
    service.load();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/store/google-reviews'));
    req.flush({
      placeName: 'Sri Renga Pooja & Herbal Traders',
      rating: 4.9,
      reviewCount: 2,
      mapsUrl: MAPS_URL,
      reviews: [
        { author: 'Newest Author', rating: 5, text: 'Latest text', relativeTime: '1 day ago' },
        { author: 'Older Author', rating: 5, text: 'Older text', relativeTime: '1 month ago' },
      ],
    });

    expect(service.listing().reviews[0].author).toBe('Newest Author');
    expect(service.listing().reviews[0].text).toBe('Latest text');
  });

  it('filters out reviews below four stars or without text', () => {
    service.load();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/store/google-reviews'));
    req.flush({
      placeName: 'Sri Renga Pooja & Herbal Traders',
      rating: 4.9,
      reviewCount: 4,
      mapsUrl: MAPS_URL,
      reviews: [
        { author: 'Valid', rating: 5, text: 'Good', relativeTime: '1 day ago' },
        { author: 'Low', rating: 3, text: 'Bad', relativeTime: '1 week ago' },
        { author: 'Silent', rating: 5, text: '   ', relativeTime: '2 days ago' },
      ],
    });

    expect(service.listing().reviews.length).toBe(1);
    expect(service.listing().reviews[0].author).toBe('Valid');
  });

  it('falls back to static listing when API returns empty snapshot', () => {
    service.load();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/store/google-reviews'));
    req.flush({
      placeName: 'Sri Renga Pooja & Herbal Traders',
      rating: 0,
      reviewCount: 0,
      mapsUrl: MAPS_URL,
      reviews: [],
    });

    expect(service.listing().reviews.length).toBe(GOOGLE_REVIEWS_LISTING.reviews.length);
    expect(service.listing().mapsUrl).toBe(MAPS_URL);
  });

  it('falls back to static listing when API request fails', () => {
    service.load();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/store/google-reviews'));
    req.error(new ProgressEvent('error'));

    expect(service.listing().reviews.length).toBe(GOOGLE_REVIEWS_LISTING.reviews.length);
  });
});
