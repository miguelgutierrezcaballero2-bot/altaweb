/**
 * Related products row (Fase 8) — same-category equipment, capped at 4.
 * Data selection happens on the PDP page (real manager reads, exclude
 * self, active only); this is the presentational row.
 */

import { ProductCard } from '@/components/catalog/product-card';
import type { Product } from '@/lib/types/product';

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-label="Equipos relacionados" className="mt-12">
      <h2 className="text-2xl font-bold tracking-tight">
        También te puede interesar
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Más equipos del mismo rubro.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
