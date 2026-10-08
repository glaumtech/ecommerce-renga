import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductInfoComponent } from './product-info.component';
import { Product } from '../../../core/models/product.model';

describe('ProductInfoComponent', () => {
  let fixture: ComponentFixture<ProductInfoComponent>;

  const base: Product = {
    id: 1,
    slug: 'item',
    name: 'Item',
    price: 100,
    category: 'Cat',
    rating: 4.5,
    reviews: 0,
    image: '',
    desc: '',
    qty: 5,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductInfoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductInfoComponent);
  });

  it('disables purchase actions when ecommerceOutOfStock', () => {
    fixture.componentRef.setInput('product', { ...base, ecommerceOutOfStock: true });
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const buyNow = buttons[2] as HTMLButtonElement;
    const addToCart = buttons[3] as HTMLButtonElement;
    expect(buyNow.disabled).toBe(true);
    expect(addToCart.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Will be available soon');
  });

  it('enables purchase actions when purchasable', () => {
    fixture.componentRef.setInput('product', base);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const buyNow = buttons[2] as HTMLButtonElement;
    expect(buyNow.disabled).toBe(false);
  });

  it('AC-EC-02 shows Out of stock for zero qty without ecommerce flag', () => {
    fixture.componentRef.setInput('product', { ...base, qty: 0, ecommerceOutOfStock: false });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Out of stock');
    expect(text).not.toContain('Will be available soon');
  });

  it('AC-EC-03 shows Will be available soon and not In stock when flagged with qty', () => {
    fixture.componentRef.setInput('product', { ...base, qty: 10, ecommerceOutOfStock: true });
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Will be available soon');
    expect(text).not.toContain('In stock');
  });

  it('AC-EC-05 disables quantity controls when not purchasable', () => {
    fixture.componentRef.setInput('product', { ...base, ecommerceOutOfStock: true });
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect((buttons[0] as HTMLButtonElement).disabled).toBe(true);
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);
  });
});
