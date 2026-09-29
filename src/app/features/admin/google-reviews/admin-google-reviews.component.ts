import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {
  AdminGoogleReviewService,
  GoogleReviewsAdminListing,
} from '../../../core/services/admin-google-review.service';
import { GoogleReview } from '../../../core/data/google-reviews';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-google-reviews',
  imports: [LoadingSpinnerComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div
        class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 class="text-3xl font-serif font-bold text-slate-800">Google Reviews</h2>
          <p class="text-slate-500 text-xs mt-1">
            Sync the latest reviews from Google Maps for the storefront carousel
          </p>
        </div>
        <button
          type="button"
          (click)="sync()"
          [disabled]="syncing()"
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-sm"
        >
          {{ syncing() ? 'Syncing…' : 'Sync from Google Maps' }}
        </button>
      </div>

      @if (loading()) {
        <app-loading-spinner />
      } @else {
        @if (error()) {
          <div class="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold rounded-2xl p-4">
            {{ error() }}
          </div>
        }

        @if (adminListing(); as snapshot) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p class="text-slate-400 text-[10px] uppercase font-black tracking-wider">Place</p>
              <p class="text-lg font-black text-slate-800">{{ snapshot.listing.placeName || '—' }}</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p class="text-slate-400 text-[10px] uppercase font-black tracking-wider">Rating</p>
              <p class="text-3xl font-black text-amber-600">{{ snapshot.listing.rating || '—' }}</p>
              <p class="text-xs text-slate-500 mt-1">{{ snapshot.listing.reviewCount }} total on Google</p>
            </div>
            <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p class="text-slate-400 text-[10px] uppercase font-black tracking-wider">Last synced</p>
              <p class="text-sm font-bold text-slate-800">
                @if (snapshot.syncedAt) {
                  {{ snapshot.syncedAt | date: 'medium' }}
                } @else {
                  Not synced yet
                }
              </p>
              @if (snapshot.syncError) {
                <p class="text-xs text-red-600 mt-2">{{ snapshot.syncError }}</p>
              }
            </div>
          </div>

          @if (snapshot.listing.mapsUrl) {
            <a
              [href]="snapshot.listing.mapsUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              Open listing on Google Maps
            </a>
          }

          <div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100">
              <h3 class="text-sm font-black uppercase tracking-wider text-slate-500">Synced review preview</h3>
            </div>
            @if (previewReviews().length === 0) {
              <p class="p-6 text-sm text-slate-500 italic">No synced reviews yet. Run sync after configuring the Google Places API key.</p>
            } @else {
              <ul class="divide-y divide-slate-100">
                @for (review of previewReviews(); track review.author + review.relativeTime) {
                  <li class="p-6">
                    <div class="flex items-center justify-between gap-4 mb-2">
                      <p class="font-bold text-slate-800">{{ review.author }}</p>
                      <span class="text-xs text-slate-400">{{ review.relativeTime }}</span>
                    </div>
                    <p class="text-xs text-amber-700 font-semibold mb-2">{{ review.rating }} / 5 stars</p>
                    <p class="text-sm text-slate-600 leading-relaxed">{{ review.text }}</p>
                  </li>
                }
              </ul>
            }
          </div>
        }
      }
    </div>
  `,
})
export class AdminGoogleReviewsComponent implements OnInit {
  private readonly adminGoogleReviewService = inject(AdminGoogleReviewService);

  readonly loading = signal(true);
  readonly syncing = signal(false);
  readonly error = signal<string | null>(null);
  readonly adminListing = signal<GoogleReviewsAdminListing | null>(null);
  readonly previewReviews = signal<GoogleReview[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminGoogleReviewService.getListing().subscribe({
      next: (listing) => {
        this.adminListing.set(listing);
        this.previewReviews.set(listing.listing?.reviews ?? []);
        this.loading.set(false);
      },
      error: (message: string) => {
        this.error.set(message);
        this.loading.set(false);
      },
    });
  }

  sync(): void {
    this.syncing.set(true);
    this.error.set(null);
    this.adminGoogleReviewService.syncFromGoogle().subscribe({
      next: (listing) => {
        this.adminListing.set(listing);
        this.previewReviews.set(listing.listing?.reviews ?? []);
        this.syncing.set(false);
      },
      error: (message: string) => {
        this.error.set(message);
        this.syncing.set(false);
      },
    });
  }
}
