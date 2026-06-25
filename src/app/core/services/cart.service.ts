import { Injectable, computed, effect, inject, Injector, runInInjectionContext, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart.model';
import { resolveProductImageUrl } from '../utils/product-image.util';
import { getLocalItem, isBrowserPlatform, setLocalItem } from '../utils/browser-storage.util';

const CART_STORAGE_KEY = 'ananda_cart';
const SHIPPING_FEE = 60;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cart = signal<CartItem[]>(this.readFromStorage());

  readonly items = this.cart.asReadonly();
  readonly cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
  readonly cartCount = computed(() =>
    this.cart().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly shippingFee = SHIPPING_FEE;
  readonly orderTotal = computed(() => this.cartTotal() + SHIPPING_FEE);

  private readonly injector = inject(Injector);

  constructor() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (isBrowserPlatform()) {
          setLocalItem(CART_STORAGE_KEY, JSON.stringify(this.cart()));
        }
      });
    });
  }

  addToCart(product: Product, quantity = 1): void {
    const qty = Math.max(1, quantity);
    this.cart.update((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, image: resolveProductImageUrl(product.image), quantity: qty }];
    });
  }

  updateQuantity(id: number, delta: number): void {
    this.cart.update((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      })
    );
  }

  removeFromCart(id: number): void {
    this.cart.update((prev) => prev.filter((item) => item.id !== id));
  }

  clear(): void {
    this.cart.set([]);
  }

  getCheckoutItems(): { productId: number; quantity: number }[] {
    return this.cart().map((item) => ({ productId: item.id, quantity: item.quantity }));
  }

  private readFromStorage(): CartItem[] {
    try {
      const raw = getLocalItem(CART_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      const items = JSON.parse(raw) as CartItem[];
      return items.map((item) => ({
        ...item,
        image: resolveProductImageUrl(item.image),
      }));
    } catch {
      return [];
    }
  }
}
