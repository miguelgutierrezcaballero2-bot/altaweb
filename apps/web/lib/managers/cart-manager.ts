/**
 * CartManager — Singleton in-memory CRUD for Cart entities
 */

import type { Cart, CartItem, CreateCartInput, AddCartItemInput, UpdateCartItemInput, ApplyDiscountInput } from '../types/cart';

class CartManager {
  private static instance: CartManager;
  private carts: Map<string, Cart> = new Map();

  private constructor() {}

  /** Get the singleton instance */
  public static getInstance(): CartManager {
    if (!CartManager.instance) {
      CartManager.instance = new CartManager();
    }
    return CartManager.instance;
  }

  /** Create a new cart */
  public create(input: CreateCartInput = {}): Cart {
    const now = new Date();
    const items = input.items ?? [];
    const subtotal = this.calculateSubtotal(items);
    const tax = subtotal * 0.08;
    const discountAmount = input.discountCode ? subtotal * 0.1 : 0;
    const total = subtotal + tax - discountAmount;

    const cart: Cart = {
      id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId: input.userId ?? null,
      items,
      subtotal,
      tax,
      total,
      discountCode: input.discountCode ?? null,
      discountAmount,
      createdAt: now,
      updatedAt: now,
    };
    this.carts.set(cart.id, cart);
    return cart;
  }

  /** Find a cart by ID */
  public findById(id: string): Cart | undefined {
    return this.carts.get(id);
  }

  /** Find carts by user ID */
  public findByUser(userId: string): Cart[] {
    return Array.from(this.carts.values()).filter((c) => c.userId === userId);
  }

  /** Get all carts */
  public findAll(): Cart[] {
    return Array.from(this.carts.values());
  }

  /** Add an item to a cart */
  public addItem(cartId: string, item: AddCartItemInput): Cart | undefined {
    const cart = this.carts.get(cartId);
    if (!cart) return undefined;

    const existingIndex = cart.items.findIndex((i) => i.productId === item.productId);
    const newItem: CartItem = {
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity ?? 1,
      image: item.image ?? null,
    };

    let newItems: CartItem[];
    if (existingIndex >= 0) {
      newItems = cart.items.map((i, idx) =>
        idx === existingIndex ? { ...i, quantity: i.quantity + newItem.quantity } : i
      );
    } else {
      newItems = [...cart.items, newItem];
    }

    const updated = this.recalculateCart(cart, newItems);
    this.carts.set(cartId, updated);
    return updated;
  }

  /** Remove an item from a cart */
  public removeItem(cartId: string, productId: string): Cart | undefined {
    const cart = this.carts.get(cartId);
    if (!cart) return undefined;

    const newItems = cart.items.filter((i) => i.productId !== productId);
    const updated = this.recalculateCart(cart, newItems);
    this.carts.set(cartId, updated);
    return updated;
  }

  /** Update item quantity in a cart */
  public updateItemQuantity(cartId: string, productId: string, quantity: number): Cart | undefined {
    const cart = this.carts.get(cartId);
    if (!cart) return undefined;

    if (quantity <= 0) {
      return this.removeItem(cartId, productId);
    }

    const newItems = cart.items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    const updated = this.recalculateCart(cart, newItems);
    this.carts.set(cartId, updated);
    return updated;
  }

  /** Clear all items from a cart */
  public clear(cartId: string): Cart | undefined {
    const cart = this.carts.get(cartId);
    if (!cart) return undefined;

    const cleared: Cart = {
      ...cart,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      discountAmount: 0,
      discountCode: null,
      updatedAt: new Date(),
    };
    this.carts.set(cartId, cleared);
    return cleared;
  }

  /** Apply a discount to a cart */
  public applyDiscount(cartId: string, code: string, amount: number): Cart | undefined {
    const cart = this.carts.get(cartId);
    if (!cart) return undefined;

    const updated: Cart = {
      ...cart,
      discountCode: code,
      discountAmount: amount,
      total: cart.subtotal + cart.tax - amount,
      updatedAt: new Date(),
    };
    this.carts.set(cartId, updated);
    return updated;
  }

  /** Calculate the total for a cart */
  public calculateTotal(cartId: string): Cart | undefined {
    const cart = this.carts.get(cartId);
    if (!cart) return undefined;

    const subtotal = this.calculateSubtotal(cart.items);
    const tax = subtotal * 0.08;
    const discountAmount = cart.discountCode ? subtotal * 0.1 : 0;
    const total = subtotal + tax - discountAmount;

    const updated: Cart = {
      ...cart,
      subtotal,
      tax,
      total,
      updatedAt: new Date(),
    };
    this.carts.set(cartId, updated);
    return updated;
  }

  /** Recalculate subtotal, tax, and total for a cart */
  private recalculateCart(cart: Cart, items: CartItem[]): Cart {
    const subtotal = this.calculateSubtotal(items);
    const tax = subtotal * 0.08;
    const discountAmount = cart.discountCode ? subtotal * 0.1 : 0;
    const total = subtotal + tax - discountAmount;

    return {
      ...cart,
      items,
      subtotal,
      tax,
      total,
      updatedAt: new Date(),
    };
  }

  /** Calculate subtotal from items */
  private calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
}

export const cartManager = CartManager.getInstance();
