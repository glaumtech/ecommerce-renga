import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoogleReviewsListing } from '../../../core/data/google-reviews';
import { GoogleReviewService } from '../../../core/services/google-review.service';
import { GoogleReviewsCarouselComponent } from './google-reviews-carousel.component';

describe('GoogleReviewsCarouselComponent', () => {
  let fixture: ComponentFixture<GoogleReviewsCarouselComponent>;

  const syncedListing = signal<GoogleReviewsListing>({
    placeName: 'Sri Renga Pooja & Herbal Traders',
    rating: 4.9,
    reviewCount: 19,
    mapsUrl: 'https://maps.app.goo.gl/nz3z1G6tutW1werVA',
    reviews: [{ author: 'Synced Newest', rating: 5, text: 'From backend snapshot', relativeTime: '1 day ago' }],
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleReviewsCarouselComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: GoogleReviewService,
          useValue: {
            listing: syncedListing,
            load: jasmine.createSpy('load'),
            loading: signal(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleReviewsCarouselComponent);
    fixture.detectChanges();
  });

  it('renders synced listing review and maps link from GoogleReviewService', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Synced Newest');
    expect(element.textContent).toContain('From backend snapshot');

    const mapsLink = element.querySelector('a[href="https://maps.app.goo.gl/nz3z1G6tutW1werVA"]');
    expect(mapsLink).not.toBeNull();
  });
});
