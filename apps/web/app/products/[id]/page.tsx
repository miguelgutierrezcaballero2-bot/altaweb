/**
 * `/products/[id]` — product detail (RSC).
 * Streams a skeleton per request; `notFound()` for missing/unknown products.
 */

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, PackageCheckIcon, StarIcon } from 'lucide-react';
import { categoryManager } from '@/lib/managers/category-manager';
import { productManager } from '@/lib/managers/product-manager';
import { AddToCartButton } from '@/components/catalog/add-to-cart-button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/components/catalog/product-card';
import { ensureCatalogSeeded } from '@/lib/seed/catalog-seed';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Render workers may boot with empty singleton maps; guarantee the seed.
  ensureCatalogSeeded();
  const { id } = await params;
  const product = productManager.findById(id);

  if (!product || !product.isActive) {
    notFound();
  }

  const category = categoryManager.findById(product.categoryId);
  const discountPct =
    product.compareAtPrice && product.price < product.compareAtPrice
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      {category && (
        <Link
          href={`/products?category=${category.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Volver a {category.name}
        </Link>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
          {product.images[0] && (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>

        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Link href={`/products?category=${category.slug}`}>
                  <Badge variant="secondary">{category.name}</Badge>
                </Link>
              )}
              <Badge variant="outline" className="gap-1">
                <StarIcon className="size-3 fill-current" />
                {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 1 }).format(product.rating)}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {product.name}
            </h1>

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
                {discountPct && <Badge variant="destructive">-{discountPct}%</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                Precio por unidad · IVA incluido
              </p>
            </div>

            <Separator />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">SKU</dt>
                <dd className="font-medium">{product.sku}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Disponibilidad</dt>
                <dd className="font-medium">
                  {product.stock === 0
                    ? 'Agotado'
                    : product.stock <= 3
                      ? `Últimas ${product.stock} unidades`
                      : `${product.stock} unidades disponibles`}
                </dd>
              </div>
            </dl>

            <Separator />

            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Descripción</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>

            <div className="pt-2">
              <AddToCartButton
                product={{
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images[0] ?? null,
                }}
                stock={product.stock}
                className="w-full"
              />
            </div>

            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <PackageCheckIcon className="size-4 text-secondary" />
              Flete e instalación cotizados por zona · garantía oficial
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
