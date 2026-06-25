export function isBrowserPlatform(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function getSessionItem(key: string): string | null {
  if (!isBrowserPlatform()) {
    return null;
  }
  return sessionStorage.getItem(key);
}

export function setSessionItem(key: string, value: string): void {
  if (isBrowserPlatform()) {
    sessionStorage.setItem(key, value);
  }
}

export function removeSessionItem(key: string): void {
  if (isBrowserPlatform()) {
    sessionStorage.removeItem(key);
  }
}

export function getLocalItem(key: string): string | null {
  if (!isBrowserPlatform()) {
    return null;
  }
  return localStorage.getItem(key);
}

export function setLocalItem(key: string, value: string): void {
  if (isBrowserPlatform()) {
    localStorage.setItem(key, value);
  }
}
