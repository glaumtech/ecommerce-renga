import { ECOMMERCE_AVAILABLE_SOON, isProductPurchasable } from './product-availability.util';
import { Product } from '../models/product.model';

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    slug: 'test',
    name: 'Test',
    price: 10,
    category: 'Cat',
    rating: 4.5,
    reviews: 0,
    image: '',
    desc: '',
    ...overrides,
  };
}

describe('product-availability.util (AC-EC-11)', () => {
  it('exports available soon copy', () => {
    expect(ECOMMERCE_AVAILABLE_SOON).toBe('Will be available soon');
  });

  it('isProductPurchasable allows in-stock products', () => {
    expect(isProductPurchasable(product({ qty: 5 }))).toBe(true);
    expect(isProductPurchasable(product({ qty: undefined }))).toBe(true);
  });

  it('isProductPurchasable blocks zero qty and ecommerce flag', () => {
    expect(isProductPurchasable(product({ qty: 0 }))).toBe(false);
    expect(isProductPurchasable(product({ qty: 10, ecommerceOutOfStock: true }))).toBe(false);
  });
});
