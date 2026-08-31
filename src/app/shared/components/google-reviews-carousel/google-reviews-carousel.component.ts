import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { GoogleReview } from '../../../core/data/google-reviews';
import { GoogleReviewService } from '../../../core/services/google-review.service';

const AUTO_ADVANCE_MS = 5000;
const TEXT_PREVIEW_LIMIT = 180;

@Component({
  selector: 'app-google-reviews-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './google-reviews-carousel.component.html',
  styleUrl: './google-reviews-carousel.component.css',
})
export class GoogleReviewsCarouselComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly googleReviewService = inject(GoogleReviewService);

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  readonly listing = this.googleReviewService.listing;
  readonly reviews = computed(() => this.listing().reviews);
  readonly stars = [1, 2, 3, 4, 5];

  readonly canScrollPrev = signal(false);
  readonly canScrollNext = signal(false);
  readonly expandedAuthors = signal<ReadonlySet<string>>(new Set());

  private timer: ReturnType<typeof setInterval> | null = null;
  private paused = false;
  private sectionVisible = true;
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.googleReviewService.load();

    effect(() => {
      this.reviews();
      if (!this.isBrowser) {
        return;
      }
      queueMicrotask(() => {
        this.updateScrollState();
        this.startAutoAdvance();
      });
    });

    afterNextRender(() => {
      this.updateScrollState();
      this.startAutoAdvance();
      this.observeVisibility();
    });

    this.destroyRef.onDestroy(() => {
      this.stopAutoAdvance();
      this.observer?.disconnect();
    });
  }

  scroll(direction: 'prev' | 'next'): void {
    const trackEl = this.track()?.nativeElement;
    if (!trackEl) {
      return;
    }
    const card = trackEl.querySelector<HTMLElement>('[data-carousel-card]');
    const gap = 24;
    const amount = card ? card.offsetWidth + gap : trackEl.clientWidth * 0.85;
    trackEl.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  onScroll(): void {
    this.updateScrollState();
  }

  onPointerEnter(): void {
    this.paused = true;
  }

  onPointerLeave(): void {
    this.paused = false;
  }

  toggleExpand(review: GoogleReview): void {
    const next = new Set(this.expandedAuthors());
    if (next.has(review.author)) {
      next.delete(review.author);
    } else {
      next.add(review.author);
    }
    this.expandedAuthors.set(next);
  }

  isLong(review: GoogleReview): boolean {
    return review.text.length > TEXT_PREVIEW_LIMIT;
  }

  isExpanded(review: GoogleReview): boolean {
    return this.expandedAuthors().has(review.author);
  }

  displayText(review: GoogleReview): string {
    if (!this.isLong(review) || this.isExpanded(review)) {
      return review.text;
    }
    return `${review.text.slice(0, TEXT_PREVIEW_LIMIT).trimEnd()}…`;
  }

  authorInitial(author: string): string {
    const trimmed = author.trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : 'G';
  }

  private observeVisibility(): void {
    const trackEl = this.track()?.nativeElement;
    if (!this.isBrowser || !trackEl) {
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        this.sectionVisible = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    this.observer.observe(trackEl);
  }

  private startAutoAdvance(): void {
    if (!this.isBrowser || this.reviews().length < 2) {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return;
    }

    this.stopAutoAdvance();
    this.timer = setInterval(() => this.autoAdvance(), AUTO_ADVANCE_MS);
  }

  private stopAutoAdvance(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private autoAdvance(): void {
    if (this.paused || !this.sectionVisible) {
      return;
    }
    const trackEl = this.track()?.nativeElement;
    if (!trackEl) {
      return;
    }
    const maxScroll = trackEl.scrollWidth - trackEl.clientWidth;
    if (maxScroll <= 4) {
      return;
    }
    if (trackEl.scrollLeft >= maxScroll - 8) {
      trackEl.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    this.scroll('next');
  }

  private updateScrollState(): void {
    const trackEl = this.track()?.nativeElement;
    if (!trackEl) {
      return;
    }
    const maxScroll = trackEl.scrollWidth - trackEl.clientWidth;
    this.canScrollPrev.set(trackEl.scrollLeft > 4);
    this.canScrollNext.set(maxScroll > 4 && trackEl.scrollLeft < maxScroll - 4);
  }
}
