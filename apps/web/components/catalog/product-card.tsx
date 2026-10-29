/**
 * Product card — server component for the catalog grid.
 * Price/rating formatting and stock signaling happen on the server; the only
 * client island inside is the add-to-cart CTA.
 */

import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { AddToCartButton } from '@/components/catalog/add-to-cart-button';
import type { Product } from '@/lib/types/product';

/** es-AR ARS price formatting shared by card and detail (server-only usage). */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({ product }: { product: Product }) {
  const discountPct =
    product.compareAtPrice && product.price < product.compareAtPrice
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      <div className="relative aspect-[4/3] bg-muted">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            loading="eager"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        )}
        {discountPct && (
          <span className="absolute top-2 left-2">
            <Badge variant="destructive">-{discountPct}%</Badge>
          </span>
        )}
        <span className="absolute top-2 right-2">
          <Badge variant="secondary" className="gap-1">
            <StarIcon className="fill-current text-current size-3" />
            {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1 }).format(product.rating)}
          </Badge>
        </span>
      </div>

      <CardContent className="flex-1 space-y-1.5 pt-4">
        <Link
          href={`/products/${product.id}`}
          className="text-sm font-semibold leading-snug hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">SKU {product.sku}</p>
        {product.stock === 0 && (
          <Badge variant="destructive">Agotado</Badge>
        )}
        {product.stock > 0 && product.stock <= 3 && (
          <Badge variant="outline">Últimas {product.stock} unidades</Badge>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <AddToCartButton
          className="w-full"
          product={{
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] ?? null,
          }}
          stock={product.stock}
        />
      </CardFooter>
    </Card>
  );
}
