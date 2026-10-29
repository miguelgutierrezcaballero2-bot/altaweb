/**
 * Product — Luxury product catalog domain types
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  categoryId: string;
  sku: string;
  stock: number;
  rating: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images?: string[];
  categoryId: string;
  sku: string;
  stock?: number;
  rating?: number;
  isActive?: boolean;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number | null;
  images?: string[];
  categoryId?: string;
  sku?: string;
  stock?: number;
  rating?: number;
  isActive?: boolean;
}
