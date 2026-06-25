import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  normalizeOrderStatus,
  orderStatusMessage,
  orderStatusProgress,
} from '../../core/models/order.model';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';

@Component({
  selector: 'app-account',
  imports: [AppCurrencyPipe, DatePipe, RouterLink, LoadingSpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly orderService = inject(OrderService);

  readonly normalizeOrderStatus = normalizeOrderStatus;
  readonly orderStatusProgress = orderStatusProgress;
  readonly orderStatusMessage = orderStatusMessage;

  ngOnInit(): void {
    this.orderService.loadOrders();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.orderService.orders.set([]);
        void this.router.navigate(['/'], { replaceUrl: true });
      },
      error: () => {
        this.authService.clearSession();
        this.orderService.orders.set([]);
        void this.router.navigate(['/'], { replaceUrl: true });
      },
    });
  }
}
