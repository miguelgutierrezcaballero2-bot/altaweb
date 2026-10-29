import { test, expect } from '@playwright/test';

/**
 * Gating E2E — anonymous users bounce to /login?next= and the login flow
 * honors both the wrong-password visible error and the ?next redirect.
 * Runs against the PRODUCTION build (prod streams gated redirects as 200
 * with the flight instruction; asserting on URLs/UI, not HTTP status).
 */

test('anonymous /checkout redirects to login preserving the next target', async ({
  page,
}) => {
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/login\?next=%2Fcheckout$/);
  await expect(page.getByRole('heading', { name: /Iniciá sesión/ })).toBeVisible();
});

test('wrong password shows a visible error', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Correo').fill('compras@negocio.demo');
  await page.getByLabel('Contraseña').fill('WRON_PASS');
  await page
    .locator('form')
    .getByRole('button', { name: 'Iniciar sesión' })
    .click();
  await expect(page.getByText('Credenciales incorrectas')).toBeVisible();
  // Still on the login document (no navigation happened).
  await expect(page).toHaveURL(/\/login/);
});

test('correct login honors the ?next target and reports the session', async ({
  page,
}) => {
  await page.goto('/login?next=%2Fcheckout');
  await page.getByLabel('Correo').fill('vendedor@negocio.demo');
  await page.getByLabel('Contraseña').fill('demo-password');
  await page
    .locator('form')
    .getByRole('button', { name: 'Iniciar sesión' })
    .click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { name: 'Finalizar compra' })).toBeVisible();
  // Session identity lands in the header user menu.
  const userButton = page.getByRole('button', { name: 'Martín Díaz' });
  await expect(userButton).toBeVisible();
});
