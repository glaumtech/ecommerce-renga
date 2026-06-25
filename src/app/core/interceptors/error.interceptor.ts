import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { toUserFriendlyErrorMessage } from '../utils/api-error.util';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('[HTTP Error]', req.url, error.status, error.message);
      const message = toUserFriendlyErrorMessage(error);
      const wrapped = new Error(message) as Error & { status?: number };
      wrapped.status = error.status;
      return throwError(() => wrapped);
    })
  );
};
