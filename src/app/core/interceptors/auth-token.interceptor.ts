import { HttpInterceptorFn } from '@angular/common/http';
import { AUTH_TOKEN_KEY } from '../services/auth.service';
import { getSessionItem } from '../utils/browser-storage.util';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getSessionItem(AUTH_TOKEN_KEY);
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};
