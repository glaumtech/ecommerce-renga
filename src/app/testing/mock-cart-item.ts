import { CartItem } from '../core/models/cart.model';

export function mockCartItem(
  overrides: Partial<CartItem> & Pick<CartItem, 'id' | 'name' | 'price' | 'quantity'>
): CartItem {
  return {
    slug: 'test-item',
    category: 'Test',
    rating: 0,
    reviews: 0,
    image: '',
    desc: 'test',
    ...overrides,
  };
}
