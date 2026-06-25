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
