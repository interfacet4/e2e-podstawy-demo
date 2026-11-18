import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): licznik koszyka po usunięciu ostatniego produktu.
// Na rc zaraz po usunięciu jedynego produktu strona pokazuje „Pozycji: 1”, choć koszyk jest pusty.
// Konto: domyślne z zaloguj() / zalogujPrzezApi() (tester12). Adres: zmienna BASE_URL (raz rc, raz wersja zwykła).

// Dane: w koszyku jest tylko „Mydło w kostce” (id 11).
test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  await request.delete('/api/cart');
  expect((await request.post('/api/cart/items', { data: { product_id: 11, qty: 1 } })).status()).toBe(201);
});

test.afterEach(async ({ request }) => {
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test('po usunięciu ostatniego produktu koszyk pokazuje „Pozycji: 0” i razem 0,00 zł', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/koszyk');

  await page.getByRole('button', { name: 'Usuń: Mydło w kostce' }).click();

  // Liczba pozycji i suma nie mają roli ani etykiety, więc szukamy ich po data-testid.
  await expect(page.getByTestId('cart-count')).toHaveText('0');
  await expect(page.getByTestId('cart-total')).toHaveText('0,00 zł');
  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Mydło w kostce' })).toHaveCount(0);
});
