import { test, expect } from '@playwright/test';

// P2. Koszyk wymaga logowania (docs/projekt.md).
// Założenia scenariusza wskazują konto user / user123. Test działa lokalnie.
// Wyjątek od zasady „loguj przez zaloguj()”: funkcja zaczyna od otwarcia /logowanie,
// a to zgubiłoby parametr next=%2Fkoszyk, który ten scenariusz sprawdza.
// Dlatego formularz wypełniamy na stronie, na którą przekierowała aplikacja.

test('niezalogowany klient trafia z koszyka na logowanie, a po zalogowaniu wraca do koszyka', async ({ page }) => {
  await page.goto('/koszyk');

  // Przed logowaniem: strona „Logowanie”, w adresie next=%2Fkoszyk.
  await expect(page.getByRole('heading', { name: 'Logowanie', level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/next=%2Fkoszyk/);

  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  // Po zalogowaniu: strona „Koszyk”, a nie strona główna.
  await expect(page).toHaveURL(/\/koszyk$/);
  await expect(page.getByRole('heading', { name: 'Koszyk', level: 1 })).toBeVisible();
});
