/* streaming skeleton for /orders/[id] while the order API resolves */

export default function OrderConfirmationLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="h-4 w-48 animate-pulse rounded-md bg-muted" />
      <div className="mt-2 h-9 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-muted" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <div className="h-5 w-52 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-px bg-border" />
            <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="space-y-3 rounded-xl border border-border bg-card p-6">
            <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="h-5 w-36 animate-pulse rounded-md bg-muted" />
          <div className="h-16 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </main>
  );
}
