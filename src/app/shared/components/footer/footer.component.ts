import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-[#773710] text-slate-300 py-12 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="col-span-1 md:col-span-2">
          <a routerLink="/" class="inline-flex items-center gap-3 bg-white rounded-lg px-4 py-2 mb-4 no-underline">
            <img
              src="brand-logo.png"
              alt="Sri Renga Pooja and Herbal Traders"
              class="h-16 w-auto object-contain flex-shrink-0"
              width="280"
              height="72"
            />
            <div class="leading-tight min-w-0">
              <span class="block text-base font-serif font-bold text-slate-800 leading-snug">Sri Renga Pooja</span>
              <span class="block text-sm font-medium text-amber-700 leading-snug">&amp; Herbal Traders</span>
            </div>
          </a>
          <p class="text-lg text-slate-400 mb-4 max-w-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="inline h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5.75C3 4.784 3.784 4 4.75 4h2.271c.689 0 1.279.43 1.488 1.083l.7 2.101a1.5 1.5 0 01-.345 1.518l-1.22 1.22a16.088 16.088 0 007.07 7.07l1.22-1.22A1.5 1.5 0 0116.816 15.7l2.101.7A1.5 1.5 0 0120 18.979V21.25A1.75 1.75 0 0118.25 23h-1C7.664 23 1 16.336 1 8.75v-1A1.75 1.75 0 012.75 6h.25z"/>
            </svg>
            Trichy &middot; 90802-98354
          </p>
     
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Shop</h4>
          <ul class="space-y-2 text-sm">
            @for (main of mainCategories(); track main.id) {
              <li>
                <a
                  [routerLink]="['/shop']"
                  [queryParams]="{ category: main.name }"
                  class="text-white hover:text-amber-500 transition-colors"
                >{{ main.name }}</a>
              </li>
         
            }
          </ul>
        </div>
        <div>
          <h4 class="text-white font-semibold mb-4">Customer Care</h4>
          <ul class="space-y-2 text-sm">
            <li><a routerLink="/about-us" class="hover:text-amber-500 transition-colors">About Us</a></li>
            <li><a routerLink="/account" class="hover:text-amber-500 transition-colors">Track Order</a></li>
            <li><a href="#" class="hover:text-amber-500 transition-colors">Shipping Policy</a></li>
            <li><a href="#" class="hover:text-amber-500 transition-colors">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
        <div class="flex justify-center mb-4">
          <a
            href="https://www.positivessl.com/"
            target="_blank"
            rel="noopener noreferrer"
            title="Click to Verify - This site chose Positive SSL for secure e-commerce communications."
          >
            <img
              src="https://www.positivessl.com/images/seals/positivessl_trust_seal_lg_222x54.png"
              alt="Secured by PositiveSSL"
              width="222"
              height="54"
              class="inline-block"
            />
          </a>
        </div>
        &copy; {{ currentYear }} Sri Renga Traders. All rights reserved.
      </div>
    </footer>
  `,
})
export class FooterComponent implements OnInit {
  private readonly productService = inject(ProductService);

  readonly currentYear = new Date().getFullYear();
  readonly mainCategories = computed(() =>
    [...this.productService.categories()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    )
  );

  ngOnInit(): void {
    if (this.productService.categories().length === 0) {
      this.productService.loadCategories();
    }
  }
}
