/**
 * `/products` — catalog listing (RSC).
 *
 * Canonical query contract (matches the header shell exactly):
 *   ?category=<slug>  one of pollerias | cafeterias | pizzerias
 *   ?search=<text>    case-insensitive product-name match
 */

import Link from 'next/link';
import {
  categoryManager,
} from '@/lib/managers/category-manager';
import { productManager } from '@/lib/managers/product-manager';
import { ensureCatalogSeeded } from '@/lib/seed/catalog-seed';
import { ProductCard } from '@/components/catalog/product-card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo',
  description:
    'Equipamiento gastronómico B2B: freidoras, hornos, molinos y refrigeración para tu negocio.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

function normalizeParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return undefined;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Render workers may boot with empty singleton maps; guarantee the seed.
  ensureCatalogSeeded();
  const params = await searchParams;
  const search = normalizeParam(params.search);
  const categorySlug = normalizeParam(params.category);

  const categories = categoryManager
    .findAll()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const activeCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : undefined;

  let products = activeCategory
    ? productManager.findByCategory(activeCategory.id)
    : productManager.findAll();

  // Keep the catalog itself clean of non-active rows.
  products = products.filter((product) => product.isActive);

  // Name search, case-insensitive (header form posts `search` verbatim).
  if (search) {
    const query = search.toLowerCase();
    products = products.filter((product) => product.name.toLowerCase().includes(query));
  }

  const unknownCategory = Boolean(categorySlug && !activeCategory);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          {activeCategory ? activeCategory.name : 'Catálogo'}
        </h1>
        <p className="text-muted-foreground">
          {activeCategory
            ? activeCategory.description
            : 'Equipamiento gastronómico B2B con garantía oficial y flete al país.'}
        </p>
      </header>

      {/* Rubro filter chips — same slugs as the header nav contract. */}
      <nav aria-label="Filtrar por rubro" className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={
            activeCategory
              ? 'rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted'
              : 'rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground'
          }
        >
          Todos
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            className={
              activeCategory?.slug === category.slug
                ? 'rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground'
                : 'rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted'
            }
          >
            {category.name}
          </Link>
        ))}
      </nav>

      <p className="mt-6 text-sm text-muted-foreground">
        {products.length === 1 ? '1 equipo' : `${products.length} equipos`}
        {activeCategory ? ` en ${activeCategory.name}` : ''}
        {search ? ` para “${search}”` : ''}
      </p>

      {unknownCategory && (
        <section className="mt-10 rounded-xl border border-border bg-muted/40 p-10 text-center">
          <p className="text-lg font-semibold">No encontramos esa categoría</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Volvé al catálogo completo para seguir explorando.
          </p>
          <Link
            href="/products"
            className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Ver todos los equipos
          </Link>
        </section>
      )}

      {!unknownCategory && products.length === 0 && (
        <section className="mt-10 rounded-xl border border-border bg-muted/40 p-10 text-center">
          <p className="text-lg font-semibold">No encontramos equipos para esa búsqueda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Probá con otro término o explorá el catálogo completo.
          </p>
          <Link
            href="/products"
            className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Limpiar filtros
          </Link>
        </section>
      )}

      {!unknownCategory && products.length > 0 && (
        <section
          aria-label="Equipos disponibles"
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </main>
  );
}
