import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { StoreSeoService } from '../../core/services/store-seo.service';

@Component({
  selector: 'app-return-policy',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './return-policy.component.html',
  styleUrl: './return-policy.component.css',
})
export class ReturnPolicyComponent implements OnInit {
  private readonly seoService = inject(SeoService);
  private readonly storeSeoService = inject(StoreSeoService);

  readonly lastUpdated = 'July 11, 2026';

  ngOnInit(): void {
    this.seoService.applyReturnPolicySeo(this.storeSeoService.settings());
  }
}
