/**
 * Storefront header — server component (RSC-first).
 * Reads categories from the in-memory manager; falls back to the three
 * storefront verticals until categories are seeded (Phase 3).
 */

import Link from 'next/link';
import { ChefHatIcon, SearchIcon } from 'lucide-react';
import { categoryManager } from '@/lib/managers/category-manager';

interface NavCategory {
  label: string;
  href: string;
}

const FALLBACK_CATEGORIES: NavCategory[] = [
  { label: 'Pollerías', href: '/products?category=pollerias' },
  { label: 'Cafeterías', href: '/products?category=cafeterias' },
  { label: 'Pizzerías', href: '/products?category=pizzerias' },
];

function loadCategories(): NavCategory[] {
  const stored = categoryManager.findAll().sort((a, b) => a.sortOrder - b.sortOrder);
  // In-memory store starts empty; seed fallback keeps the nav useful pre-seeding.
  if (stored.length === 0) return FALLBACK_CATEGORIES;
  return stored.map((c) => ({ label: c.name, href: `/products?category=${c.slug}` }));
}

export function Header() {
  const categories = loadCategories();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChefHatIcon className="size-5" />
          </span>
          <span>AltaCocina</span>
        </Link>

        {/* Server-rendered search: native GET form, no client JS. */}
        <form
          action="/products"
          method="get"
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <div className="relative w-full">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="search"
              placeholder="Buscar equipos, freidoras, hornos…"
              aria-label="Buscar productos"
              className="h-9 w-full rounded-lg border border-input bg-card pl-9 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </form>

        <nav aria-label="Categorías" className="hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
          >
            Inicio
          </Link>
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              {category.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
