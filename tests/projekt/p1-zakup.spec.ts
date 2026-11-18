import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P1. Zakup z płatnością przy odbiorze (docs/projekt.md).
// Założenia scenariusza wskazują konto user, dlatego podajemy je w zaloguj().
// Test działa lokalnie: konto user istnieje tylko w lokalnej bazie.

let numerZamowienia = '';

// Koszyk konta user zaczyna pusty, żeby zamówienie miało tylko balsam.
test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request, 'user', 'user123');
  await request.delete('/api/cart');
});

// Sprzątanie: administrator anuluje zamówienie z testu, towar wraca na stan.
test.afterEach(async ({ request }) => {
  if (!numerZamowienia) return;
  await zalogujPrzezApi(request, 'admin', 'admin123');
  const anulowanie = await request.post(`/api/admin/orders/${numerZamowienia}/cancel`);
  expect(anulowanie.status()).toBe(200);
  numerZamowienia = '';
});

test('zakup balsamu za pobraniem tworzy zamówienie „Nowe” i zmniejsza stan balsamu o 1', async ({ page }) => {
  await zaloguj(page, 'user', 'user123');
  await page.goto('/');

  // Stan balsamu przed zakupem (liczba z kolumny „Stan”).
  const balsam = page.getByRole('row').filter({ hasText: 'Balsam do ciała' });
  const stanPrzed = Number(await balsam.getByTestId('product-stock').textContent());

  await balsam.getByRole('button', { name: 'Dodaj do koszyka: Balsam do ciała' }).click();
  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Koszyk' }).click();
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  // Strona „Moje zamówienia” z nowym numerem w adresie, np. /zamowienia?zlozono=ZAM-1010.
  await expect(page).toHaveURL(/\/zamowienia\?zlozono=ZAM-\d+$/);
  numerZamowienia = new URL(page.url()).searchParams.get('zlozono') ?? '';
  await expect(page.getByRole('heading', { name: 'Moje zamówienia', level: 1 })).toBeVisible();
  // Komunikat znika po kilku sekundach, więc sprawdzamy go od razu.
  await expect(page.getByTestId('flash')).toHaveText(`Złożono zamówienie: ${numerZamowienia}`);

  // Na liście: wiersz z tym numerem, balsam i status „Nowe”.
  const wiersz = page.getByRole('row').filter({ hasText: numerZamowienia });
  await expect(wiersz.getByRole('cell', { name: 'Balsam do ciała', exact: true })).toBeVisible();
  await expect(wiersz.getByTestId('order-status')).toHaveText('Nowe');

  // Na stronie „Produkty” stan balsamu jest mniejszy o 1.
  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Produkty' }).click();
  await expect(balsam.getByTestId('product-stock')).toHaveText(String(stanPrzed - 1));
});
