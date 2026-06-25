import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, MobileMenuComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center gap-3 md:gap-4">
          <a routerLink="/" class="flex-shrink-0 flex items-center gap-2 sm:gap-3 no-underline">
            <img
              src="brand-logo.png"
              alt="Sri Renga Pooja and Herbal Traders"
              class="h-11 sm:h-14 w-auto object-contain"
              width="280"
              height="72"
            />
            <div class="hidden md:block leading-tight min-w-0">
              <span class="block text-base font-serif font-bold text-slate-800 leading-snug">Sri Renga Pooja</span>
              <span class="block text-sm font-medium text-amber-700 leading-snug">and Herbal Traders</span>
            </div>
          </a>

          <form (submit)="onSearch($event)" class="flex md:hidden flex-1 min-w-0 relative">
            <input
              type="search"
              placeholder="Search items..."
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </form>

          <form (submit)="onSearch($event)" class="hidden md:flex flex-1 min-w-0 relative">
            <input
              type="text"
              placeholder="Search items..."
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              class="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 transition-all"
            />
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </form>

          <div class="hidden md:flex items-center space-x-5 flex-shrink-0">

            <a routerLink="/account" class="text-slate-600 hover:text-amber-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </a>

            <a routerLink="/cart" class="text-slate-600 hover:text-amber-600 relative transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              @if (cartService.cartCount() > 0) {
                <span class="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ cartService.cartCount() }}</span>
              }
            </a>

            <a
              href="tel:9080298354"
              class="flex items-center gap-2 text-slate-800 hover:text-amber-700 transition-colors no-underline text-sm font-semibold whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5.75C3 4.784 3.784 4 4.75 4h2.271c.689 0 1.279.43 1.488 1.083l.7 2.101a1.5 1.5 0 01-.345 1.518l-1.22 1.22a16.088 16.088 0 007.07 7.07l1.22-1.22A1.5 1.5 0 0116.816 15.7l2.101.7A1.5 1.5 0 0120 18.979V21.25A1.75 1.75 0 0118.25 23h-1C7.664 23 1 16.336 1 8.75v-1A1.75 1.75 0 012.75 6h.25z"/>
              </svg>
              <span>Contact Us : 9080298354</span>
            </a>
          </div>

          <div class="md:hidden flex items-center space-x-3 flex-shrink-0">
            <a href="tel:9080298354" class="text-slate-800 hover:text-amber-700 transition-colors" aria-label="Contact Us 9080298354">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5.75C3 4.784 3.784 4 4.75 4h2.271c.689 0 1.279.43 1.488 1.083l.7 2.101a1.5 1.5 0 01-.345 1.518l-1.22 1.22a16.088 16.088 0 007.07 7.07l1.22-1.22A1.5 1.5 0 0116.816 15.7l2.101.7A1.5 1.5 0 0120 18.979V21.25A1.75 1.75 0 0118.25 23h-1C7.664 23 1 16.336 1 8.75v-1A1.75 1.75 0 012.75 6h.25z"/>
              </svg>
            </a>
            <a routerLink="/cart" class="text-slate-600 relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              @if (cartService.cartCount() > 0) {
                <span class="absolute -top-1 -right-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ cartService.cartCount() }}</span>
              }
            </a>
            <button (click)="mobileOpen.set(!mobileOpen())" class="text-slate-600" type="button">
              @if (mobileOpen()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              }
            </button>
          </div>
        </div>
      </div>

      @if (mobileOpen()) {
        <app-mobile-menu (close)="mobileOpen.set(false)" />
      }
    </header>
  `,
})
export class HeaderComponent {
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly searchQuery = signal('');
  readonly mobileOpen = signal(false);

  onSearch(event: Event): void {
    event.preventDefault();
    const q = this.searchQuery().trim();
    this.router.navigate(['/shop'], { queryParams: q ? { q } : {} });
  }

}
