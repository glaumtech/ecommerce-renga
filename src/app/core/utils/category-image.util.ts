import { environment } from '../../../environments/environment';
import { PRODUCT_PLACEHOLDER_IMAGE } from './product-image.util';

/**
 * Resolves main category image URLs from the storefront API (`StoreCategoryDto.imageUrl`).
 */
export function resolveCategoryImageUrl(image?: string | null): string {
  if (!image?.trim()) {
    return PRODUCT_PLACEHOLDER_IMAGE;
  }

  let url = image.trim();

  if (url.includes('/api/category/image/')) {
    const path = url.substring(url.indexOf('/api/category/image/'));
    return `${environment.apiUrl}${path}`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${environment.apiUrl}${url.startsWith('/') ? url : `/${url}`}`;
}
