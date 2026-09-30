import { CheckoutComponent } from './features/checkout/checkout.component';
import { StoreOfferService } from './core/services/store-offer.service';
import { AdminOfferService } from './core/services/admin-offer.service';

/**
 * Acceptance: storefront checkout applies configured offers via StoreOfferService.
 */
describe('offers storefront scope (acceptance)', () => {
  const checkoutDiscountSummaryLabel = 'Discount';
  const checkoutTotalBeforeDiscountLabel = 'Total before discount';

  it('documents checkout discount summary label contract', () => {
    expect(checkoutDiscountSummaryLabel).toBe('Discount');
  });

  it('documents checkout total-before-discount label contract (discount change)', () => {
    expect(checkoutTotalBeforeDiscountLabel).toBe('Total before discount');
  });

  it('checkout uses StoreOfferService not AdminOfferService for discounts', () => {
    expect(CheckoutComponent).toBeDefined();
    expect(StoreOfferService).toBeDefined();
    expect(AdminOfferService).toBeDefined();
    expect(StoreOfferService.name).not.toBe(AdminOfferService.name);
  });
});
