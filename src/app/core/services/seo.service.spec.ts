import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';

import { SeoService } from './seo.service';
import { Product } from '../models/product.model';
import { StoreSeoSettings } from '../models/store-seo.model';

describe('SeoService', () => {
  let service: SeoService;
  let document: Document;

  const settings: StoreSeoSettings = {
    siteName: 'Shop',
    siteUrl: 'https://shop.example',
    currency: 'INR',
    defaultDescription: '',
  };

  const baseProduct: Product = {
    id: 1,
    slug: 'item',
    name: 'Item',
    price: 100,
    category: 'Cat',
    rating: 4.5,
    reviews: 0,
    image: '/img.png',
    desc: 'Desc',
    qty: 5,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeoService, Title, Meta],
    });
    document = TestBed.inject(DOCUMENT);
    document.head.querySelectorAll('script[data-seo-jsonld]').forEach((el) => el.remove());
    service = TestBed.inject(SeoService);
  });

  function productJsonLdText(): string {
    const script = document.querySelector('script[data-seo-jsonld="product"]');
    return script?.textContent ?? '';
  }

  it('AC-EC-08 uses OutOfStock in JSON-LD when ecommerceOutOfStock', () => {
    service.applyProductSeo({ ...baseProduct, ecommerceOutOfStock: true }, settings);
    expect(productJsonLdText()).toContain('https://schema.org/OutOfStock');
  });

  it('AC-EC-08 uses OutOfStock in JSON-LD when qty is zero', () => {
    service.applyProductSeo({ ...baseProduct, qty: 0 }, settings);
    expect(productJsonLdText()).toContain('https://schema.org/OutOfStock');
  });

  it('AC-EC-08 uses InStock when product is purchasable', () => {
    service.applyProductSeo(baseProduct, settings);
    expect(productJsonLdText()).toContain('https://schema.org/InStock');
  });
});
