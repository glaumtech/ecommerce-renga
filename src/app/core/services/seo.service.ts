import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Product } from '../models/product.model';
import { StoreSeoSettings } from '../models/store-seo.model';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  private jsonLdScript: HTMLScriptElement | null = null;
  private canonicalLink: HTMLLinkElement | null = null;

  applyStoreDefaults(settings: StoreSeoSettings): void {
    const siteName = settings.siteName || 'Sri Renga Traders';
    const description = settings.defaultDescription || '';

    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
    }

    this.meta.updateTag({ property: 'og:site_name', content: siteName });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    if (settings.ogDefaultImage) {
      this.meta.updateTag({ property: 'og:image', content: settings.ogDefaultImage });
    }

    if (settings.googleSiteVerification) {
      this.meta.updateTag({
        name: 'google-site-verification',
        content: settings.googleSiteVerification,
      });
    }
  }

  applyProductSeo(product: Product, settings: StoreSeoSettings): void {
    const siteName = settings.siteName || 'Sri Renga Traders';
    const title = product.seoTitle || product.name;
    const description = product.seoDescription || product.desc || settings.defaultDescription || '';
    const image = product.ogImage || product.image || settings.ogDefaultImage || '';
    const canonicalUrl = product.canonicalUrl || `${settings.siteUrl?.replace(/\/+$/, '')}/${product.slug}`;
    const robots = product.seoRobots === 'noindex' ? 'noindex' : 'index';

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'title', content: title });
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: robots });

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: siteName });
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
    }

    this.setCanonical(canonicalUrl);
    this.setJsonLd(product, settings, canonicalUrl, image);
  }

  clearProductSeo(settings: StoreSeoSettings): void {
    const siteName = settings.siteName || 'Sri Renga Traders';
    this.title.setTitle(siteName);
    this.removeCanonical();
    this.removeJsonLd();
    this.applyStoreDefaults(settings);
  }

  private setCanonical(url: string): void {
    if (!this.canonicalLink) {
      this.canonicalLink = this.document.createElement('link');
      this.canonicalLink.setAttribute('rel', 'canonical');
      this.document.head.appendChild(this.canonicalLink);
    }
    this.canonicalLink.setAttribute('href', url);
  }

  private removeCanonical(): void {
    if (this.canonicalLink?.parentNode) {
      this.canonicalLink.parentNode.removeChild(this.canonicalLink);
      this.canonicalLink = null;
    }
  }

  private setJsonLd(
    product: Product,
    settings: StoreSeoSettings,
    url: string,
    image: string
  ): void {
    const currency = settings.currency || 'INR';
    const availability = (product.qty ?? 0) > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.seoTitle || product.name,
      description: product.seoDescription || product.desc || '',
      image: image ? [image] : [],
      url,
      sku: product.slug,
      brand: product.brand
        ? { '@type': 'Brand', name: product.brand }
        : undefined,
      offers: {
        '@type': 'Offer',
        url,
        priceCurrency: currency,
        price: product.price,
        availability,
        itemCondition: `https://schema.org/${this.toSchemaCondition(product.itemCondition)}`,
      },
    };

    if (product.gtin) {
      schema['gtin'] = product.gtin;
    }

    if (!this.jsonLdScript) {
      this.jsonLdScript = this.document.createElement('script');
      this.jsonLdScript.type = 'application/ld+json';
      this.document.head.appendChild(this.jsonLdScript);
    }
    this.jsonLdScript.textContent = JSON.stringify(schema);
  }

  private removeJsonLd(): void {
    if (this.jsonLdScript?.parentNode) {
      this.jsonLdScript.parentNode.removeChild(this.jsonLdScript);
      this.jsonLdScript = null;
    }
  }

  private toSchemaCondition(condition?: string): string {
    switch ((condition || 'new').toLowerCase()) {
      case 'used':
        return 'UsedCondition';
      case 'refurbished':
        return 'RefurbishedCondition';
      default:
        return 'NewCondition';
    }
  }
}
