/**
 * Category mega-menu (Fase 7) — populated from the REAL category contract.
 *
 * The seeded data has 3 root categories with descriptions and no
 * subcategories, so panels honestly show the description plus the
 * category's own products (top-rated) as supporting links — no fake
 * taxonomy. Desktop = CSS hover/focus-within panels; mobile = a Sheet
 * drawer with native <details> accordions.
 *
 * Server component: all data arrives rendered; the only client island is
 * the Sheet primitive.
 */

import Link from 'next/link';
import {
  ChevronDownIcon,
  ListFilterIcon,
  TagIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export interface MegaCategory {
  name: string;
  slug: string;
  description: string;
  products: { id: string; name: string }[];
}

const barLinkClass =
  'flex h-10 items-center gap-1 border-b-2 border-transparent px-2.5 text-sm font-medium text-white/80 transition-none hover:border-primary hover:text-white focus-visible:border-primary focus-visible:text-white focus-visible:outline-none focus-visible:ring-1';

/** Desktop hover panel content for one category (real contract data). */
function MegaPanel({ category }: { category: MegaCategory }) {
  return (
    <div className="invisible pointer-events-none absolute top-full left-0 z-50 w-[26rem] translate-y-0 opacity-0 transition-opacity duration-100 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
      <div className="mt-0 rounded-b-xl border border-t-0 border-border bg-card p-5 shadow-lg">
        <p className="text-sm leading-relaxed text-muted-foreground first-letter:uppercase">
          {category.description}
        </p>
        <h3 className="mt-4 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Equipos del rubro
        </h3>
        {category.products.length > 0 ? (
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {category.products.map((product) => (
              <li key={product.id} className="min-w-0">
                <Link
                  href={`/products/${product.id}`}
                  className="block truncate text-sm hover:text-primary"
                >
                  {product.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            El catálogo del rubro se está cargando.
          </p>
        )}
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          nativeButton={false}
          render={<Link href={`/products?category=${category.slug}`} />}
        >
          Ver todos los equipos de {category.name}
        </Button>
      </div>
    </div>
  );
}

/** Mobile accordion-supported drawer content (native details/summary). */
function CategoryAccordion({ categories }: { categories: MegaCategory[] }) {
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <details key={category.slug} className="rounded-lg border border-border">
          <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-semibold select-none [&::-webkit-details-marker]:hidden">
            {category.name}
          </summary>
          <div className="space-y-3 border-t border-border bg-muted/30 px-3 py-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {category.description}
            </p>
            <ul className="space-y-1.5">
              {category.products.map((product) => (
                <li key={product.id} className="min-w-0">
                  <Link
                    href={`/products/${product.id}`}
                    className="block truncate text-sm hover:text-primary"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/products?category=${category.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              <TagIcon className="size-3.5" />
              Ver todos los equipos de {category.name}
            </Link>
          </div>
        </details>
      ))}
    </div>
  );
}

export function CategoryMegamenu({ categories }: { categories: MegaCategory[] }) {
  return (
    <>
      {/* Mobile: drawer with accordions */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="text-white/90 hover:bg-white/10 hover:text-white lg:hidden"
              />
            }
          >
            <ListFilterIcon data-icon="inline-start" />
            Categorías
          </SheetTrigger>
          <SheetContent side="left" className="inset-y-0 left-0 h-full w-80 p-0">
            <SheetHeader className="border-b border-border">
              <SheetTitle>Categorías</SheetTitle>
              <SheetDescription>
                Equipamiento por rubro gastronómico
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <CategoryAccordion categories={categories} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: category bar + hover mega-panels */}
      <ul className="mx-auto hidden h-auto max-w-7xl items-stretch px-4 lg:flex">
        <li className="flex">
          <Link href="/products" className={barLinkClass}>
            Todos los equipos
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.slug} className="group flex">
            <Link
              href={`/products?category=${category.slug}`}
              className={barLinkClass}
              aria-haspopup="true"
            >
              {category.name}
              <ChevronDownIcon className="size-3.5 opacity-60 transition-transform group-hover:rotate-180" />
            </Link>
            <MegaPanel category={category} />
          </li>
        ))}
      </ul>
    </>
  );
}
