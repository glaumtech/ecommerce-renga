import { Product } from '../models/product.model';

export const ECOMMERCE_AVAILABLE_SOON = 'Will be available soon';

export function isProductPurchasable(p: Product): boolean {
  return !p.ecommerceOutOfStock && (p.qty == null || p.qty > 0);
}
