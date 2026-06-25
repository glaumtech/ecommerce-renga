import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden py-10 px-8 mt-12 animate-in">
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md shadow-amber-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="text-white w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2 class="text-2xl font-serif font-bold text-slate-800">Staff Portal</h2>
        <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Sri Renga Pooja & Herbal</p>
      </div>

      @if (loginError()) {
        <div class="bg-red-50 text-red-700 text-xs font-bold p-4 rounded-xl border border-red-200 mb-6">
          {{ loginError() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Username</label>
            <input formControlName="username" type="text" class="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 focus:bg-white transition-all font-medium" placeholder="Staff username" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Password</label>
            <div class="relative">
              <input
                formControlName="password"
                [type]="showPassword() ? 'text' : 'password'"
                class="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 focus:bg-white transition-all font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                (click)="showPassword.set(!showPassword())"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                [attr.aria-pressed]="showPassword()"
              >
                @if (showPassword()) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                }
              </button>
            </div>
          </div>
        </div>

        <button type="submit" [disabled]="form.invalid || submitting()" class="w-full bg-slate-900 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-slate-900/10 text-sm tracking-wide">
          {{ submitting() ? 'Signing in...' : 'Sign In as Admin' }}
        </button>
      </form>

      <p class="text-center text-slate-400 text-[11px] mt-6 font-medium">Staff accounts require billing kiosk access enabled.</p>
    </div>
  `,
})
export class AdminLoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loginError = signal<string | null>(null);
  readonly submitting = signal(false);
  readonly showPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    if (this.authService.isStaffUser()) {
      void this.router.navigate(['/admin/dashboard/orders']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.loginError.set(null);

    const { username, password } = this.form.getRawValue();

    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        this.submitting.set(false);
        if (!response.billingKioskUser) {
          this.authService.clearSession();
          this.loginError.set('This account does not have staff portal access.');
          return;
        }
        void this.router.navigate(['/admin/dashboard/orders']);
      },
      error: () => {
        this.submitting.set(false);
        this.loginError.set('Invalid administrator credentials. Please check your inputs.');
      },
    });
  }
}
