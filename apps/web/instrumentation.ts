/**
 * Next.js instrumentation hook — runs once per server process start.
 * Seeds the demo catalog idempotently before serving requests, so the
 * in-memory managers hold data on every boot (build prerender and dev).
 */

export async function register() {
  const { seedCatalog } = await import('./lib/seed/catalog-seed');
  seedCatalog();
}
