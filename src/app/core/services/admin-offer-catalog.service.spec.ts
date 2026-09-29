import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminCategoryService } from './admin-category.service';
import { AdminOfferCatalogService } from './admin-offer-catalog.service';

describe('AdminOfferCatalogService (acceptance)', () => {
  let service: AdminOfferCatalogService;
  let http: HttpTestingController;
  let categoryService: jasmine.SpyObj<AdminCategoryService>;

  beforeEach(() => {
    categoryService = jasmine.createSpyObj('AdminCategoryService', ['getCategoryTree']);
    categoryService.getCategoryTree.and.returnValue(
      of([
        {
          id: 1,
          name: 'Main',
          status: 'ACTIVE',
          level: 'MAIN',
          sortOrder: 0,
          codeSequenceStart: 1,
          itemCount: 0,
          publishToEcommerce: true,
          subCategories: [
            {
              id: 2,
              name: 'Sub',
              status: 'ACTIVE',
              level: 'SUB',
              sortOrder: 0,
              codeSequenceStart: 1,
              itemCount: 0,
              publishToEcommerce: true,
              subCategories: [],
            },
          ],
        },
      ])
    );

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AdminOfferCatalogService,
        { provide: AdminCategoryService, useValue: categoryService },
      ],
    });
    service = TestBed.inject(AdminOfferCatalogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('searchProducts calls GET /items/getAll with search and paging', () => {
    service.searchProducts('agarbathi', 0, 30).subscribe((items) => {
      expect(items.length).toBe(1);
      expect(items[0].name).toBe('Item A');
    });
    const req = http.expectOne((r) => r.url === `${environment.apiUrl}/items/getAll`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('agarbathi');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('30');
    req.flush({ content: [{ id: 10, name: 'Item A' }] });
  });

  it('getBrands calls GET /brands', () => {
    service.getBrands().subscribe();
    const req = http.expectOne(`${environment.apiUrl}/brands`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Brand X' }]);
  });

  it('getCategoryOptions flattens category tree for selects', (done) => {
    service.getCategoryOptions().subscribe((options) => {
      expect(options.some((o) => o.id === 1 && o.name === 'Main')).toBe(true);
      expect(options.some((o) => o.id === 2 && o.name.includes('Sub'))).toBe(true);
      done();
    });
  });
});
