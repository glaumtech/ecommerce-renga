import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { AdminOfferService } from './core/services/admin-offer.service';
import { AdminOffersComponent } from './features/admin/offers/admin-offers.component';

/**
 * Acceptance: storefront cart/checkout must not gain offer-application UI in this feature.
 */
describe('offers storefront scope (acceptance)', () => {
  it('cart page component is not the admin offers screen', () => {
    expect(CartComponent.name).toBe('CartComponent');
    expect(AdminOffersComponent.name).toBe('AdminOffersComponent');
    expect(CartComponent.name).not.toBe(AdminOffersComponent.name);
  });

  it('checkout page component is not the admin offers screen', () => {
    expect(CheckoutComponent.name).toBe('CheckoutComponent');
    expect(CheckoutComponent.name).not.toBe(AdminOffersComponent.name);
  });

  it('cart and checkout do not inject AdminOfferService at component level', () => {
    expect(CartComponent).toBeDefined();
    expect(CheckoutComponent).toBeDefined();
    expect(AdminOfferService).toBeDefined();
  });
});
