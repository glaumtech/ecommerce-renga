import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <h3 class="text-xl font-medium text-slate-800 mb-2">{{ title() }}</h3>
      <p class="text-slate-500 max-w-md mx-auto">{{ description() }}</p>
      @if (actionLabel()) {
        <button
          (click)="action.emit()"
          class="mt-6 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input('Nothing here yet');
  readonly description = input('');
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
