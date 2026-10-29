/**
 * CategoryManager — Singleton in-memory CRUD for Category entities
 */

import type { Category, CategoryNode, CreateCategoryInput, UpdateCategoryInput } from '../types/category';

class CategoryManager {
  private static instance: CategoryManager;
  private categories: Map<string, Category> = new Map();

  private constructor() {}

  /** Get the singleton instance */
  public static getInstance(): CategoryManager {
    if (!CategoryManager.instance) {
      CategoryManager.instance = new CategoryManager();
    }
    return CategoryManager.instance;
  }

  /** Create a new category */
  public create(input: CreateCategoryInput): Category {
    const now = new Date();
    const category: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: input.name,
      slug: input.slug,
      description: input.description ?? '',
      parentId: input.parentId ?? null,
      image: input.image ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.categories.set(category.id, category);
    return category;
  }

  /** Find a category by ID */
  public findById(id: string): Category | undefined {
    return this.categories.get(id);
  }

  /** Get all categories */
  public findAll(): Category[] {
    return Array.from(this.categories.values());
  }

  /** Find categories by parent ID */
  public findByParent(parentId: string | null): Category[] {
    return Array.from(this.categories.values()).filter(
      (c) => c.parentId === parentId
    );
  }

  /** Find a category by slug */
  public findBySlug(slug: string): Category | undefined {
    return Array.from(this.categories.values()).find((c) => c.slug === slug);
  }

  /** Update a category by ID */
  public update(id: string, input: UpdateCategoryInput): Category | undefined {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updated: Category = {
      ...category,
      ...input,
      updatedAt: new Date(),
    };
    this.categories.set(id, updated);
    return updated;
  }

  /** Delete a category by ID */
  public delete(id: string): boolean {
    return this.categories.delete(id);
  }

  /** Get the full category tree (nested) */
  public getTree(): CategoryNode[] {
    const roots = this.findByParent(null);
    const buildTree = (parentId: string | null): CategoryNode[] => {
      const children = this.findByParent(parentId);
      return children.map((c) => ({
        ...c,
        children: buildTree(c.id),
      }));
    };
    return roots.map((r) => ({ ...r, children: buildTree(r.id) }));
  }
}

export const categoryManager = CategoryManager.getInstance();
