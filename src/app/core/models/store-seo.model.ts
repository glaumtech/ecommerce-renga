export interface StoreMetaTag {
  attr: 'name' | 'property' | 'http-equiv';
  key: string;
  content: string;
}

export interface StoreSeoSettings {
  siteName?: string;
  siteUrl?: string;
  defaultDescription?: string;
  googleSiteVerification?: string;
  ogDefaultImage?: string;
  currency?: string;
  metaTags?: StoreMetaTag[];
}
