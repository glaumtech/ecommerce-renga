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
      if (!this.isBrowser) {
        return;
      }
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
    void this.playIndex(next, true);
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

  onVideoClick(index: number): void {
    if (!this.isBrowser) {
      return;
    }
    if (index !== this.playingIndex()) {
      this.userPaused.set(false);
      void this.playIndex(index, true);
      return;
    }
    const video = this.videoAt(index);
    if (!video || !this.isMediaElement(video)) {
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
    if (!this.isBrowser) {
      return;
    }
    const nextMuted = !this.muted();
    this.muted.set(nextMuted);
    const video = this.videoAt(this.playingIndex());
    if (this.isMediaElement(video)) {
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
          void this.playIndex(this.playingIndex(), false);
        } else if (!visible) {
          this.pauseAll();
        }
      },
      { threshold: [0.35] }
    );
    this.observer.observe(this.hostRef.nativeElement);
    this.updateScrollState();
  }

  private async playIndex(index: number, scrollTrack = false): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    const videos = this.reels();
    if (!videos.length) {
      return;
    }
    const safeIndex = ((index % videos.length) + videos.length) % videos.length;
    this.playingIndex.set(safeIndex);
    this.progress.set(0);

    videos.forEach((ref, i) => {
      const video = ref.nativeElement;
      if (i !== safeIndex && this.isMediaElement(video) && !video.paused) {
        video.pause();
        try {
          video.currentTime = 0;
        } catch {
          // Domino / incomplete media stubs may reject seek.
        }
      }
    });

    if (scrollTrack) {
      this.scrollTrackToIndex(safeIndex);
    }

    const video = videos[safeIndex].nativeElement;
    if (!this.isMediaElement(video)) {
      return;
    }
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
    if (!this.isBrowser) {
      return;
    }
    for (const ref of this.reels()) {
      const video = ref.nativeElement;
      if (this.isMediaElement(video) && !video.paused) {
        video.pause();
      }
    }
  }

  private isMediaElement(video: HTMLVideoElement | null | undefined): video is HTMLVideoElement {
    return !!video && typeof video.pause === 'function' && typeof video.play === 'function';
  }

  private scrollTrackToIndex(index: number): void {
    const trackEl = this.track()?.nativeElement;
    const card = trackEl?.querySelectorAll<HTMLElement>('[data-carousel-card]')[index];
    if (!trackEl || !card) {
      return;
    }
    const left = card.offsetLeft - (trackEl.clientWidth - card.offsetWidth) / 2;
    trackEl.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
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
