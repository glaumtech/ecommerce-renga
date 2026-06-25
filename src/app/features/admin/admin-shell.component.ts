import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-1 bg-gradient-to-r from-amber-600 to-orange-600 w-full"></div>
    <div class="min-h-screen bg-slate-50 font-sans text-slate-900">
      <router-outlet />
    </div>
  `,
})
export class AdminShellComponent {}
