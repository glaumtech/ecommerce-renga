import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/api.model';
import {
  getSessionItem,
  removeSessionItem,
  setSessionItem,
} from '../utils/browser-storage.util';

export const AUTH_TOKEN_KEY = 'ananda_auth_token';
const SESSION_KEY = 'ananda_session_active';
const USERNAME_KEY = 'ananda_username';
const STAFF_KEY = 'ananda_staff_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reg`;

  private readonly sessionActive = signal(this.readSessionFlag());
  private readonly staffUser = signal(this.readStaffFlag());

  readonly isLoggedIn = computed(() => this.sessionActive());
  readonly isStaffUser = computed(() => this.sessionActive() && this.staffUser());
  readonly currentUser = computed(() =>
    this.sessionActive() ? getSessionItem(USERNAME_KEY) : null
  );
  readonly authToken = computed(() => getSessionItem(AUTH_TOKEN_KEY));

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.username && response.token) {
          setSessionItem(SESSION_KEY, 'true');
          setSessionItem(USERNAME_KEY, response.username);
          setSessionItem(AUTH_TOKEN_KEY, response.token);
          const isStaff = !!response.billingKioskUser;
          setSessionItem(STAFF_KEY, isStaff ? 'true' : 'false');
          this.sessionActive.set(true);
          this.staffUser.set(isStaff);
        }
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/save`, data);
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  /** Verify server session is still valid (uses Authorization Bearer token). */
  validateSession(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${this.baseUrl}/me`);
  }

  isAuthenticated(): boolean {
    return this.sessionActive() && !!getSessionItem(AUTH_TOKEN_KEY);
  }

  clearSession(): void {
    removeSessionItem(SESSION_KEY);
    removeSessionItem(USERNAME_KEY);
    removeSessionItem(AUTH_TOKEN_KEY);
    removeSessionItem(STAFF_KEY);
    this.sessionActive.set(false);
    this.staffUser.set(false);
  }

  private readSessionFlag(): boolean {
    return getSessionItem(SESSION_KEY) === 'true'
      && !!getSessionItem(AUTH_TOKEN_KEY);
  }

  private readStaffFlag(): boolean {
    return getSessionItem(STAFF_KEY) === 'true';
  }
}
