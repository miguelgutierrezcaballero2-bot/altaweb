/**
 * ReviewManager — Singleton in-memory CRUD for Review entities
 */

import type { Review, CreateReviewInput, UpdateReviewStatusInput, ReviewRatingStats, ReviewStatus } from '../types/review';

class ReviewManager {
  private static instance: ReviewManager;
  private reviews: Map<string, Review> = new Map();

  private constructor() {}

  /** Get the singleton instance */
  public static getInstance(): ReviewManager {
    if (!ReviewManager.instance) {
      ReviewManager.instance = new ReviewManager();
    }
    return ReviewManager.instance;
  }

  /** Create a new review */
  public create(input: CreateReviewInput): Review {
    const now = new Date();
    const review: Review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      productId: input.productId,
      userId: input.userId,
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      isVerified: input.isVerified ?? false,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    this.reviews.set(review.id, review);
    return review;
  }

  /** Find a review by ID */
  public findById(id: string): Review | undefined {
    return this.reviews.get(id);
  }

  /** Get all reviews */
  public findAll(): Review[] {
    return Array.from(this.reviews.values());
  }

  /** Update a review by ID */
  public update(id: string, input: Partial<Review>): Review | undefined {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    const updated: Review = { ...review, ...input, updatedAt: new Date() };
    this.reviews.set(id, updated);
    return updated;
  }

  /** Delete a review by ID */
  public delete(id: string): boolean {
    return this.reviews.delete(id);
  }

  /** Find reviews by product ID */
  public findByProduct(productId: string): Review[] {
    return Array.from(this.reviews.values()).filter((r) => r.productId === productId);
  }

  /** Find reviews by user ID */
  public findByUser(userId: string): Review[] {
    return Array.from(this.reviews.values()).filter((r) => r.userId === userId);
  }

  /** Approve a review */
  public approve(id: string): Review | undefined {
    return this.updateStatus(id, 'approved');
  }

  /** Reject a review */
  public reject(id: string): Review | undefined {
    return this.updateStatus(id, 'rejected');
  }

  /** Get average rating for a product */
  public getAverageRating(productId: string): number {
    const reviews = this.findByProduct(productId);
    const approved = reviews.filter((r) => r.status === 'approved');
    if (approved.length === 0) return 0;
    const sum = approved.reduce((s, r) => s + r.rating, 0);
    return Math.round((sum / approved.length) * 10) / 10;
  }

  /** Get count of reviews for a product */
  public getCount(productId: string): number {
    return this.findByProduct(productId).length;
  }

  /** Update review status internally */
  private updateStatus(id: string, status: ReviewStatus): Review | undefined {
    const review = this.reviews.get(id);
    if (!review) return undefined;

    const updated: Review = {
      ...review,
      status,
      updatedAt: new Date(),
    };
    this.reviews.set(id, updated);
    return updated;
  }
}

export const reviewManager = ReviewManager.getInstance();
