import { test, expect } from '@playwright/test';

/**
 * Quote surface + PDP polish E2E (Fase 9) — runs against the PRODUCTION build.
 *
 * Honesty assertions: submitting the quote form composes client-side ONLY.
 * We collect every POST to /api/** via page.on('request') and assert zero —
 * the demo submit must never fake a backend call.
 *
 * Clipboard: file-level permissions grant (no config change needed).
 * Sticky bar tests live in a narrow-viewport describe (mobile-first polish);
 * the desktop assert that it stays hidden runs in the default viewport.
 * Text scopes to main/regions per the SSR mega-menu lesson.
 */

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test.describe('quote surface', () => {
  test('renders the real rubro options from the category contract', async ({
    page,
  }) => {
    await page.goto('/quote');
    const rubro = page.getByRole('combobox', { name: 'Rubro (opcional)' });
    const options = await rubro.locator('option').allTextContents();
    expect(options).toContain('Elegí un rubro…');
    expect(options).toContain('Pollerías');
    expect(options).toContain('Cafeterías');
    expect(options).toContain('Pizzerías');
    expect(options).toContain('Varios rubros');
  });

  test('?product= prefills the items textarea (PDP quote deep-link)', async ({
    page,
  }) => {
    await page.goto(
      `/quote?product=${encodeURIComponent('Horno pizzero 2 pisos')}`,
    );
    await expect(page.locator('#quoteItems')).toHaveValue(
      'Horno pizzero 2 pisos',
    );
  });

  test('submit composes the request client-side with zero API calls', async ({
    page,
  }) => {
    const apiPosts: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().includes('/api/')) {
        apiPosts.push(request.url());
      }
    });

    await page.goto('/quote');
    await page.locator('#quoteEmpresa').fill('Pollería Don Julián SRL');
    await page.locator('#quoteName').fill('Julián Fernández');
    await page.locator('#quoteEmail').fill('compras@donjulian.com.ar');
    await page
      .locator('#quoteItems')
      .fill('Horno pizzero 2 pisos\nAmasadora 30 L');
    await page.getByRole('button', { name: 'Generar solicitud' }).click();

    await expect(
      page.getByRole('main').getByRole('heading', { name: 'Solicitud generada' }),
    ).toBeVisible();
    // Composed text renders with the entered data + the contact footer.
    const summary = page.getByRole('main').locator('pre');
    await expect(summary).toContainText('Empresa: Pollería Don Julián SRL');
    await expect(summary).toContainText('Rubro: Sin especificar');
    await expect(summary).toContainText('- Horno pizzero 2 pisos');
    await expect(summary).toContainText('ventas@altacocina.com');
    // Honesty notice: the demo says exactly what it did and didn't.
    await expect(
      page.getByRole('main').getByText('Demostración sin backend'),
    ).toBeVisible();
    expect(apiPosts).toEqual([]);
  });

  test('copy button flips to Copiado and fills the clipboard', async ({
    page,
  }) => {
    await page.goto('/quote');
    await page.locator('#quoteEmpresa').fill('Confitería Rosedal SA');
    await page.locator('#quoteName').fill('Rosa Pérez');
    await page.locator('#quoteEmail').fill('rosa@rosedal.com.ar');
    await page
      .getByRole('combobox', { name: 'Rubro (opcional)' })
      .selectOption('cafeterias');
    await page.getByRole('button', { name: 'Generar solicitud' }).click();

    await expect(
      page.getByRole('heading', { name: 'Solicitud generada' }),
    ).toBeVisible();

    const copyButton = page.getByRole('button', { name: 'Copiar solicitud' });
    await copyButton.click();
    await expect(
      page.getByRole('button', { name: 'Copiado' }),
    ).toBeVisible();

    const clipboard = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboard).toContain('Solicitud de cotización — AltaCocina');
    expect(clipboard).toContain('Empresa: Confitería Rosedal SA');
    expect(clipboard).toContain('Rubro: Cafeterías');
  });

  test('home quote CTA navigates to /quote', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('main')
      .getByRole('button', { name: 'Solicitar cotización' })
      .click();
    await expect(page).toHaveURL(/\/quote$/);
    await expect(
      page.getByRole('heading', { name: 'Solicitar cotización' }),
    ).toBeVisible();
  });
});

test.describe('PDP sticky add-to-cart (mobile viewport)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('sticky bar shows price and shares the cart CTA on mobile', async ({
    page,
  }) => {
    await page.goto('/products?sort=price-desc');
    // Espresso 2 grupos (CAF-MQE-001, $4.650.000, stock 4) leads the sort.
    const card = page
      .getByRole('region', { name: 'Equipos disponibles' })
      .locator('[data-slot="card"]')
      .filter({ hasText: '4.650.000' })
      .first();
    await card.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/products\//);

    const sticky = page.getByRole('complementary', {
      name: 'Barra de compra rápida',
    });
    await expect(sticky).toBeVisible();
    await expect(sticky).toContainText('4.650.000');
    await expect(sticky).toContainText('por unidad');

    // Same shared cart CTA: adding opens the drawer (auto-open behavior).
    await sticky.getByRole('button', { name: 'Agregar' }).click();
    await expect(page.getByRole('dialog').first()).toBeVisible();
  });

  test('PDP quote CTA deep-links with the product prefilled', async ({
    page,
  }) => {
    await page.goto('/products?sort=price-desc');
    const card = page
      .getByRole('region', { name: 'Equipos disponibles' })
      .locator('[data-slot="card"]')
      .filter({ hasText: '4.650.000' })
      .first();
    await card.getByRole('link').first().click();
    await expect(page).toHaveURL(/\/products\//);

    const quoteCta = page
      .getByRole('main')
      .getByRole('button', { name: 'Pedir cotización por este equipo' });
    await quoteCta.click();
    await expect(page).toHaveURL(/\/quote\?product=/);
    await expect(page.locator('#quoteItems')).not.toHaveValue('');
  });
});

test('sticky bar stays hidden on desktop (inline panel CTA remains)', async ({
  page,
}) => {
  await page.goto('/products?sort=price-desc');
  const card = page
    .getByRole('region', { name: 'Equipos disponibles' })
    .locator('[data-slot="card"]')
    .filter({ hasText: '4.650.000' })
    .first();
  await card.getByRole('link').first().click();
  await expect(page).toHaveURL(/\/products\//);

  await expect(
    page.getByRole('complementary', { name: 'Barra de compra rápida' }),
  ).toBeHidden();
});
