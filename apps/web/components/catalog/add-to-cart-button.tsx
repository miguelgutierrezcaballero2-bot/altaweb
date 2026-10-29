"use client";

/**
 * Add-to-cart CTA — the only client island in the catalog.
 * Feeds the zustand cart store; the cart drawer and header badge react
 * automatically through the same store.
 */

import { ShoppingCartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/store/cart-store';

interface AddToCartButtonProps {
  /** Serializable subset of the product (server-rendered → client island). */
  product: {
    productId: string;
    name: string;
    price: number;
    image: string | null;
  };
  /** Server-side stock snapshot; the CTA is disabled when sold out. */
  stock: number;
  className?: string;
}

export function AddToCartButton({ product, stock, className }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const soldOut = stock <= 0;

  return (
    <Button
      size="sm"
      className={className}
      disabled={soldOut}
      onClick={() =>
        addItem({
          productId: product.productId,
          name: product.name,
          price: product.price,
          image: product.image,
        })
      }
    >
      <ShoppingCartIcon data-icon="inline-start" />
      {soldOut ? 'Sin stock' : 'Agregar'}
    </Button>
  );
}
