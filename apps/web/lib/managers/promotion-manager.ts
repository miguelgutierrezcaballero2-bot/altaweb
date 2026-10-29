/**
 * PromotionManager — Singleton in-memory CRUD for Promotion entities
 */

import type {
  Promotion,
  CreatePromotionInput,
  ValidateCodeInput,
  ValidationResult,
} from '../types/promotion';

class PromotionManager {
  private static instance: PromotionManager;
  private promotions: Map<string, Promotion> = new Map();

  private constructor() {}

  /** Get the singleton instance */
  public static getInstance(): PromotionManager {
    if (!PromotionManager.instance) {
      PromotionManager.instance = new PromotionManager();
    }
    return PromotionManager.instance;
  }

  /** Create a new promotion */
  public create(input: CreatePromotionInput): Promotion {
    const promotion: Promotion = {
      id: `prom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      code: input.code,
      discountType: input.discountType,
      discountValue: input.discountValue,
      minPurchase: input.minPurchase ?? null,
      maxUses: input.maxUses ?? null,
      usesCount: 0,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      isActive: input.isActive ?? true,
      applicableCategories: input.applicableCategories ?? [],
    };
    this.promotions.set(promotion.id, promotion);
    return promotion;
  }

  /** Find a promotion by code */
  public findByCode(code: string): Promotion | undefined {
    return Array.from(this.promotions.values()).find((p) => p.code === code);
  }

  /** Get all promotions */
  public findAll(): Promotion[] {
    return Array.from(this.promotions.values());
  }

  /** Validate a discount code against purchase context */
  public validateCode(input: ValidateCodeInput): ValidationResult {
    const promotion = this.findByCode(input.code);
    if (!promotion) {
      return { isValid: false, promotion: null, discountAmount: 0, error: 'Invalid promo code' };
    }

    if (!promotion.isActive) {
      return { isValid: false, promotion: null, discountAmount: 0, error: 'Promotion is not active' };
    }

    if (this.isExpired(promotion)) {
      return { isValid: false, promotion: null, discountAmount: 0, error: 'Promotion has expired' };
    }

    if (promotion.maxUses !== null && promotion.usesCount >= promotion.maxUses) {
      return { isValid: false, promotion: null, discountAmount: 0, error: 'Promotion has reached max uses' };
    }

    if (input.purchaseAmount !== undefined && promotion.minPurchase !== null && input.purchaseAmount < promotion.minPurchase) {
      return { isValid: false, promotion: null, discountAmount: 0, error: `Minimum purchase of $${promotion.minPurchase} required` };
    }

    if (
      input.categoryId &&
      promotion.applicableCategories.length > 0 &&
      !promotion.applicableCategories.includes(input.categoryId)
    ) {
      return { isValid: false, promotion: null, discountAmount: 0, error: 'Promotion not applicable to this category' };
    }

    const discountAmount = promotion.discountType === 'percentage'
      ? (promotion.discountValue / 100) * (input.purchaseAmount ?? 0)
      : promotion.discountValue;

    return {
      isValid: true,
      promotion,
      discountAmount: Math.round(discountAmount * 100) / 100,
      error: null,
    };
  }

  /** Apply discount and increment uses */
  public applyDiscount(code: string): Promotion | undefined {
    const promotion = this.findByCode(code);
    if (!promotion || !promotion.isActive) return undefined;
    if (this.isExpired(promotion)) return undefined;

    const updated: Promotion = {
      ...promotion,
      usesCount: promotion.usesCount + 1,
    };
    this.promotions.set(promotion.id, updated);
    return updated;
  }

  /** Increment the use count for a promotion */
  public incrementUses(code: string): Promotion | undefined {
    const promotion = this.findByCode(code);
    if (!promotion) return undefined;

    const updated: Promotion = {
      ...promotion,
      usesCount: promotion.usesCount + 1,
    };
    this.promotions.set(promotion.id, updated);
    return updated;
  }

  /** Update a promotion by code */
  public update(code: string, input: Partial<Promotion>): Promotion | undefined {
    const promotion = this.findByCode(code);
    if (!promotion) return undefined;
    const updated: Promotion = { ...promotion, ...input };
    this.promotions.set(promotion.id, updated);
    return updated;
  }

  /** Delete a promotion by code */
  public delete(code: string): boolean {
    const promotion = this.findByCode(code);
    if (!promotion) return false;
    return this.promotions.delete(promotion.id);
  }

  /** Check if a promotion is expired */
  public isExpired(promotion: Promotion): boolean {
    const now = new Date();
    return now < promotion.validFrom || now > promotion.validUntil;
  }

  /** Get all active (non-expired) promotions */
  public getActivePromotions(): Promotion[] {
    const now = new Date();
    return Array.from(this.promotions.values()).filter((p) => {
      if (!p.isActive) return false;
      return now >= p.validFrom && now <= p.validUntil;
    });
  }
}

export const promotionManager = PromotionManager.getInstance();
