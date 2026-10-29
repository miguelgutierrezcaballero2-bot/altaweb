/**
 * Category — Product category hierarchy domain types
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  image?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}
