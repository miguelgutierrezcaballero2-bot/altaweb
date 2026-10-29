/* streaming skeleton for /login */

export default function LoginLoading() {
  return (
    <main className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <div className="mx-auto h-9 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="mx-auto mt-3 h-5 w-72 animate-pulse rounded-md bg-muted" />
      <div className="mt-8 space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="mt-4 h-24 w-full animate-pulse rounded-xl bg-muted" />
    </main>
  );
}
