import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Ten plik domyślnie idzie na wspólny serwer szkoleniowy (działa tylko 16–18.11.2026).
// Inny adres podasz zmienną, np. lokalnie: $env:BASE_URL="http://localhost:4100"
const adresAplikacji = process.env.BASE_URL || 'https://namssor-376292984721.europe-central2.run.app';
test.use({ baseURL: adresAplikacji });

// Na starcie wypisuje w terminalu, na jaki adres idą testy z tego pliku:
// serwer szkoleniowy albo adres z $env:BASE_URL.
test.beforeAll(async () => {
  console.log(`P16: testy idą na adres ${adresAplikacji}`);
});

// P16. Ilość z karty produktu (docs/projekt.md).
// Klient: konto domyślne z zaloguj() (dziś tester12, albo konto pary z APP_USER).

// Zmiana wymagań Bożeny z 13:00: zamiast 3 żeli 24 kalendarze adwentowe (po jednym na okienko).

// Koszyk zaczyna i kończy pusty (DELETE czyści cały koszyk), więc suma koszyka to tylko kalendarze.
test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  await request.delete('/api/cart');
});

test.afterEach(async ({ request }) => {
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test('24 kalendarze adwentowe z karty produktu dają w koszyku ilość 24, wartość 959,76 zł i taką samą sumę', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/');
  await page.getByRole('article', { name: 'Kalendarz adwentowy 2026' }).getByRole('link', { name: 'Kalendarz adwentowy 2026' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kalendarz adwentowy 2026');

  await page.getByLabel('Ilość').fill('24');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Koszyk' }).click();

  // Wiersz kalendarza: ilość 24 i wartość 959,76 zł.
  const wiersz = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
  await expect(wiersz.getByTestId('cart-item-qty')).toHaveText('24');
  await expect(wiersz.getByRole('cell', { name: '959,76 zł', exact: true })).toBeVisible();

  // Suma „razem” równa sumie kolumny „Wartość”: w koszyku są tylko kalendarze, więc 959,76 zł.
  await expect(page.getByTestId('cart-total')).toHaveText('959,76 zł');
});
