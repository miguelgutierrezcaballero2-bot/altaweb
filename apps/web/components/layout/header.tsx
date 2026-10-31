/**
 * Storefront header — server component, three-row rebuild (Fase 7).
 *
 * Row 1 (utility): B2B tagline + Mis pedidos + user menu + cart.
 * Row 2 (search):  brand + prominent full-width search (?search= contract).
 * Row 3 (categories): category bar; desktop hover mega-panels from the real
 * category contract, mobile drawer via a Sheet trigger (phase 7 model).
 * Seed is guaranteed before manager reads (render-worker graphs).
 */

import Image from "next/image";
import Link from "next/link";
import {
  ReceiptTextIcon,
  SearchIcon,
  TruckIcon,
} from "lucide-react";
import { categoryManager } from "@/lib/managers/category-manager";
import { productManager } from "@/lib/managers/product-manager";
import { ensureCatalogSeeded } from "@/lib/seed/catalog-seed";
import { CartButton } from "@/components/layout/cart-drawer";
import { UserMenu } from "@/components/layout/user-menu";
import {
  CategoryMegamenu,
  type MegaCategory,
} from "@/components/layout/category-megamenu";
import { getSessionClaims } from "@/lib/auth/session";

/**
 * Mega-menu data from the REAL contract: category fields as-is, and the
 * supporting list is the category's actual products (top-rated first, cap
 * 6). The contract has no subcategories in the data, so none are faked.
 */
function loadMegaCategories(): MegaCategory[] {
  // Render workers may boot with empty singleton maps; guarantee the seed.
  ensureCatalogSeeded();
  const categories = categoryManager
    .findAll()
    .toSorted((a, b) => a.sortOrder - b.sortOrder);
  return categories.map((category) => ({
    name: category.name,
    slug: category.slug,
    description: category.description,
    products: productManager
      .findByCategory(category.id)
      .filter((product) => product.isActive)
      .toSorted((a, b) => b.rating - a.rating)
      .slice(0, 6)
      .map((product) => ({ id: product.id, name: product.name })),
  }));
}

export async function Header() {
  const megaCategories = loadMegaCategories();
  // Cookie claims for display; gated routes verify against the users contract.
  const session = await getSessionClaims();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      {/* Row 1 — utility: the only band carrying the dark brand color */}
      <div className="bg-[#06060A] text-white/85">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-3 px-4">
          <p className="hidden min-w-0 items-center gap-1.5 text-xs font-medium sm:flex">
            <TruckIcon className="size-3.5 shrink-0" />
            Ventas mayoristas B2B · flete e instalación en todo el país
          </p>
          <nav
            aria-label="Cuenta y pedidos"
            className="flex items-center gap-2 sm:gap-3"
          >
            <Link
              href="/orders"
              className="flex items-center gap-1.5 text-xs font-semibold hover:underline underline-offset-4"
            >
              <ReceiptTextIcon className="size-3.5" />
              Mis pedidos
            </Link>
            <UserMenu
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
              session={
                session && {
                  fullName: session.fullName,
                  email: session.email,
                  role: session.role,
                }
              }
            />
            <CartButton className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white" />
          </nav>
        </div>
      </div>

      {/* Row 2 — brand + prominent search */}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:gap-8">
        <Link
          href="/"
          aria-label="AltaCocina — inicio"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/alta-logo.png"
            alt="AltaCocina"
            width={56}
            height={56}
            priority
            className="size-14 object-contain"
          />
        </Link>

        {/* Server-rendered search: native GET form, no client JS. */}
        <form
          action="/products"
          method="get"
          className="flex h-11 min-w-0 flex-1 items-center overflow-hidden rounded-lg border border-input bg-card transition-shadow focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20"
        >
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="search"
              placeholder="¿Qué está buscando? Equipos, freidoras, hornos…"
              aria-label="Buscar productos"
              className="h-10 w-full bg-transparent pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            aria-label="Buscar"
            className="flex h-full shrink-0 items-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
          >
            <SearchIcon className="size-4" />
            <span className="hidden sm:inline">Buscar</span>
          </button>
        </form>
      </div>

      {/* Row 3 — category bar: mega-menu desktop / accordion drawer mobile */}
      <nav aria-label="Categorías" className="border-t border-border bg-[#FFEE32]">
        <CategoryMegamenu categories={megaCategories} />
      </nav>
    </header>
  );
}
