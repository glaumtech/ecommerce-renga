import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  canUserCancelOrder,
  normalizeOrderStatus,
  orderStatusMessage,
  orderStatusProgress,
} from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { SeoService } from '../../core/services/seo.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

const MOBILE_PATTERN = /^[6-9]\d{9}$/;

@Component({
  selector: 'app-account',
  imports: [AppCurrencyPipe, DatePipe, RouterLink, LoadingSpinnerComponent, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly seoService = inject(SeoService);
  readonly orderService = inject(OrderService);

  readonly normalizeOrderStatus = normalizeOrderStatus;
  readonly orderStatusProgress = orderStatusProgress;
  readonly orderStatusMessage = orderStatusMessage;
  readonly canUserCancelOrder = canUserCancelOrder;

  readonly showMobileForm = signal(false);
  readonly cancelError = signal<string | null>(null);

  readonly displayName = computed(() => {
    const name = this.orderService.customerName();
    if (name) {
      return name;
    }
    return this.orderService.lookupMobile() ?? 'Guest';
  });

  readonly mobileForm = this.fb.nonNullable.group({
    mobile: ['', [Validators.required, Validators.pattern(MOBILE_PATTERN)]],
  });

  readonly inputClass =
    'w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none';

  ngOnInit(): void {
    this.seoService.applyNoIndex('My Account');
    const storedMobile = this.orderService.lookupMobile();
    if (storedMobile) {
      this.showMobileForm.set(false);
      this.orderService.loadOrdersByMobile(storedMobile);
    } else {
      this.showMobileForm.set(true);
    }
  }

  submitMobileLookup(): void {
    if (this.mobileForm.invalid) {
      this.mobileForm.markAllAsTouched();
      return;
    }

    const mobile = this.mobileForm.getRawValue().mobile.trim();
    this.showMobileForm.set(false);
    this.orderService.loadOrdersByMobile(mobile);
  }

  useDifferentNumber(): void {
    this.orderService.clearLookup();
    this.mobileForm.reset({ mobile: '' });
    this.cancelError.set(null);
    this.showMobileForm.set(true);
  }

  cancelOrder(orderId: string): void {
    const mobile = this.orderService.lookupMobile();
    if (!mobile) {
      return;
    }

    const confirmed = confirm('Are you sure you want to cancel this order?');
    if (!confirmed) {
      return;
    }

    this.cancelError.set(null);
    this.orderService.cancelOrder(orderId, mobile).subscribe({
      error: (err: Error) => this.cancelError.set(err.message),
    });
  }

  isCancelling(orderId: string): boolean {
    return this.orderService.cancellingOrderId() === orderId;
  }

  mobileFieldError(): string | null {
    const control = this.mobileForm.controls.mobile;
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'Mobile number is required.';
    }
    if (control.errors['pattern']) {
      return 'Enter a valid 10-digit mobile number.';
    }
    return null;
  }
}
