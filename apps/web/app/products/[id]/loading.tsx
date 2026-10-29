/* streaming skeleton for /products/[id] while manager data resolves */

export default function ProductDetailLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-xl bg-muted" />
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="flex gap-2">
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-8 w-3/4 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-1/2 animate-pulse rounded-lg bg-muted" />
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-52 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-px bg-border" />
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
            <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </main>
  );
}
