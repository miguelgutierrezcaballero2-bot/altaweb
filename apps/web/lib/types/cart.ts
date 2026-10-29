/**
 * Cart — Shopping cart domain types
 */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

export interface Cart {
  id: string;
  userId: string | null;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  discountCode: string | null;
  discountAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCartInput {
  userId?: string | null;
  items?: CartItem[];
  discountCode?: string | null;
}

export interface AddCartItemInput {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  image?: string | null;
}

export interface UpdateCartItemInput {
  productId: string;
  quantity: number;
}

export interface ApplyDiscountInput {
  code: string;
  amount: number;
}
