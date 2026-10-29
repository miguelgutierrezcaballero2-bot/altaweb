/* streaming skeleton for /orders while the list resolves */

export default function OrdersLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-5 w-72 animate-pulse rounded-md bg-muted" />
      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex gap-6 border-b border-border bg-muted/40 px-4 py-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-4 flex-1 animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-b border-border px-4 py-4 last:border-b-0"
          >
            <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
            <div className="h-4 flex-1 animate-pulse rounded-md bg-muted" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </main>
  );
}
