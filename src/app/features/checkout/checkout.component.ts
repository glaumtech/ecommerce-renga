import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { OrderService, SavedCheckoutAddress } from '../../core/services/order.service';
import { SeoService } from '../../core/services/seo.service';
import { PAYMENT_METHOD_COD } from '../../core/models/order.model';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';
import { ProductImagePipe } from '../../shared/pipes/product-image.pipe';

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
  imports: [ReactiveFormsModule, AppCurrencyPipe, ProductImagePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly seoService = inject(SeoService);

  readonly cartItems = this.cartService.items;
  readonly cartSubtotal = this.cartService.cartTotal;
  readonly shippingFee = this.cartService.shippingFee;
  readonly cartTotal = this.cartService.orderTotal;
  readonly cartCount = this.cartService.cartCount;
  readonly loading = this.orderService.loading;
  readonly addressesLoading = this.orderService.addressesLoading;
  readonly savedAddresses = this.orderService.savedAddresses;
  readonly checkoutError = this.orderService.error;
  readonly selectedAddressId = signal<'new' | string>('new');

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
    this.seoService.applyNoIndex('Checkout');
    if (this.cartService.items().length === 0) {
      void this.router.navigate(['/cart']);
      return;
    }

    const storedMobile = this.orderService.lookupMobile();
    if (storedMobile && MOBILE_PATTERN.test(storedMobile)) {
      this.form.patchValue({ mobile: storedMobile });
      this.loadSavedAddresses(storedMobile);
    }

    this.form.controls.mobile.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(400),
        distinctUntilChanged(),
        filter((value) => MOBILE_PATTERN.test(value)),
        takeUntilDestroyed()
      )
      .subscribe((mobile) => this.loadSavedAddresses(mobile));
  }

  handleCheckout(): void {
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
    const mobile = value.mobile.trim();

    this.orderService
      .placeOrder({
        firstName: value.firstName,
        lastName: value.lastName,
        mobile,
        email: email || undefined,
        streetAddress: value.streetAddress,
        city: value.city,
        state: value.state,
        zipCode: value.zipCode,
        paymentMethod: PAYMENT_METHOD_COD,
        items: this.cartService.getCheckoutItems(),
      })
      .subscribe({
        next: () => {
          this.cartService.clear();
          this.orderService.setLookupMobile(mobile);
          void this.router.navigate(['/account']);
        },
      });
  }

  selectSavedAddress(address: SavedCheckoutAddress): void {
    this.selectedAddressId.set(address.id);
    this.applyAddressToForm(address);
  }

  selectNewAddress(): void {
    this.selectedAddressId.set('new');
    this.form.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
    });
  }

  formatAddress(address: SavedCheckoutAddress): string {
    return `${address.streetAddress}, ${address.city}, ${address.state} ${address.zipCode}`;
  }

  formatAddressName(address: SavedCheckoutAddress): string {
    const first = address.firstName ?? '';
    const last = address.lastName ?? '';
    return `${first} ${last}`.trim() || 'Saved address';
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

  private loadSavedAddresses(mobile: string): void {
    this.orderService.loadAddressesByMobile(mobile).subscribe((addresses) => {
      if (addresses.length > 0) {
        this.selectSavedAddress(addresses[0]);
      } else {
        this.selectNewAddress();
      }
    });
  }

  private applyAddressToForm(address: SavedCheckoutAddress): void {
    this.form.patchValue({
      firstName: address.firstName ?? '',
      lastName: address.lastName ?? '',
      email: address.email ?? '',
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    });
  }
}
