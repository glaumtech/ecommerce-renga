import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { getCategoryHubBySlug } from '../constants/category-seo.constants';

export const categoryHubGuard: CanActivateFn = (route) => {
  const slug = route.paramMap.get('categorySlug');
  if (!slug || !getCategoryHubBySlug(slug)) {
    return inject(Router).createUrlTree(['/shop']);
  }
  return true;
};
