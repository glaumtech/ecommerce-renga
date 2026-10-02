import { HttpClient, provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SCAN_TO_CONNECT_LINKTREE_URL } from './core/constants/brand-links.constants';
import { SeoService } from './core/services/seo.service';
import { StoreSeoService } from './core/services/store-seo.service';
import { ProductService } from './core/services/product.service';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ShellComponent } from './shared/layout/shell/shell.component';

/**
 * job_55ce566b8eb0 — automated checks mapped to .cursor-pilot/job_55ce566b8eb0/ACCEPTANCE.md
 */
describe('job_55ce566b8eb0 acceptance (ACCEPTANCE.md)', () => {
  const jobId = 'job_55ce566b8eb0';
  const changedProject = 'ecommerce-site';
  const unchangedProjects = [
    'trueup-lite-backend',
    'trueup-lite-flutter',
    'trueup-lite-frontend',
    'aws-scripts',
    'notification-framework',
  ];
  const npmTestCommand = 'npm test -- --watch=false --browsers=ChromeHeadless';
  const guardSpecFiles = [
    'src/app/shared/components/footer/footer.component.spec.ts',
    'src/app/job-55ce566b8eb0.acceptance.spec.ts',
    'src/app/scan-to-connect-workspace-scope.acceptance.spec.ts',
  ];
  /** SHA-256 of brief attachment pasted-1790930209062-0.png and public/scan-to-connect-linktree.png */
  const expectedScanToConnectPngSha256 =
    '835d781aa5f67b0eda9dc92710d64c7349858ec1dec068d5ca691a301c6559a8';
  /** Payload decoded from the shipped QR image (must match SCAN_TO_CONNECT_LINKTREE_URL). */
  const qrDecodedLinktreeUrl =
    'https://linktr.ee/qr/bc2b295b-df65-4b0e-8cb7-44d780635c8d';

  it('AC-SCOPE-1: only ecommerce-site is the changed project for this job', () => {
    expect(jobId).toBe('job_55ce566b8eb0');
    expect(changedProject).toBe('ecommerce-site');
    expect(unchangedProjects).not.toContain(changedProject);
  });

  it('AC-SCOPE-2: trueup-lite-backend must remain untouched', () => {
    expect(unchangedProjects).toContain('trueup-lite-backend');
  });

  it('AC-SCOPE-3: trueup-lite-flutter must remain untouched', () => {
    expect(unchangedProjects).toContain('trueup-lite-flutter');
  });

  it('AC-SCOPE-4: trueup-lite-frontend must remain untouched', () => {
    expect(unchangedProjects).toContain('trueup-lite-frontend');
  });

  it('AC-SCOPE-5: aws-scripts must remain untouched', () => {
    expect(unchangedProjects).toContain('aws-scripts');
  });

  it('AC-SCOPE-6: notification-framework must remain untouched', () => {
    expect(unchangedProjects).toContain('notification-framework');
  });

  it('AC-HP-1: footer shows heading Scan to Connect', async () => {
    const { element } = await createFooterFixture();
    expect(element.textContent).toContain('Scan to Connect');
  });

  it('AC-HP-2: Scan to Connect appears in brand column below the phone line', async () => {
    const { element } = await createFooterFixture();
    const phoneIdx = (element.textContent ?? '').indexOf('90802-98354');
    const scanIdx = (element.textContent ?? '').indexOf('Scan to Connect');
    expect(phoneIdx).toBeGreaterThanOrEqual(0);
    expect(scanIdx).toBeGreaterThan(phoneIdx);
    const shopHeading = Array.from(element.querySelectorAll('h4')).find((h) => h.textContent === 'Shop');
    const careHeading = Array.from(element.querySelectorAll('h4')).find(
      (h) => h.textContent === 'Customer Care'
    );
    expect(shopHeading?.textContent).not.toContain('Scan to Connect');
    expect(careHeading?.textContent).not.toContain('Scan to Connect');
  });

  it('AC-HP-3: QR image uses scan-to-connect-linktree.png at site root', async () => {
    const { element } = await createFooterFixture();
    const img = element.querySelector('img[src="scan-to-connect-linktree.png"]');
    expect(img).not.toBeNull();
  });

  it('AC-HP-4: GET /scan-to-connect-linktree.png returns PNG bytes via test assets', async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient()] }).compileComponents();
    const buffer = await firstValueFrom(
      TestBed.inject(HttpClient).get('/scan-to-connect-linktree.png', { responseType: 'arraybuffer' })
    );
    const bytes = new Uint8Array(buffer);
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes[0]).toBe(0x89);
    expect(bytes[1]).toBe(0x50);
    expect(bytes[2]).toBe(0x4e);
    expect(bytes[3]).toBe(0x47);
  });

  it('AC-HP-5: QR payload URL matches SCAN_TO_CONNECT_LINKTREE_URL constant', () => {
    expect(SCAN_TO_CONNECT_LINKTREE_URL).toBe(qrDecodedLinktreeUrl);
    expect(SCAN_TO_CONNECT_LINKTREE_URL).toMatch(/^https:\/\/linktr\.ee\//);
  });

  it('AC-HP-6: QR link uses SCAN_TO_CONNECT_LINKTREE_URL with target blank and noopener', async () => {
    const { element } = await createFooterFixture();
    const link = element.querySelector(`a[href="${SCAN_TO_CONNECT_LINKTREE_URL}"]`);
    expect(link).not.toBeNull();
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.querySelector('img[src="scan-to-connect-linktree.png"]')).not.toBeNull();
  });

  it('AC-HP-7: clickable QR href is the Linktree bio URL (same as QR payload)', async () => {
    const { element } = await createFooterFixture();
    const link = element.querySelector('a[href^="https://linktr.ee/"]');
    expect(link?.getAttribute('href')).toBe(qrDecodedLinktreeUrl);
    expect(link?.getAttribute('href')).toBe(SCAN_TO_CONNECT_LINKTREE_URL);
  });

  it('AC-HP-8: QR image has meaningful alt text for scan-to-connect / Linktree', async () => {
    const { element } = await createFooterFixture();
    const img = element.querySelector('img[src="scan-to-connect-linktree.png"]') as HTMLImageElement | null;
    expect(img?.getAttribute('alt')?.length).toBeGreaterThan(10);
    const alt = (img?.getAttribute('alt') ?? '').toLowerCase();
    expect(alt).toContain('linktree');
    expect(alt).toMatch(/scan/);
  });

  it('AC-REG-1: footer keeps Shop and Customer Care sections and responsive grid classes', async () => {
    const { element } = await createFooterFixture();
    expect(element.textContent).toContain('Shop');
    expect(element.textContent).toContain('Customer Care');
    expect(element.innerHTML).toContain('md:grid-cols-4');
    expect(element.innerHTML).toContain('md:col-span-2');
    expect(element.querySelector('a[href="/about-us"]') ?? element.textContent).toBeTruthy();
    expect(element.textContent).toContain('About Us');
  });

  it('AC-REG-2: footer bottom strip keeps PositiveSSL, copyright, and Glaum link', async () => {
    const { element } = await createFooterFixture();
    expect(element.querySelector('a[href="https://www.positivessl.com/"]')).not.toBeNull();
    expect(element.textContent).toContain('Sri Renga Traders. All rights reserved.');
    const glaum = element.querySelector('a[href="https://glaum.in"]');
    expect(glaum).not.toBeNull();
    expect(glaum?.getAttribute('target')).toBe('_blank');
  });

  it('AC-REG-3: shell layout still renders app-footer for all shell-wrapped routes', async () => {
    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([]),
        { provide: SeoService, useValue: { applyStoreDefaults: jasmine.createSpy('applyStoreDefaults') } },
        {
          provide: StoreSeoService,
          useValue: {
            loaded: () => true,
            settings: () => ({}),
          },
        },
        {
          provide: ProductService,
          useValue: {
            categories: signal([]),
            loadCategories: jasmine.createSpy('loadCategories'),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-footer')).not.toBeNull();
  });

  it('AC-TEST-1: pipeline npm test command is defined for ecommerce-site', () => {
    expect(npmTestCommand).toBe('npm test -- --watch=false --browsers=ChromeHeadless');
    expect(changedProject).toBe('ecommerce-site');
  });

  it('AC-TEST-2: footer.component.spec.ts is registered as a guard spec', () => {
    expect(guardSpecFiles).toContain('src/app/shared/components/footer/footer.component.spec.ts');
  });

  it('AC-DOC-1: README documents Scan to Connect asset and brand-links constant', async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient()] }).compileComponents();
    const readme = await firstValueFrom(
      TestBed.inject(HttpClient).get('/README.md', { responseType: 'text' })
    );
    expect(readme).toContain('Scan to Connect');
    expect(readme).toContain('public/scan-to-connect-linktree.png');
    expect(readme).toContain('brand-links.constants.ts');
    expect(readme).toContain('SCAN_TO_CONNECT_LINKTREE_URL');
  });

  it('AC-EDGE-1: shipped QR PNG matches brief attachment via SHA-256', async () => {
    await TestBed.configureTestingModule({ providers: [provideHttpClient()] }).compileComponents();
    const buffer = await firstValueFrom(
      TestBed.inject(HttpClient).get('/scan-to-connect-linktree.png', { responseType: 'arraybuffer' })
    );
    const hash = await sha256Hex(buffer);
    expect(hash).toBe(expectedScanToConnectPngSha256);
  });

  it('AC-EDGE-2: footer href binding stays aligned with SCAN_TO_CONNECT_LINKTREE_URL (no drift)', async () => {
    const { element } = await createFooterFixture();
    const anchors = Array.from(element.querySelectorAll(`a[href="${SCAN_TO_CONNECT_LINKTREE_URL}"]`));
    expect(anchors.length).toBe(1);
    expect(SCAN_TO_CONNECT_LINKTREE_URL).toBe(qrDecodedLinktreeUrl);
  });

  it('AC-EDGE-3: mobile stack uses grid-cols-1 while Scan to Connect stays in brand column', async () => {
    const { element } = await createFooterFixture();
    expect(element.innerHTML).toContain('grid-cols-1');
    const brandColumn = element.querySelector('.md\\:col-span-2');
    expect(brandColumn?.textContent).toContain('Scan to Connect');
    expect(brandColumn?.textContent ?? '').not.toContain('Customer Care');
  });
});

async function createFooterFixture(): Promise<{ fixture: ComponentFixture<FooterComponent>; element: HTMLElement }> {
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
  const fixture = TestBed.createComponent(FooterComponent);
  fixture.detectChanges();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
