import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../models/product.model';

describe('CartService', () => {
  let service: CartService;

  const baseProduct: Product = {
    id: 1,
    slug: 'item',
    name: 'Item',
    price: 100,
    category: 'Cat',
    rating: 4.5,
    reviews: 0,
    image: '/img.png',
    desc: '',
    qty: 10,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
    service.clear();
  });

  it('addToCart skips ecommerce out-of-stock products', () => {
    service.addToCart({ ...baseProduct, ecommerceOutOfStock: true });
    expect(service.items().length).toBe(0);
  });

  it('addToCart adds purchasable products', () => {
    const added = service.addToCart(baseProduct);
    expect(added).toBe(true);
    expect(service.items().length).toBe(1);
  });

  it('AC-EC-09 purchasable product can be added to cart (happy path unit)', () => {
    expect(service.addToCart({ ...baseProduct, ecommerceOutOfStock: false })).toBe(true);
    expect(service.getCheckoutItems()).toEqual([{ productId: 1, quantity: 1 }]);
  });

  it('AC-EC-10 flagged product cannot be added after admin marks OOS', () => {
    service.addToCart(baseProduct);
    expect(service.items().length).toBe(1);
    const flagged = { ...baseProduct, ecommerceOutOfStock: true };
    expect(service.addToCart(flagged)).toBe(false);
    expect(service.items().length).toBe(1);
  });
});
