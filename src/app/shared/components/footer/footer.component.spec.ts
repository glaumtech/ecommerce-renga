import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SCAN_TO_CONNECT_LINKTREE_URL } from '../../../core/constants/brand-links.constants';
import { ProductService } from '../../../core/services/product.service';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductService,
          useValue: {
            categories: signal([]),
            loadCategories: jasmine.createSpy('loadCategories'),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();
  });

  it('renders Scan to Connect QR and Linktree link', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Scan to Connect');

    const qrImage = element.querySelector('img[src*="scan-to-connect-linktree"]');
    expect(qrImage).not.toBeNull();

    const linktreeLink = element.querySelector(
      `a[href="${SCAN_TO_CONNECT_LINKTREE_URL}"]`
    );
    expect(linktreeLink).not.toBeNull();
    expect(linktreeLink?.getAttribute('target')).toBe('_blank');
    expect(linktreeLink?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('exposes scanToConnectUrl from SCAN_TO_CONNECT_LINKTREE_URL', () => {
    expect(fixture.componentInstance.scanToConnectUrl).toBe(SCAN_TO_CONNECT_LINKTREE_URL);
  });
});
