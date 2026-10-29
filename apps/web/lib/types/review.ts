/**
 * Review — Product reviews and ratings domain types
 */

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  isVerified: boolean;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewInput {
  productId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  isVerified?: boolean;
}

export interface UpdateReviewStatusInput {
  status: ReviewStatus;
}

export interface ReviewRatingStats {
  averageRating: number;
  count: number;
  distribution: Record<number, number>;
}
