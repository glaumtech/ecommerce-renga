import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

export interface CategoryCarouselItem {
  id: number;
  title: string;
  img: string;
  desc: string;
  hubSlug?: string;
  imageAlt: string;
}

@Component({
  selector: 'app-category-carousel',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-carousel.component.html',
  styleUrl: './category-carousel.component.css',
})
export class CategoryCarouselComponent implements AfterViewInit {
  readonly categories = input.required<CategoryCarouselItem[]>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  readonly canScrollPrev = signal(false);
  readonly canScrollNext = signal(false);

  constructor() {
    effect(() => {
      this.categories();
      queueMicrotask(() => this.updateScrollState());
    });
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.updateScrollState());
  }

  categoryLink(cat: CategoryCarouselItem): (string | Record<string, string>)[] {
    return cat.hubSlug ? ['/shop', cat.hubSlug] : ['/shop'];
  }

  categoryQueryParams(cat: CategoryCarouselItem): { category: string } | null {
    return cat.hubSlug ? null : { category: cat.title };
  }

  scroll(direction: 'prev' | 'next'): void {
    const trackEl = this.track().nativeElement;
    const card = trackEl.querySelector<HTMLElement>('[data-carousel-card]');
    const gap = 32;
    const amount = card ? card.offsetWidth + gap : trackEl.clientWidth * 0.85;

    trackEl.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  onScroll(): void {
    this.updateScrollState();
  }

  private updateScrollState(): void {
    const trackEl = this.track().nativeElement;
    const maxScroll = trackEl.scrollWidth - trackEl.clientWidth;
    this.canScrollPrev.set(trackEl.scrollLeft > 4);
    this.canScrollNext.set(maxScroll > 4 && trackEl.scrollLeft < maxScroll - 4);
  }
}
