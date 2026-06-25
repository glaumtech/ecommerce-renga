import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Product } from '../models/product.model';
import { StoreMetaTag, StoreSeoSettings } from '../models/store-seo.model';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  private jsonLdScript: HTMLScriptElement | null = null;
  private canonicalLink: HTMLLinkElement | null = null;
  private readonly appliedMetaSelectors = new Set<string>();

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

    this.applySiteMetaTags(settings);
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
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.meta.updateTag({ property: 'og:site_name', content: siteName });
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
    }

    this.setCanonical(canonicalUrl);
    this.setJsonLd(product, settings, canonicalUrl, image);
    this.applySiteMetaTags(settings);
  }

  clearProductSeo(settings: StoreSeoSettings): void {
    const siteName = settings.siteName || 'Sri Renga Traders';
    this.title.setTitle(siteName);
    this.removeCanonical();
    this.removeJsonLd();
    this.applyStoreDefaults(settings);
  }

  private applySiteMetaTags(settings: StoreSeoSettings): void {
    const tags = this.resolveMetaTags(settings);
    const nextSelectors = new Set<string>();

    for (const tag of tags) {
      const selector = this.metaSelector(tag);
      if (!selector) {
        continue;
      }
      nextSelectors.add(selector);
      const definition = this.metaDefinition(tag);
      if (!definition) {
        continue;
      }
      this.meta.updateTag(definition, selector);
    }

    for (const selector of this.appliedMetaSelectors) {
      if (!nextSelectors.has(selector)) {
        this.meta.removeTag(selector);
      }
    }

    this.appliedMetaSelectors.clear();
    nextSelectors.forEach((selector) => this.appliedMetaSelectors.add(selector));
  }

  private resolveMetaTags(settings: StoreSeoSettings): StoreMetaTag[] {
    if (settings.metaTags?.length) {
      return settings.metaTags.filter(
        (tag) => tag?.key?.trim() && tag?.content?.trim() && tag?.attr
      );
    }
    if (settings.googleSiteVerification?.trim()) {
      return [
        {
          attr: 'name',
          key: 'google-site-verification',
          content: settings.googleSiteVerification.trim(),
        },
      ];
    }
    return [];
  }

  private metaDefinition(tag: StoreMetaTag): { name?: string; property?: string; httpEquiv?: string; content: string } | null {
    const content = tag.content?.trim();
    if (!content) {
      return null;
    }
    switch (tag.attr) {
      case 'name':
        return { name: tag.key, content };
      case 'property':
        return { property: tag.key, content };
      case 'http-equiv':
        return { httpEquiv: tag.key, content };
      default:
        return null;
    }
  }

  private metaSelector(tag: StoreMetaTag): string | null {
    const key = tag.key?.trim();
    if (!key) {
      return null;
    }
    switch (tag.attr) {
      case 'name':
        return `name='${key}'`;
      case 'property':
        return `property='${key}'`;
      case 'http-equiv':
        return `httpEquiv='${key}'`;
      default:
        return null;
    }
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

    if (product.googleProductCategory) {
      schema['category'] = product.googleProductCategory;
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
