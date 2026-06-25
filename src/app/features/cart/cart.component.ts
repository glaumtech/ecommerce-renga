import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderSummaryComponent } from '../../shared/components/order-summary/order-summary.component';
import { AppCurrencyPipe } from '../../shared/pipes/app-currency.pipe';
import { ProductImagePipe } from '../../shared/pipes/product-image.pipe';

@Component({
  selector: 'app-cart',
  imports: [AppCurrencyPipe, ProductImagePipe, RouterLink, OrderSummaryComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart.component.html',
})
export class CartComponent {
  readonly cartService = inject(CartService);
}
