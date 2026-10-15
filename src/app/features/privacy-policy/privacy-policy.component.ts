import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { StoreSeoService } from '../../core/services/store-seo.service';

@Component({
  selector: 'app-privacy-policy',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css',
})
export class PrivacyPolicyComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly storeSeoService = inject(StoreSeoService);

  readonly lastUpdated = 'October 15, 2026';

  ngOnInit(): void {
    this.seoService.applyPrivacyPolicySeo(this.storeSeoService.settings());
  }
}
