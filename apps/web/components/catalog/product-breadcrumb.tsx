/**
 * Product breadcrumb (Fase 8) — Inicio / Rubro / Equipo with real links.
 * Falls back to /products for products without a resolvable category.
 */

import Link from 'next/link';

export function ProductBreadcrumb({
  productName,
  category,
}: {
  productName: string;
  category: { name: string; slug: string } | null;
}) {
  return (
    <nav aria-label="Rutas de navegación">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
        <li>
          <Link href="/" className="hover:text-foreground hover:underline underline-offset-4">
            Inicio
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="max-w-[12rem] truncate">
          {category ? (
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-foreground hover:underline underline-offset-4"
            >
              {category.name}
            </Link>
          ) : (
            <Link
              href="/products"
              className="hover:text-foreground hover:underline underline-offset-4"
            >
              Catálogo
            </Link>
          )}
        </li>
        <li aria-hidden="true">/</li>
        <li
          aria-current="page"
          className="max-w-[36rem] truncate font-medium text-foreground"
          title={productName}
        >
          {productName}
        </li>
      </ol>
    </nav>
  );
}
