import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isReservedRoutePath } from '../constants/reserved-routes';

export const productSlugGuard: CanActivateFn = (route) => {
  const slug = route.paramMap.get('slug');
  if (slug && isReservedRoutePath(slug)) {
    return inject(Router).createUrlTree(['/', slug]);
  }
  return true;
};
