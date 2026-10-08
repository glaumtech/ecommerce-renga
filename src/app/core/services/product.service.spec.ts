import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductService } from './product.service';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ProductService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('AC-EC-01 maps ecommerceOutOfStock from store API DTO', () => {
    service.fetchProductBySlug('soon-item').subscribe((product) => {
      expect(product.ecommerceOutOfStock).toBe(true);
      expect(product.name).toBe('Soon');
    });

    const req = http.expectOne(
      `${environment.apiUrl}/api/store/products/by-slug/${encodeURIComponent('soon-item')}`
    );
    req.flush({
      id: 1,
      slug: 'soon-item',
      name: 'Soon',
      price: 10,
      ecommerceOutOfStock: true,
      qty: 5,
    });
  });
});
