import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminGoogleReviewService, GoogleReviewsAdminListing } from '../../../core/services/admin-google-review.service';
import { AdminGoogleReviewsComponent } from './admin-google-reviews.component';

describe('AdminGoogleReviewsComponent', () => {
  let fixture: ComponentFixture<AdminGoogleReviewsComponent>;
  let adminService: jasmine.SpyObj<AdminGoogleReviewService>;

  const listing: GoogleReviewsAdminListing = {
    listing: {
      placeName: 'Sri Renga Pooja & Herbal Traders',
      rating: 4.9,
      reviewCount: 19,
      mapsUrl: 'https://maps.app.goo.gl/nz3z1G6tutW1werVA',
      reviews: [{ author: 'Newest', rating: 5, text: 'Latest review', relativeTime: '1 day ago' }],
    },
    syncedAt: '2026-09-29T10:00:00',
    syncError: null,
  };

  beforeEach(async () => {
    adminService = jasmine.createSpyObj<AdminGoogleReviewService>('AdminGoogleReviewService', [
      'getListing',
      'syncFromGoogle',
    ]);
    adminService.getListing.and.returnValue(of(listing));

    await TestBed.configureTestingModule({
      imports: [AdminGoogleReviewsComponent],
      providers: [{ provide: AdminGoogleReviewService, useValue: adminService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminGoogleReviewsComponent);
    fixture.detectChanges();
  });

  it('renders snapshot metadata from admin listing API', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Sri Renga Pooja & Herbal Traders');
    expect(element.textContent).toContain('19');
    expect(element.textContent).toContain('Open listing on Google Maps');
    const mapsLink = element.querySelector('a[href="https://maps.app.goo.gl/nz3z1G6tutW1werVA"]');
    expect(mapsLink).not.toBeNull();
  });

  it('calls sync endpoint and refreshes preview reviews', () => {
    adminService.syncFromGoogle.and.returnValue(of(listing));

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(adminService.syncFromGoogle).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Latest review');
    expect(fixture.nativeElement.textContent).toContain('Newest');
  });

  it('shows error banner when sync fails', () => {
    adminService.syncFromGoogle.and.returnValue(throwError(() => 'Sync failed from API key'));

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sync failed from API key');
  });
});
