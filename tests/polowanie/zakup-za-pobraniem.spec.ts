import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): scenariusz P1 (docs/projekt.md) na koncie pary.
// Zakup z płatnością przy odbiorze: zamówienie „Nowe” i stan balsamu mniejszy o 1.
// Konto: domyślne z zaloguj() (tester12). Zamówienia klient nie może anulować,
// a fair play pozwala tworzyć własne zamówienia, więc sprzątamy tylko koszyk.

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  await request.delete('/api/cart');
});

test.afterEach(async ({ request }) => {
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test('zakup balsamu za pobraniem tworzy zamówienie „Nowe” i zmniejsza stan balsamu o 1', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/');

  const balsam = page.getByRole('row').filter({ hasText: 'Balsam do ciała' });
  const stanPrzed = Number(await balsam.getByTestId('product-stock').textContent());

  await balsam.getByRole('button', { name: 'Dodaj do koszyka: Balsam do ciała' }).click();
  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Koszyk' }).click();
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  await expect(page).toHaveURL(/\/zamowienia\?zlozono=ZAM-\d+$/);
  const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';
  // Komunikat znika po kilku sekundach, więc sprawdzamy go od razu.
  await expect(page.getByTestId('flash')).toHaveText(`Złożono zamówienie: ${numer}`);

  const wiersz = page.getByRole('row').filter({ hasText: numer });
  await expect(wiersz.getByRole('cell', { name: 'Balsam do ciała', exact: true })).toBeVisible();
  await expect(wiersz.getByTestId('order-status')).toHaveText('Nowe');

  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Produkty' }).click();
  await expect(balsam.getByTestId('product-stock')).toHaveText(String(stanPrzed - 1));
});
