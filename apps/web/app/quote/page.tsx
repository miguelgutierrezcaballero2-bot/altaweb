/**
 * `/quote` — B2B quote-request surface (Fase 9).
 *
 * Honesty contract: there is NO quotes backend in this domain, so the form
 * never calls any API. Submission composes the quote request client-side;
 * the user copies it (clipboard) or opens their mail client pre-filled.
 * The demo notice says exactly that, and the real backend is a recorded
 * domain follow-up. Browsing stays open: no auth gate (unlike checkout),
 * with contact fields pre-filled only when a session already exists.
 */

import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';
import { categoryManager } from '@/lib/managers/category-manager';
import { ensureCatalogSeeded } from '@/lib/seed/catalog-seed';
import { getSessionClaims } from '@/lib/auth/session';
import { QuoteRequestForm } from '@/components/quote/quote-request-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Solicitar cotización',
  description:
    'Pedí una cotización B2B por rubro: te armamos el presupuesto con asesoramiento comercial, flete e instalación.',
};

interface QuotePageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

function normalizeParam(value: string | string[] | undefined): string | undefined {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return undefined;
}

export default async function QuotePage({ searchParams }: QuotePageProps) {
  // Render workers may boot with empty singleton maps; guarantee the seed.
  ensureCatalogSeeded();
  const session = await getSessionClaims();
  const params = await searchParams;
  const productHint = normalizeParam(params.product);
  const categoryHint = normalizeParam(params.category);

  // Real contract data for the rubro select; no fake taxonomy.
  const categories = categoryManager
    .findAll()
    .toSorted((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({ slug: category.slug, name: category.name }));

  // Session prefill only (no auth gate; browsing stays open).
  const prefill = {
    contactName: session ? session.fullName : '',
    contactEmail: session ? session.email : '',
    // ?product= prefills the items textarea (PDP "Pedir cotización" CTA),
    // ?category= preselects the rubro (facet navigation deep-links).
    category: categoryHint ?? '',
    items: productHint ?? '',
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">
          Solicitar cotización
        </h1>
        <p className="text-muted-foreground">
          Armamos presupuestos B2B por rubro: recomendación de equipos, flete
          e instalación en todo el país. No se necesita cuenta; las
          cotizaciones se resuelven por atención comercial.
        </p>
      </header>

      <QuoteRequestForm
        categories={categories}
        prefill={prefill}
        quoteEmail="ventas@altacocina.com"
      />

      <div className="mt-8 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <span>¿Dudas mientras escribís?</span>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline underline-offset-4"
        >
          Explorá el catálogo
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </main>
  );
}
