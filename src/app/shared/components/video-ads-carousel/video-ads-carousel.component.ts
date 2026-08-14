import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  effect,
  inject,
  input,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoreVideoAd } from '../../../core/models/video-ad.model';

@Component({
  selector: 'app-video-ads-carousel',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-ads-carousel.component.html',
  styleUrl: './video-ads-carousel.component.css',
})
export class VideoAdsCarouselComponent {
  readonly ads = input.required<StoreVideoAd[]>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly track = viewChild<ElementRef<HTMLElement>>('track');
  private readonly hostRef = inject(ElementRef);
  private readonly reels = viewChildren<ElementRef<HTMLVideoElement>>('reel');

  readonly canScrollPrev = signal(false);
  readonly canScrollNext = signal(false);
  readonly playingIndex = signal(0);
  readonly muted = signal(true);
  readonly userPaused = signal(false);
  readonly progress = signal(0);

  private sectionVisible = false;
  private observer: IntersectionObserver | null = null;

  constructor() {
    effect(() => {
      this.ads();
      queueMicrotask(() => this.updateScrollState());
    });

    afterNextRender(() => this.initPlayback());

    this.destroyRef.onDestroy(() => {
      this.observer?.disconnect();
      this.pauseAll();
    });
  }

  scroll(direction: 'prev' | 'next'): void {
    const trackEl = this.track()?.nativeElement;
    if (!trackEl) {
      return;
    }
    const card = trackEl.querySelector<HTMLElement>('[data-carousel-card]');
    const gap = 20;
    const amount = card ? card.offsetWidth + gap : trackEl.clientWidth * 0.7;
    trackEl.scrollBy({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  }

  onScroll(): void {
    this.updateScrollState();
  }

  onEnded(index: number): void {
    const count = this.ads().length;
    if (count === 0) {
      return;
    }
    const next = (index + 1) % count;
    this.userPaused.set(false);
    void this.playIndex(next);
  }

  onTimeUpdate(index: number, event: Event): void {
    if (index !== this.playingIndex()) {
      return;
    }
    const video = event.target as HTMLVideoElement;
    if (!video.duration) {
      this.progress.set(0);
      return;
    }
    this.progress.set((video.currentTime / video.duration) * 100);
  }

  onVideoClick(index: number, event: Event): void {
    event.preventDefault();
    if (index !== this.playingIndex()) {
      this.userPaused.set(false);
      void this.playIndex(index);
      return;
    }
    const video = this.videoAt(index);
    if (!video) {
      return;
    }
    if (video.paused) {
      this.userPaused.set(false);
      void video.play().catch(() => undefined);
    } else {
      video.pause();
      this.userPaused.set(true);
    }
  }

  toggleMute(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const nextMuted = !this.muted();
    this.muted.set(nextMuted);
    const video = this.videoAt(this.playingIndex());
    if (video) {
      video.muted = nextMuted;
    }
  }

  private initPlayback(): void {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35);
        this.sectionVisible = visible;
        if (visible && !this.userPaused()) {
          void this.playIndex(this.playingIndex());
        } else if (!visible) {
          this.pauseAll();
        }
      },
      { threshold: [0, 0.35, 0.7] }
    );
    this.observer.observe(this.hostRef.nativeElement);
    this.updateScrollState();
  }

  private async playIndex(index: number): Promise<void> {
    const videos = this.reels();
    if (!videos.length) {
      return;
    }
    const safeIndex = ((index % videos.length) + videos.length) % videos.length;
    this.playingIndex.set(safeIndex);
    this.progress.set(0);

    videos.forEach((ref, i) => {
      const video = ref.nativeElement;
      if (i !== safeIndex && !video.paused) {
        video.pause();
        video.currentTime = 0;
      }
    });

    const trackEl = this.track()?.nativeElement;
    const card = trackEl?.querySelectorAll<HTMLElement>('[data-carousel-card]')[safeIndex];
    card?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    const video = videos[safeIndex].nativeElement;
    video.muted = this.muted();
    if (!this.sectionVisible || this.userPaused()) {
      return;
    }
    try {
      await video.play();
    } catch {
      video.muted = true;
      this.muted.set(true);
      try {
        await video.play();
      } catch {
        // Autoplay blocked until a user gesture.
      }
    }
  }

  private pauseAll(): void {
    for (const ref of this.reels()) {
      const video = ref.nativeElement;
      if (!video.paused) {
        video.pause();
      }
    }
  }

  private videoAt(index: number): HTMLVideoElement | null {
    return this.reels()[index]?.nativeElement ?? null;
  }

  private updateScrollState(): void {
    const track = this.track();
    if (!track) {
      return;
    }
    const trackEl = track.nativeElement;
    const maxScroll = trackEl.scrollWidth - trackEl.clientWidth;
    this.canScrollPrev.set(trackEl.scrollLeft > 4);
    this.canScrollNext.set(maxScroll > 4 && trackEl.scrollLeft < maxScroll - 4);
  }
}
