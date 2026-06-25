import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-product-trust-badges',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white border border-slate-200 rounded-lg p-4 text-center">
        <div class="text-orange-600 mb-2 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
        </div>
        <p class="text-xs font-semibold text-slate-800">Authentic</p>
        <p class="text-[10px] text-slate-500 mt-1">Genuine products</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-4 text-center">
        <div class="text-orange-600 mb-2 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
        <p class="text-xs font-semibold text-slate-800">Fast Delivery</p>
        <p class="text-[10px] text-slate-500 mt-1">Across India</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-4 text-center">
        <div class="text-orange-600 mb-2 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <p class="text-xs font-semibold text-slate-800">Secure Pay</p>
        <p class="text-[10px] text-slate-500 mt-1">100% protected</p>
      </div>
      <div class="bg-white border border-slate-200 rounded-lg p-4 text-center">
        <div class="text-orange-600 mb-2 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </div>
        <p class="text-xs font-semibold text-slate-800">Easy Returns</p>
        <p class="text-[10px] text-slate-500 mt-1">7-day policy</p>
      </div>
    </div>
  `,
})
export class ProductTrustBadgesComponent {}
