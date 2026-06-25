import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminOrderService } from '../../core/services/admin-order.service';
import { FulfillmentTicketComponent } from './components/fulfillment-ticket.component';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FulfillmentTicketComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in">
      <div class="flex flex-col lg:flex-row gap-8">
        <aside class="w-full lg:w-64 flex-shrink-0">
          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
            <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-800 font-bold">TR</div>
              <div>
                <h4 class="font-bold text-sm text-slate-800">TrueUP Masters</h4>
                <p class="text-[10px] text-slate-400 font-semibold uppercase">Fulfillment Admin</p>
              </div>
            </div>
            <nav class="space-y-1.5">
              <p class="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 pl-3">Menu</p>
              <a
                routerLink="/admin/dashboard/orders"
                routerLinkActive="bg-blue-600 text-white"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all"
              >
                Orders Fulfillment
              </a>
              <a
                routerLink="/admin/dashboard/categories"
                routerLinkActive="bg-blue-600 text-white"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all"
              >
                Category Master
              </a>
            </nav>
            <div class="pt-6 border-t border-slate-100 flex flex-col gap-2">
              <span class="text-xs bg-amber-50 border border-amber-100 text-amber-900 px-3 py-2 rounded-xl font-bold text-center">
                {{ authService.currentUser() || 'Staff' }}
              </span>
              <button
                type="button"
                (click)="logout()"
                class="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50/50 hover:bg-red-50 p-2.5 rounded-xl transition-all"
              >
                Logout Portal
              </button>
            </div>
          </div>
        </aside>
        <main class="flex-1 min-w-0">
          <router-outlet />
        </main>
      </div>
    </div>

    @if (adminOrderService.fulfillmentScreenshotMode()) {
      <div
        class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-2 sm:p-6 flex items-end sm:items-center justify-center"
        (click)="adminOrderService.fulfillmentScreenshotMode.set(false)"
      >
        <div (click)="$event.stopPropagation()">
          <app-fulfillment-ticket
            [order]="adminOrderService.selectedOrder()"
            (close)="adminOrderService.fulfillmentScreenshotMode.set(false)"
          />
        </div>
      </div>
    }
  `,
})
export class AdminLayoutComponent {
  readonly authService = inject(AuthService);
  readonly adminOrderService = inject(AdminOrderService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout().subscribe({
      next: () => void this.router.navigate(['/admin']),
      error: () => {
        this.authService.clearSession();
        void this.router.navigate(['/admin']);
      },
    });
  }
}
