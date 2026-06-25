import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mobile-menu',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="md:hidden bg-white border-b border-amber-100 px-4 py-4 shadow-lg absolute w-full z-40">
      <div class="flex flex-col space-y-3">
        <a routerLink="/" (click)="close.emit()" class="text-left py-2 text-slate-800 font-medium border-b border-slate-50 no-underline">Home</a>
        <a routerLink="/shop" (click)="close.emit()" class="text-left py-2 text-slate-800 font-medium border-b border-slate-50 no-underline">Shop All Products</a>
        <a routerLink="/about-us" (click)="close.emit()" class="text-left py-2 text-slate-800 font-medium border-b border-slate-50 no-underline">About Us</a>
        <a routerLink="/account" (click)="close.emit()" class="text-left py-2 text-slate-800 font-medium no-underline">My Account</a>
      </div>
    </div>
  `,
})
export class MobileMenuComponent {
  readonly close = output<void>();
}
