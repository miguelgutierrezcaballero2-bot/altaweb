/**
 * ProductManager — Singleton in-memory CRUD for Product entities
 */

import type { Product, CreateProductInput, UpdateProductInput } from '../types/product';

class ProductManager {
  private static instance: ProductManager;
  private products: Map<string, Product> = new Map();

  private constructor() {}

  /** Get the singleton instance */
  public static getInstance(): ProductManager {
    if (!ProductManager.instance) {
      ProductManager.instance = new ProductManager();
    }
    return ProductManager.instance;
  }

  /** Create a new product */
  public create(input: CreateProductInput): Product {
    const now = new Date();
    const product: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: input.name,
      description: input.description,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      images: input.images ?? [],
      categoryId: input.categoryId,
      sku: input.sku,
      stock: input.stock ?? 0,
      rating: input.rating ?? 0,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.products.set(product.id, product);
    return product;
  }

  /** Find a product by ID */
  public findById(id: string): Product | undefined {
    return this.products.get(id);
  }

  /** Get all products */
  public findAll(): Product[] {
    return Array.from(this.products.values());
  }

  /** Find products by category ID */
  public findByCategory(categoryId: string): Product[] {
    return Array.from(this.products.values()).filter(
      (p) => p.categoryId === categoryId
    );
  }

  /** Update a product by ID */
  public update(id: string, input: UpdateProductInput): Product | undefined {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updated: Product = {
      ...product,
      ...input,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  /** Delete a product by ID */
  public delete(id: string): boolean {
    return this.products.delete(id);
  }

  /** Search products by name (case-insensitive) */
  public searchByName(name: string): Product[] {
    const lower = name.toLowerCase();
    return Array.from(this.products.values()).filter((p) =>
      p.name.toLowerCase().includes(lower)
    );
  }

  /** Get all featured (active) products */
  public getFeatured(): Product[] {
    return Array.from(this.products.values()).filter(
      (p) => p.isActive && p.rating >= 4
    );
  }
}

export const productManager = ProductManager.getInstance();
