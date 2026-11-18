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

// Koszyk zaczyna i kończy pusty, więc suma koszyka to tylko żel.
test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  await request.delete('/api/cart');
});

test.afterEach(async ({ request }) => {
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test('3 sztuki żelu z karty produktu dają w koszyku ilość 3, wartość 29,97 zł i taką samą sumę', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/');
  await page.getByRole('article', { name: 'Żel pod prysznic' }).getByRole('link', { name: 'Żel pod prysznic' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Żel pod prysznic');

  await page.getByLabel('Ilość').fill('3');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Koszyk' }).click();

  // Wiersz żelu: ilość 3 i wartość 29,97 zł.
  const wiersz = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
  await expect(wiersz.getByTestId('cart-item-qty')).toHaveText('3');
  await expect(wiersz.getByRole('cell', { name: '29,97 zł', exact: true })).toBeVisible();

  // Suma „razem” równa sumie kolumny „Wartość”: w koszyku jest tylko żel, więc 29,97 zł.
  await expect(page.getByTestId('cart-total')).toHaveText('29,97 zł');
});
