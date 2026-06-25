export interface CategoryTreeDto {
  id: number;
  name: string;
  description?: string;
  status: string;
  level: 'MAIN' | 'SUB';
  sortOrder: number;
  codeSequenceStart: number;
  itemCount: number;
  publishToEcommerce: boolean;
  subCategories: CategoryTreeDto[];
  isExpanded?: boolean;
}

export interface CategoryStatsDto {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
}

export interface CategoryCreateDto {
  name: string;
  description?: string;
  parentId?: number | null;
  sortOrder?: number;
  codeSequenceStart?: number;
  publishToEcommerce?: boolean;
}

export interface CategoryUpdateDto {
  name?: string;
  description?: string;
  sortOrder?: number;
  codeSequenceStart?: number;
  publishToEcommerce?: boolean;
}

export interface CategoryBulkSequenceDto {
  updates: { id: number; sortOrder?: number; codeSequenceStart?: number }[];
}

export interface CategoryBulkReparentDto {
  categoryIds: number[];
  targetParentId: number;
}
