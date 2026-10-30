import { test, expect } from '@playwright/test';

/**
 * Facets + PDP depth E2E (Fase 8) — runs against the PRODUCTION build.
 *
 * Determinism anchors: the seeded catalog is fixed (15 active products;
 * cafeterias has 5). Known extremes: cheapest $89.000 (Palas de horno),
 * priciest $4.650.000 (Máquina espresso). All text assertions are scoped
 * (region/main) because the header mega-menu renders page-wide SSR content.
 */

function grid(page: import('@playwright/test').Page) {
  return page.getByRole('region', { name: 'Equipos disponibles' });
}

function facetSidebar(page: import('@playwright/test').Page) {
  return page.getByRole('complementary', { name: 'Filtros del catálogo' });
}

test('category facet navigates to the real rubro with the count', async ({
  page,
}) => {
  await page.goto('/products');
  await facetSidebar(page)
    .getByRole('link', { name: /Cafeter\u00edas/ })
    .click();
  await expect(page).toHaveURL(/category=cafeterias($|&)/);
  await expect(
    page.getByRole('main').getByText(/equipos en Cafeter\u00edas/),
  ).toBeVisible();
});

test('price band facet applies min bounds and spawns a removal chip', async ({
  page,
}) => {
  await page.goto('/products');
  await facetSidebar(page)
    .getByRole('link', { name: /m\u00e1s de \u00241\.500\.000/ })
    .click();
  await expect(page).toHaveURL(/min=1500000/);
  await expect(
    page.getByRole('link', {
      name: 'Quitar filtro Precio: más de $1.500.000',
    }),
  ).toBeVisible();
  // Default order (relevancia) keeps the freidora first (seed insertion
  // order) for the >$1.5M band.
  await expect(
    grid(page).locator('[data-slot="card"]').first(),
  ).toContainText('1.845.000');
});

test('availability facet filters to in-stock and its chip removes it', async ({
  page,
}) => {
  await page.goto('/products?stock=in');
  await expect(
    page.getByRole('link', { name: 'Quitar filtro Con stock' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Quitar filtro Con stock' }).click();
  await expect(page).not.toHaveURL(/stock=in/);
});

test('chip removal preserves the other filter params', async ({ page }) => {
  await page.goto('/products?category=cafeterias&stock=in');
  await page.getByRole('link', { name: 'Quitar filtro Cafeter\u00edas' }).click();
  await expect(page).toHaveURL(/stock=in/);
  await expect(page).not.toHaveURL(/category=/);
});

test('sort is server-side deterministic over the seeded catalog', async ({
  page,
}) => {
  await page.goto('/products?sort=price-asc');
  await expect(page).toHaveURL(/sort=price-asc/);
  await expect(
    grid(page).locator('[data-slot="card"]').first(),
  ).toContainText('89.000');

  await page.goto('/products?sort=price-desc');
  await expect(
    grid(page).locator('[data-slot="card"]').first(),
  ).toContainText('4.650.000');
});

test('empty filters state renders the styled clear-filters CTA', async ({
  page,
}) => {
  await page.goto('/products?search=zzzz-inexistente');
  await expect(
    page
      .getByRole('main')
      .getByText('No encontramos equipos con esos filtros'),
  ).toBeVisible();
  await expect(
    page.getByRole('main').locator('section').getByRole('link', { name: 'Limpiar filtros' }),
  ).toBeVisible();
});

test('PDP shows breadcrumb and a related row from the same rubro', async ({
  page,
}) => {
  await page.goto('/products?category=cafeterias');
  // CAF-MQE-001 is the 5-product rubro's priciest card; its related row
  // holds exactly the other 4 active cafeterias products.
  const card = grid(page)
    .locator('[data-slot="card"]')
    .filter({ hasText: '4.650.000' })
    .first();
  await card.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/products\//);

  await expect(
    page.getByRole('navigation', { name: 'Rutas de navegaci\u00f3n' }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('navigation', { name: 'Rutas de navegaci\u00f3n' })
      .getByRole('link', { name: 'Cafeter\u00edas' }),
  ).toBeVisible();
  await expect(
    page.getByRole('main').getByText(/En stock|Agotado/).first(),
  ).toBeVisible();

  const related = page.getByRole('region', { name: 'Equipos relacionados' });
  await expect(related).toBeVisible();
  await expect(
    related.locator('[data-slot="card"]'),
  ).toHaveCount(4); // 5 active cafeterias products minus self
  // Related row must exclude the self product.
  await expect(related).not.toContainText('4.650.000');
});
