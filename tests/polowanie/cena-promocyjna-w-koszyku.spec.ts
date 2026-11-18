import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): koszyk liczy cenę promocyjną tak samo jak karta produktu.
// Wymaganie P9 (docs/projekt.md): krem 32,99 zł, w promocji -20%, czyli 26,39 zł, także w koszyku.
// Na rc koszyk pokazuje 21,11 zł bez żadnego kodu rabatowego.
// Konto: domyślne z zaloguj() (tester12).

// Test zaczyna i kończy z pustym koszykiem (DELETE /api/cart usuwa też kod rabatowy).
test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  await request.delete('/api/cart');
});

test.afterEach(async ({ request }) => {
  const odpowiedz = await request.delete('/api/cart');
  expect(odpowiedz.status()).toBe(200);
});

test('krem z promocją -20% kosztuje w koszyku 26,39 zł, bez kodu rabatowego', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Dodaj do koszyka: Krem do twarzy na dzień' }).click();
  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Koszyk' }).click();

  const wiersz = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  // Kolumna „Cena”: stara cena, nowa cena, plakietka.
  await expect(wiersz.getByTestId('cart-item-price')).toHaveText('32,99 zł 26,39 zł -20%');
  // Do zapłaty za 1 sztukę: 26,39 zł.
  await expect(page.getByTestId('cart-total')).toHaveText('26,39 zł');
});
