export interface ProductMedia {
  id: number;
  url: string;
  mediaType: 'image' | 'video';
  primary?: boolean;
  sortOrder?: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  category: string;
  mainCategory?: string;
  rating: number;
  reviews: number;
  image: string;
  media?: ProductMedia[];
  desc: string;
  brand?: string;
  qty?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoRobots?: string;
  ogImage?: string;
  canonicalUrl?: string;
  googleProductCategory?: string;
  gtin?: string;
  itemCondition?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  subCategories?: Category[];
}

export const ALL_CATEGORY = 'All';
