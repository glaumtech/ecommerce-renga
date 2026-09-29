export enum OfferType {
  FLAT_DISCOUNT = 'FLAT_DISCOUNT',
  COMBO_OFFER = 'COMBO_OFFER',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  CATEGORY_DISCOUNT = 'CATEGORY_DISCOUNT',
  BRAND_DISCOUNT = 'BRAND_DISCOUNT',
  CART_DISCOUNT = 'CART_DISCOUNT',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum TargetAudience {
  ALL_CUSTOMERS = 'ALL_CUSTOMERS',
  FIRST_TIME_BUYERS = 'FIRST_TIME_BUYERS',
  REPEAT_CUSTOMERS = 'REPEAT_CUSTOMERS',
}

export interface OfferProduct {
  productId: number;
  productName?: string;
  requiredQuantity: number;
  isFreeItem?: boolean;
  discountedPrice?: number;
  discountPercentage?: number;
  unit?: string;
  originalPrice?: number;
  filename?: string;
}

export interface OfferCreate {
  name: string;
  description?: string;
  type: OfferType;
  discountType: DiscountType;
  discountValue?: number;
  comboPrice?: number;
  buyQuantity?: number;
  getQuantity?: number;
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  targetAudience?: TargetAudience;
  usageLimit?: number;
  usageLimitPerCustomer?: number;
  categoryId?: number;
  brandId?: number;
  products?: OfferProduct[];
}

export type OfferStatus = 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'INACTIVE' | 'LIMIT_REACHED';

export interface Offer {
  id: number;
  name: string;
  description?: string;
  type: OfferType;
  discountType: DiscountType;
  discountValue?: number;
  comboPrice?: number;
  buyQuantity?: number;
  getQuantity?: number;
  minimumPurchaseAmount?: number;
  maximumDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  targetAudience: TargetAudience;
  usageLimit?: number;
  usageCount: number;
  usageLimitPerCustomer?: number;
  categoryId?: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  createdAt: string;
  updatedAt: string;
  products?: OfferProduct[];
  status: OfferStatus;
  canBeUsed: boolean;
  displayText: string;
}

export interface OfferStatistics {
  offerId: number;
  offerName: string;
  usageCount: number;
  totalDiscountGiven: number;
  averageDiscountPerUse: number;
}

export interface CatalogItem {
  id: number;
  name: string;
  unit?: string;
  sellingPrice?: number;
  description?: string;
}

export interface BrandOption {
  id: number;
  name: string;
}

export interface CategoryOption {
  id: number;
  name: string;
  level: string;
}

export interface ProductSelection {
  product: CatalogItem;
  quantity: number;
  isFreeItem: boolean;
  discountedPrice?: number;
  discountPercentage?: number;
}

export interface OfferTypeInfo {
  key: OfferType;
  label: string;
  description: string;
}

export interface OfferStatusInfo {
  key: string;
  label: string;
}

export const OFFER_TYPE_INFO: Record<OfferType, OfferTypeInfo> = {
  [OfferType.FLAT_DISCOUNT]: {
    key: OfferType.FLAT_DISCOUNT,
    label: 'Flat Discount',
    description: 'Fixed amount or percentage off on products',
  },
  [OfferType.COMBO_OFFER]: {
    key: OfferType.COMBO_OFFER,
    label: 'Combo Offer',
    description: 'Bundle multiple products at special price',
  },
  [OfferType.BUY_X_GET_Y]: {
    key: OfferType.BUY_X_GET_Y,
    label: 'Buy X Get Y',
    description: 'Buy certain quantity and get items free',
  },
  [OfferType.CATEGORY_DISCOUNT]: {
    key: OfferType.CATEGORY_DISCOUNT,
    label: 'Category Discount',
    description: 'Discount on all products in a category',
  },
  [OfferType.BRAND_DISCOUNT]: {
    key: OfferType.BRAND_DISCOUNT,
    label: 'Brand Discount',
    description: 'Discount on all products from a brand',
  },
  [OfferType.CART_DISCOUNT]: {
    key: OfferType.CART_DISCOUNT,
    label: 'Cart Discount',
    description: 'Discount based on minimum cart value',
  },
};

export const OFFER_STATUS_INFO: Record<string, OfferStatusInfo> = {
  ACTIVE: { key: 'ACTIVE', label: 'Active' },
  UPCOMING: { key: 'UPCOMING', label: 'Upcoming' },
  EXPIRED: { key: 'EXPIRED', label: 'Expired' },
  INACTIVE: { key: 'INACTIVE', label: 'Inactive' },
  LIMIT_REACHED: { key: 'LIMIT_REACHED', label: 'Limit Reached' },
};

export const DISCOUNT_TYPE_INFO: Record<DiscountType, { label: string; symbol: string }> = {
  [DiscountType.PERCENTAGE]: { label: 'Percentage (%)', symbol: '%' },
  [DiscountType.FIXED_AMOUNT]: { label: 'Fixed Amount (₹)', symbol: '₹' },
};

export const TARGET_AUDIENCE_INFO: Record<TargetAudience, string> = {
  [TargetAudience.ALL_CUSTOMERS]: 'All Customers',
  [TargetAudience.FIRST_TIME_BUYERS]: 'First-time Buyers',
  [TargetAudience.REPEAT_CUSTOMERS]: 'Repeat Customers',
};
