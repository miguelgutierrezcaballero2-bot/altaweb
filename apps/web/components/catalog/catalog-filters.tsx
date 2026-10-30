/**
 * Faceted-catalog controls (Fase 8) — presentational pieces driven by the
 * PLP page: facet sidebar over the real contract facets, active-filter
 * chips, and the native GET sort form. Every control is real navigation
 * through URL params (Links / GET form); no client state is involved.
 */

import Link from 'next/link';
import { ListFilterIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FacetOption {
  label: string;
  /** Aggregated over the set filtered by every OTHER facet (real data). */
  count: number;
  href: string;
  active: boolean;
}

export interface FacetGroup {
  title: string;
  /** Optional honesty hint (e.g. band boundaries are approximations). */
  hint?: string;
  options: FacetOption[];
}

/** One facet group: title + Link option list with live counts. */
function FacetList({ group }: { group: FacetGroup }) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wide">
        {group.title}
        {group.hint && (
          <span
            className="ml-1.5 text-xs font-normal text-muted-foreground"
          >
            ({group.hint})
          </span>
        )}
      </h3>
      <ul className="mt-2 space-y-1">
        {group.options.map((option) => (
          <li key={option.label}>
            <Link
              href={option.href}
              aria-current={option.active ? 'true' : undefined}
              className={
                option.active
                  ? 'flex items-center justify-between gap-2 rounded-md bg-secondary/15 px-2 py-1 text-sm font-medium'
                  : 'flex items-center justify-between gap-2 rounded-md px-2 py-1 text-sm text-foreground/80 hover:bg-muted'
              }
            >
              <span className="min-w-0 truncate">{option.label}</span>
              <span className="text-xs text-muted-foreground">
                ({option.count})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Facet sidebar. Single server-rendered markup: a sidebar on wide screens,
 * stacked above the grid on small ones — no duplicated content.
 */
export function FacetSidebar({ groups }: { groups: FacetGroup[] }) {
  return (
    <aside
      aria-label="Filtros del catálogo"
      className="h-fit shrink-0 space-y-5 rounded-xl border border-border bg-card p-4 lg:w-60"
    >
      <p className="flex items-center gap-1.5 text-sm font-semibold">
        <ListFilterIcon className="size-4 text-primary" />
        Filtros
      </p>
      {groups.map((group) => (
        <FacetList key={group.title} group={group} />
      ))}
    </aside>
  );
}

/** Active filter chips: each removes exactly one param, preserving the rest. */
export function FilterChips({
  chips,
  clearHref,
}: {
  chips: { label: string; href: string }[];
  clearHref: string;
}) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          aria-label={`Quitar filtro ${chip.label}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-secondary/60 bg-secondary/10 px-2.5 py-1 text-xs font-medium hover:bg-muted"
        >
          {chip.label}
          <XIcon className="size-3.5 text-muted-foreground" />
        </Link>
      ))}
      <Link
        href={clearHref}
        className="text-xs font-semibold text-primary hover:underline underline-offset-4"
      >
        Limpiar filtros
      </Link>
    </div>
  );
}

export interface SortOption {
  value: string;
  label: string;
}

/**
 * Sort control — native GET form (sort param + hidden carry-over of the
 * remaining filters), so ordering stays a server-rendered, URL-stable
 * navigation instead of client state.
 */
export function SortForm({
  current,
  options,
  hidden,
}: {
  current: string;
  options: SortOption[];
  hidden: Record<string, string | undefined>;
}) {
  return (
    <form
      action="/products"
      method="get"
      className="flex items-center gap-2"
      aria-label="Ordenar resultados"
    >
      {Object.entries(hidden).map(([key, value]) =>
        value ? <input key={key} type="hidden" name={key} value={value} /> : null,
      )}
      <label htmlFor="sort" className="text-sm text-muted-foreground">
        Ordenar por
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={current}
        className="h-9 rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button type="submit" size="sm" variant="outline">
        Ordenar
      </Button>
    </form>
  );
}
