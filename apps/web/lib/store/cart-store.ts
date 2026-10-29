/**
 * Cart store — client-side cart and drawer state for the storefront shell.
 * Phase 2 is local-only state; sync with the cart API domain lands in Phase 4.
 */

import { create } from 'zustand';

/** A line item kept in the cart until checkout/planning phases decide otherwise. */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  /** Drawer state */
  openCart: () => void;
  closeCart: () => void;

  /** Item mutations */
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  incrementQty: (productId: string) => void;
  decrementQty: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (item, qty = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.productId === item.productId ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }
      return { ...state, isOpen: true, items: [...state.items, { ...item, qty }] };
    }),

  incrementQty: (productId) =>
    set((state) => ({
      ...state,
      items: state.items.map((i) =>
        i.productId === productId ? { ...i, qty: i.qty + 1 } : i
      ),
    })),

  decrementQty: (productId) =>
    set((state) => ({
      ...state,
      items: state.items
        .map((i) => (i.productId === productId ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    })),

  removeItem: (productId) =>
    set((state) => ({
      ...state,
      items: state.items.filter((i) => i.productId !== productId),
    })),

  clearCart: () => set({ items: [] }),
}));

/** Selector: cart subtotal (unit price × qty, summed). */
export const selectSubtotal = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.price * item.qty, 0);

/** Selector: total units in the cart, for the header badge. */
export const selectTotalUnits = (state: CartState): number =>
  state.items.reduce((total, item) => total + item.qty, 0);
