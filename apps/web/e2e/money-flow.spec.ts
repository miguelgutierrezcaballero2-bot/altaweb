import { test, expect } from '@playwright/test';

/**
 * Money flow E2E — the storefront's core user journey against the
 * PRODUCTION build: login → seeded product (SKU POL-FRE-001, price above
 * the BIENVENIDA10 minimum) → cart → checkout with promo → order
 * confirmation → logout through the user menu.
 *
 * Determinism notes:
 * - Products have server-generated ids; the flow selects the seeded card by
 *   its stable SKU text instead of an id.
 * - The checkout page mirrors demo promos into the API graph at render, so
 *   the promo validation succeeds once /checkout is open.
 */

test('vendor buys with promo BIENVENIDA10 and confirms the order', async ({
  page,
}) => {
  // 1. Log in as the vendor persona (seeded at /login render time).
  await page.goto('/login');
  await page.getByLabel('Correo').fill('vendedor@negocio.demo');
  await page.getByLabel('Contraseña').fill('demo-password');
  await page
    .locator('form')
    .getByRole('button', { name: 'Iniciar sesión' })
    .click();
  await expect(page).toHaveURL(/\/orders$/);
  const userButton = page.getByRole('button', { name: 'Martín Díaz' });
  await expect(userButton).toBeVisible();

  // 2. Add the seeded freidora to the cart; addItem auto-opens the drawer
  // (store UX), which modally covers the page.
  await page.goto('/products');
  const card = page
    .locator('[data-slot="card"]')
    .filter({ hasText: 'SKU POL-FRE-001' })
    .first();
  await card.getByRole('button', { name: 'Agregar', exact: true }).click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText(/Freidora/)).toBeVisible();
  await expect(drawer.getByText(/1\.845\.000/).first()).toBeVisible();

  // 3. Cart drawer → checkout.
  await drawer.getByRole('button', { name: 'Continuar compra' }).click();
  await expect(page).toHaveURL(/\/checkout$/);

  // 4. Fill the required business + shipping fields.
  await page.locator('#businessName').fill('Pollería Don Julián SRL');
  await page.locator('#contactName').fill('Julián Fernández');
  await page.locator('#email').fill('compras@negocios.com.ar');
  await page.locator('#street').fill('Av. Rivadavia 5432');
  await page.locator('#city').fill('Buenos Aires');
  await page.locator('#state').fill('CABA');
  await page.locator('#zip').fill('1424');

  // 5. Apply the seeded promo code.
  await page.getByLabel('Código de descuento').fill('BIENVENIDA10');
  await page.getByRole('button', { name: 'Validar' }).click();
  await expect(page.getByText('BIENVENIDA10 aplicado')).toBeVisible();

  // 6. Submit and land on the order confirmation.
  await page.getByRole('button', { name: 'Confirmar pedido' }).click();
  await expect(page).toHaveURL(/\/orders\//);
  await expect(page.getByRole('heading', { name: 'Pedido confirmado' })).toBeVisible();
  // Scoped to the confirmation's main content: the header mega-menu now
  // renders category descriptions + product links that contain the word.
  await expect(page.getByRole('main').getByText(/Freidora/)).toBeVisible();

  // 7. Logout through the header user menu.
  await userButton.click();
  await page.getByRole('menuitem', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('button', { name: 'Iniciar sesión' }).first(),
  ).toBeVisible();
});
