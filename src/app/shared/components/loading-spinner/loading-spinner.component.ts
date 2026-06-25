import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 text-slate-500">
      <div class="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
      @if (message()) {
        <p class="mt-4 text-sm">{{ message() }}</p>
      }
    </div>
  `,
})
export class LoadingSpinnerComponent {
  readonly message = input('Loading...');
}
