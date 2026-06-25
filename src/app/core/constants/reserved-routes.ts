/** App paths that must never be treated as product slugs. */
export const RESERVED_ROUTE_PATHS = new Set([
  'shop',
  'cart',
  'checkout',
  'account',
  'about-us',
  'admin',
  'login',
  'register',
]);

export function isReservedRoutePath(path: string): boolean {
  return RESERVED_ROUTE_PATHS.has(path.toLowerCase());
}

const PRODUCT_SLUG_PATTERN = /^[a-z0-9_]+$/;

/** True when the URL is a product detail page (/:slug), not a reserved app route. */
export function isProductDetailPath(url: string): boolean {
  const segment = url.split('?')[0].split('#')[0].replace(/^\/+/, '').split('/')[0] ?? '';
  return !!segment && !isReservedRoutePath(segment) && PRODUCT_SLUG_PATTERN.test(segment);
}
