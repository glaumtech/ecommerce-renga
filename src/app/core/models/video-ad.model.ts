export interface StoreVideoAd {
  id: number;
  title: string;
  videoUrl: string;
  sortOrder: number;
  active: boolean;
  productId: number;
  productSlug: string;
  productName: string;
  productImage?: string;
}

export interface StoreVideoAdWritePayload {
  itemId: number;
  title?: string;
  sortOrder: number;
  active: boolean;
}
