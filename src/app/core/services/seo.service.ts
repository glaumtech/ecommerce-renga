import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { CategoryHubSeo, getCategoryHubByName } from '../constants/category-seo.constants';
import { Product } from '../models/product.model';
import { StoreMetaTag, StoreSeoSettings } from '../models/store-seo.model';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  private jsonLdScripts = new Map<string, HTMLScriptElement>();
  private canonicalLink: HTMLLinkElement | null = null;
  private readonly appliedMetaSelectors = new Set<string>();

  applyStoreDefaults(settings: StoreSeoSettings): void {
    const siteName = settings.siteName || 'Sri Renga Traders';
    const description = settings.defaultDescription || '';
    const siteUrl = settings.siteUrl?.replace(/\/+$/, '') || 'https://rengaa.in';

    this.title.setTitle(siteName);
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    }

    this.meta.updateTag({ property: 'og:title', content: siteName });
    this.meta.updateTag({ property: 'og:site_name', content: siteName });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'robots', content: 'index' });

    if (settings.ogDefaultImage) {
      this.meta.updateTag({ property: 'og:image', content: settings.ogDefaultImage });
    }

    this.setCanonical(siteUrl + '/');
    this.applySiteMetaTags(settings);
    this.setOrganizationJsonLd(settings);
    this.removeJsonLd('product');
    this.removeJsonLd('breadcrumb');
  }

  applyShopSeo(settings: StoreSeoSettings): void {
    const siteName = settings.siteName || 'Sri Renga Traders';
    const title = `Shop All Products | ${siteName}`;
    const description =
      settings.defaultDescription ||
      'Browse pooja essentials, brassware, and herbal products online in Trichy.';
    const canonicalUrl = `${settings.siteUrl?.replace(/\/+$/, '') || 'https://rengaa.in'}/shop`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

    this.setCanonical(canonicalUrl);
    this.applySiteMetaTags(settings);
    this.setOrganizationJsonLd(settings);
    this.removeJsonLd('product');
    this.removeJsonLd('breadcrumb');
  }

  applyCategoryHubSeo(hub: CategoryHubSeo, settings: StoreSeoSettings): void {
    const siteName = settings.siteName || 'Sri Renga Traders';
    const title = `${hub.title} in Trichy | ${siteName}`;
    const canonicalUrl = `${settings.siteUrl?.replace(/\/+$/, '') || 'https://rengaa.in'}/shop/${hub.slug}`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: hub.description });
    this.meta.updateTag({ name: 'robots', content: 'index' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: hub.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

    this.setCanonical(canonicalUrl);
    this.applySiteMetaTags(settings);
    this.setOrganizationJsonLd(settings);
    this.removeJsonLd('product');
    this.removeJsonLd('breadcrumb');
  }

  applyReturnPolicySeo(settings: StoreSeoSettings): void {
    const siteName = settings.siteName || 'Sri Renga Traders';
    const title = `Return & Replacement Policy | ${siteName}`;
    const description =
      'Products can be replaced within 3 days of delivery if damaged, defective, or incorrect. Read our return and replacement policy at Sri Renga Traders.';
    const canonicalUrl = `${settings.siteUrl?.replace(/\/+$/, '') || 'https://rengaa.in'}/return-policy`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

    this.setCanonical(canonicalUrl);
    this.applySiteMetaTags(settings);
    this.setOrganizationJsonLd(settings);
    this.removeJsonLd('product');
    this.removeJsonLd('breadcrumb');
  }

  applyAboutSeo(settings: StoreSeoSettings): void {
    const siteName = settings.siteName || 'Sri Renga Traders';
    const title = `About Us | ${siteName}, Trichy`;
    const description =
      settings.defaultDescription ||
      `Discover ${siteName} — rooted in Srirangam, Trichy, offering pure pooja essentials, natural herbal wellness, and premium sacred brassware with devotion since 2016.`;
    const canonicalUrl = `${settings.siteUrl?.replace(/\/+$/, '') || 'https://rengaa.in'}/about-us`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

    this.setCanonical(canonicalUrl);
    this.applySiteMetaTags(settings);
    this.setOrganizationJsonLd(settings);
    this.removeJsonLd('product');
    this.removeJsonLd('breadcrumb');
  }

  applyNoIndex(title: string, description?: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
    }
    this.removeCanonical();
    this.removeAllJsonLd();
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
    this.setProductJsonLd(product, settings, canonicalUrl, image);
    this.setProductBreadcrumbJsonLd(product, settings);
    this.setOrganizationJsonLd(settings);
    this.applySiteMetaTags(settings);
  }

  clearProductSeo(settings: StoreSeoSettings): void {
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

  private setOrganizationJsonLd(settings: StoreSeoSettings): void {
    const siteUrl = settings.siteUrl?.replace(/\/+$/, '') || 'https://rengaa.in';
    const siteName = settings.siteName || 'Sri Renga Traders';

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/brand-logo.png`,
      image: `${siteUrl}/brand-logo.png`,
      telephone: '+91-9080298354',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Trichy',
        addressRegion: 'Tamil Nadu',
        addressCountry: 'IN',
      },
      areaServed: 'Trichy',
      description: settings.defaultDescription || undefined,
    };

    this.setJsonLd('organization', schema);
  }

  private setProductBreadcrumbJsonLd(product: Product, settings: StoreSeoSettings): void {
    const siteUrl = settings.siteUrl?.replace(/\/+$/, '') || 'https://rengaa.in';
    const items: Array<{ '@type': string; position: number; name: string; item?: string }> = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${siteUrl}/shop` },
    ];

    if (product.category) {
      const hub = getCategoryHubByName(product.mainCategory || product.category);
      const categoryUrl = hub
        ? `${siteUrl}/shop/${hub.slug}`
        : `${siteUrl}/shop?category=${encodeURIComponent(product.category)}`;
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: categoryUrl,
      });
      items.push({
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `${siteUrl}/${product.slug}`,
      });
    } else {
      items.push({
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${siteUrl}/${product.slug}`,
      });
    }

    this.setJsonLd('breadcrumb', {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items,
    });
  }

  private setProductJsonLd(
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

    this.setJsonLd('product', schema);
  }

  private setJsonLd(key: string, schema: Record<string, unknown>): void {
    let script = this.jsonLdScripts.get(key);
    if (!script) {
      script = this.document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', key);
      this.document.head.appendChild(script);
      this.jsonLdScripts.set(key, script);
    }
    script.textContent = JSON.stringify(schema);
  }

  private removeJsonLd(key: string): void {
    const script = this.jsonLdScripts.get(key);
    if (script?.parentNode) {
      script.parentNode.removeChild(script);
      this.jsonLdScripts.delete(key);
    }
  }

  private removeAllJsonLd(): void {
    for (const key of [...this.jsonLdScripts.keys()]) {
      this.removeJsonLd(key);
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
