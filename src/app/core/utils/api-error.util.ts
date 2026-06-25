import { HttpErrorResponse } from '@angular/common/http';

const TECHNICAL_PATTERNS = [
  /https?:\/\//i,
  /Http failure/i,
  /Unknown Error/i,
  /status code/i,
  /ERR_/i,
  /\/api\//i,
];

export function isTechnicalMessage(message: string): boolean {
  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(message));
}

export function toUserFriendlyErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string {
  if (error instanceof HttpErrorResponse) {
    const serverMessage =
      typeof error.error?.message === 'string'
        ? error.error.message
        : typeof error.error?.error === 'string'
          ? error.error.error
          : null;

    if (serverMessage && !isTechnicalMessage(serverMessage)) {
      return serverMessage;
    }

    if (error.status === 0) {
      return fallback;
    }
    if (error.status === 401) {
      return 'Please sign in to continue.';
    }
    if (error.status === 404) {
      return 'The requested item was not found.';
    }
    if (error.status === 400 && typeof error.error === 'string' && !isTechnicalMessage(error.error)) {
      return error.error;
    }
    if (error.status >= 500) {
      return fallback;
    }
    return fallback;
  }

  if (error instanceof Error && error.message && !isTechnicalMessage(error.message)) {
    return error.message;
  }

  return fallback;
}
