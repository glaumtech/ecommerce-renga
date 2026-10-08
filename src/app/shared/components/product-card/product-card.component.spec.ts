import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProductCardComponent } from './product-card.component';
import { Product } from '../../../core/models/product.model';

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;

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
    qty: 10,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductCardComponent);
  });

  it('AC-EC-01 shows Will be available soon when ecommerceOutOfStock', () => {
    fixture.componentRef.setInput('product', { ...base, ecommerceOutOfStock: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Will be available soon');
  });

  it('AC-EC-04 does not emit addToCart when ecommerceOutOfStock', () => {
    fixture.componentRef.setInput('product', { ...base, ecommerceOutOfStock: true });
    fixture.detectChanges();
    const emitted: Product[] = [];
    fixture.componentInstance.addToCart.subscribe((p) => emitted.push(p));
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(emitted.length).toBe(0);
    expect(button.disabled).toBe(true);
  });
});
