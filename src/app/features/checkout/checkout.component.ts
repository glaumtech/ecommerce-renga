import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderHttpError, OrderService } from '../../core/services/order.service';
import { PAYMENT_METHOD_COD } from '../../core/models/order.model';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function optionalEmail(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string)?.trim();
  if (!value) {
    return null;
  }
  return EMAIL_PATTERN.test(value) ? null : { email: true };
}

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, AppCurrencyPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cartSubtotal = this.cartService.cartTotal;
  readonly shippingFee = this.cartService.shippingFee;
  readonly cartTotal = this.cartService.orderTotal;
  readonly cartCount = this.cartService.cartCount;
  readonly loading = this.orderService.loading;
  readonly checkoutError = this.orderService.error;
  readonly orderSuccessRef = signal<string | null>(null);

  readonly paymentMethod = PAYMENT_METHOD_COD;
  readonly inputClass =
    'w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none';

  readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    mobile: ['', [Validators.required, Validators.pattern(MOBILE_PATTERN)]],
    email: ['', optionalEmail],
    streetAddress: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zipCode: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.cartService.items().length === 0) {
      void this.router.navigate(['/cart']);
    }
  }

  handleCheckout(): void {
    this.orderSuccessRef.set(null);

    if (this.cartService.items().length === 0) {
      void this.router.navigate(['/cart']);
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const email = value.email.trim();

    this.orderService
      .placeOrder({
        firstName: value.firstName,
        lastName: value.lastName,
        mobile: value.mobile.trim(),
        email: email || undefined,
        streetAddress: value.streetAddress,
        city: value.city,
        state: value.state,
        zipCode: value.zipCode,
        paymentMethod: PAYMENT_METHOD_COD,
        items: this.cartService.getCheckoutItems(),
      })
      .subscribe({
        next: (order) => {
          this.cartService.clear();
          this.orderService.loadOrders();
          this.orderSuccessRef.set(order.orderRef);
          void this.router.navigate(['/account']);
        },
        error: (err: OrderHttpError) => {
          if (err.status === 401) {
            this.authService.clearSession();
            void this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
          }
        },
      });
  }

  fieldError(controlName: keyof typeof this.form.controls): string | null {
    const control = this.form.controls[controlName];
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      const labels: Record<string, string> = {
        firstName: 'First name is required.',
        lastName: 'Last name is required.',
        mobile: 'Mobile number is required.',
        streetAddress: 'Street address is required.',
        city: 'City is required.',
        state: 'State is required.',
        zipCode: 'ZIP code is required.',
      };
      return labels[controlName] ?? 'This field is required.';
    }
    if (controlName === 'mobile' && control.errors['pattern']) {
      return 'Enter a valid 10-digit mobile number.';
    }
    if (controlName === 'email' && control.errors['email']) {
      return 'Enter a valid email address.';
    }
    return null;
  }
}
