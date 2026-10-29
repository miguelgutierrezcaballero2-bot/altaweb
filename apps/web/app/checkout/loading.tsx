/* streaming skeleton for /checkout while the shell resolves */

export default function CheckoutLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-5 w-96 animate-pulse rounded-md bg-muted" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {['Datos del negocio', 'Dirección de envío', 'Pago'].map((block) => (
            <div
              key={block}
              className="space-y-4 rounded-xl border border-border bg-card p-6"
            >
              <div className="h-5 w-40 animate-pulse rounded-md bg-muted" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-9 animate-pulse rounded-md bg-muted" />
                <div className="h-9 animate-pulse rounded-md bg-muted" />
              </div>
              <div className="h-9 animate-pulse rounded-md bg-muted" />
            </div>
          ))}
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <div className="h-5 w-44 animate-pulse rounded-md bg-muted" />
          <div className="space-y-2">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-px bg-border" />
          <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </main>
  );
}
