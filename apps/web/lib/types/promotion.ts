/**
 * Promotion — Discount codes and promotions domain types
 */

export type DiscountType = 'percentage' | 'fixed';

export interface Promotion {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number | null;
  maxUses: number | null;
  usesCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableCategories: string[];
}

export interface CreatePromotionInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase?: number | null;
  maxUses?: number | null;
  validFrom: Date;
  validUntil: Date;
  isActive?: boolean;
  applicableCategories?: string[];
}

export interface ValidateCodeInput {
  code: string;
  categoryId?: string;
  purchaseAmount?: number;
}

export interface ValidationResult {
  isValid: boolean;
  promotion: Promotion | null;
  discountAmount: number;
  error: string | null;
}
