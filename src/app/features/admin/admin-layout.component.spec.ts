import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AuthService } from '../../core/services/auth.service';
import { AdminOrderService } from '../../core/services/admin-order.service';
import { signal } from '@angular/core';

describe('AdminLayoutComponent', () => {
  let fixture: ComponentFixture<AdminLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { currentUser: signal('admin@test.com'), logout: () => ofVoid() },
        },
        {
          provide: AdminOrderService,
          useValue: {
            fulfillmentScreenshotMode: signal(false),
            selectedOrder: signal(null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();
  });

  it('includes Google Reviews admin navigation link', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    const googleReviewsLink = links.find((anchor) => anchor.textContent?.includes('Google Reviews'));
    expect(googleReviewsLink).toBeTruthy();
    const routerTarget =
      googleReviewsLink?.getAttribute('routerLink') ??
      googleReviewsLink?.getAttribute('ng-reflect-router-link') ??
      '';
    expect(routerTarget).toContain('google-reviews');
  });

  it('includes Offers & Discounts admin navigation link to /admin/dashboard/offers', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];
    const offersLink = links.find((anchor) => anchor.textContent?.includes('Offers & Discounts'));
    expect(offersLink).toBeTruthy();
    const routerTarget =
      offersLink?.getAttribute('routerLink') ??
      offersLink?.getAttribute('ng-reflect-router-link') ??
      '';
    expect(routerTarget).toContain('/admin/dashboard/offers');
  });
});

function ofVoid() {
  return { subscribe: (handlers: { next?: () => void }) => handlers.next?.() };
}
