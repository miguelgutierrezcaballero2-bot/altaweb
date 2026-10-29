import { test, expect } from '@playwright/test';

/**
 * Not-found E2E — unknown product renders the styled storefront 404.
 *
 * Next 16 streams dynamic responses in this app (dev AND next start): the
 * notFound() outcome arrives inside the streamed document, so the top-level
 * HTTP status stays 200. The assertions therefore check the rendered UI and
 * record the streamed-status reality instead of pretending a 404 status.
 */

test('unknown product renders the styled not-found', async ({ page }) => {
  const response = await page.goto('/products/prod_bogus');
  expect(response?.status()).toBe(200); // streamed 404 UI: real behavior, see doc
  await expect(page.getByRole('heading', { name: 'Esta página no existe' })).toBeVisible();
  await expect(page.getByText('404')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Volver al inicio' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ver catálogo' })).toBeVisible();
});
