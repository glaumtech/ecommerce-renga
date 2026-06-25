import { environment } from '../../../environments/environment';

/** Matches StorefrontService placeholder when a product has no image. */
export const PRODUCT_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1608518902048-b4b6baad3023?auto=format&fit=crop&q=80&w=400&h=300';

/**
 * Resolves product image URLs from the storefront API (`StoreProductDto.image`).
 * Supports full URLs from the backend and relative `/api/item/image/{filename}` paths.
 */
export function resolveProductImageUrl(image?: string | null): string {
  if (!image?.trim()) {
    return PRODUCT_PLACEHOLDER_IMAGE;
  }

  let url = image.trim();

  // Legacy path from older storefront responses
  if (url.includes('/items/image/')) {
    url = url.replace('/items/image/', '/api/item/image/');
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${environment.apiUrl}${url.startsWith('/') ? url : `/${url}`}`;
}
