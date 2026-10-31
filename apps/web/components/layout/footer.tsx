/**
 * Storefront footer — server component.
 * Minimal brand + tagline + placeholder columns for Phase 2.
 */

import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <Link
            href="/"
            aria-label="AltaCocina — inicio"
            className="flex items-center"
          >
            <Image
              src="/alta-logo.png"
              alt="AltaCocina"
              width={48}
              height={48}
              className="size-12 object-contain"
            />
          </Link>
          <p className="text-sm text-muted-foreground">
            Equipamiento gastronómico B2B para pollerías, cafeterías y
            pizzerías.
          </p>
        </div>

        <nav aria-label="Categorías del sitio" className="space-y-2">
          <p className="text-sm font-semibold">Categorías</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/products?category=pollerias" className="hover:text-foreground">
                Pollerías
              </Link>
            </li>
            <li>
              <Link href="/products?category=cafeterias" className="hover:text-foreground">
                Cafeterías
              </Link>
            </li>
            <li>
              <Link href="/products?category=pizzerias" className="hover:text-foreground">
                Pizzerías
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Atención comercial</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>ventas@altacocina.com</li>
            <li>Lun a Vie 9–18 h</li>
            <li>Cotizaciones B2B por rubro</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AltaCocina · Proveedor mayorista de equipos
      </div>
    </footer>
  );
}
