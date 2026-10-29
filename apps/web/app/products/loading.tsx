/* streaming skeleton for /products while the manager data resolves */

export default function ProductsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-5 w-80 animate-pulse rounded-md bg-muted" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-8 w-28 animate-pulse rounded-md bg-muted"
          />
        ))}
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <div className="aspect-[4/3] animate-pulse bg-muted" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
              <div className="h-5 w-1/2 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
