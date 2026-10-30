"use client";

/**
 * PDP sticky add-to-cart (Fase 9) — mobile-first polish.
 *
 * Shows product, live price and the SAME AddToCartButton island the card
 * uses (shared cart store; auto-opens the drawer — no add-logic duplicated).
 * Optionally shows how many units of this product are already in the cart.
 * Desktop keeps the inline panel CTA; the bar is hidden there (lg:hidden).
 */

import { formatPrice } from '@/components/catalog/product-card';
import { AddToCartButton } from '@/components/catalog/add-to-cart-button';
import { useCartStore } from '@/lib/store/cart-store';

interface StickyAddToCartProps {
  product: {
    productId: string;
    name: string;
    price: number;
    image: string | null;
  };
  /** Server-side stock snapshot; the shared CTA is disabled when sold out. */
  stock: number;
}

export function StickyAddToCart({ product, stock }: StickyAddToCartProps) {
  const units = useCartStore((state) =>
    state.items
      .filter((item) => item.productId === product.productId)
      .reduce((sum, item) => sum + item.qty, 0),
  );

  if (stock <= 0) return null;

  return (
    <div
      role="complementary"
      aria-label="Barra de compra rápida"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">
            {product.name}
          </p>
          <p className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
            <span className="ml-2 text-xs font-medium text-muted-foreground">
              por unidad
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {units > 0 && (
            <span className="text-xs font-medium text-muted-foreground">
              {units} en el carrito
            </span>
          )}
          <AddToCartButton product={product} stock={stock} />
        </div>
      </div>
    </div>
  );
}
