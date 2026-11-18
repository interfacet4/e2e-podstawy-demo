import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P8. Zamówienie z API anulowane w panelu (docs/projekt.md).
// Założenia: zamówienie zakłada klient user (przez API), anuluje administrator (w przeglądarce).
// Test działa lokalnie (konta user i admin). Anulowanie samo przywraca towar na stan,
// więc test sprząta po sobie.

let numerZamowienia = '';

// Dane: własne zamówienie klienta user (1 balsam).
test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request, 'user', 'user123');
  const odpowiedz = await request.post('/api/orders', { data: { product_id: 10, qty: 1 } });
  expect(odpowiedz.status()).toBe(201);
  numerZamowienia = (await odpowiedz.json()).number;
});

// Gdyby test padł przed kliknięciem „Anuluj”, administrator anuluje zamówienie przez API.
test.afterEach(async ({ request }) => {
  await zalogujPrzezApi(request, 'admin', 'admin123');
  const stan = await (await request.get(`/api/orders/${numerZamowienia}`)).json();
  if (stan.status !== 'cancelled') {
    expect((await request.post(`/api/admin/orders/${numerZamowienia}/cancel`)).status()).toBe(200);
  }
});

test('administrator anuluje zamówienie klienta w panelu, a inne zamówienia zachowują status', async ({ page, request }) => {
  // Statusy pozostałych zamówień przed anulowaniem (do porównania na końcu).
  await zalogujPrzezApi(request, 'admin', 'admin123');
  const statusyInnych = async () =>
    ((await (await request.get('/api/admin/orders')).json()) as { number: string; status: string }[])
      .filter((z) => z.number !== numerZamowienia)
      .map((z) => `${z.number}: ${z.status}`);
  const przed = await statusyInnych();

  await zaloguj(page, 'admin', 'admin123');
  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Panel admina' }).click();
  await page.getByRole('main').getByRole('link', { name: 'Zamówienia', exact: true }).click();

  // Wyszukujemy zamówienie po numerze i anulujemy je w jego wierszu.
  await page.getByLabel('Szukaj zamówienia').fill(numerZamowienia);
  await page.getByRole('button', { name: 'Szukaj' }).click();
  const wiersz = page.getByRole('row').filter({ hasText: numerZamowienia });
  await wiersz.getByRole('button', { name: 'Anuluj' }).click();

  // Po anulowaniu wracamy na listę zamówień. W wierszu: status „Anulowane” i brak przycisku „Anuluj”.
  await expect(page.getByTestId('flash')).toHaveText(`Anulowano zamówienie ${numerZamowienia}`);
  await expect(wiersz.getByRole('cell', { name: 'Anulowane', exact: true })).toBeVisible();
  await expect(wiersz.getByRole('button', { name: 'Anuluj' })).toHaveCount(0);

  // API: status „cancelled”.
  const odpowiedz = await request.get(`/api/orders/${numerZamowienia}`);
  expect((await odpowiedz.json()).status).toBe('cancelled');

  // Inne zamówienia nie zmieniły statusu.
  expect(await statusyInnych()).toEqual(przed);
});
