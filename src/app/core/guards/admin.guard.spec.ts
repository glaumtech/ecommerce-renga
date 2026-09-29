import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard (offers admin acceptance)', () => {
  const runGuard = () => TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never));

  it('blocks access when user is not authenticated (e.g. /admin/dashboard/offers)', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => false,
            isStaffUser: () => false,
          },
        },
      ],
    });

    const result = runGuard();
    expect(result).not.toBe(true);
    expect(result instanceof UrlTree).toBe(true);
  });

  it('blocks access when authenticated but not staff', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true,
            isStaffUser: () => false,
          },
        },
      ],
    });

    expect(runGuard()).not.toBe(true);
  });

  it('allows staff users to reach dashboard child routes', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => true,
            isStaffUser: () => true,
          },
        },
      ],
    });

    expect(runGuard()).toBe(true);
  });
});
