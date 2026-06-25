import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center space-x-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="w-4 h-4 shrink-0 fill-amber-400 text-amber-400" viewBox="0 0 24 24" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      <span class="text-sm font-medium text-slate-700">{{ rating() }}</span>
      <span class="text-xs text-slate-400">({{ reviews() }})</span>
    </div>
  `,
})
export class StarRatingComponent {
  readonly rating = input(0);
  readonly reviews = input(0);
}
