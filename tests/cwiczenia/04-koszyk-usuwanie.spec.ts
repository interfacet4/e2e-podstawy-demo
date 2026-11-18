import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz B: dodanie produktu do koszyka i usunięcie go.
// Karta: docs/cwiczenia/04-locatory-codegen.md
// Kod nagrany Codegenem i poprawiony.

test('usunięty produkt znika z koszyka', async ({ page }) => {
  // TODO 1: zaloguj się jako user / user123.
  // Adres względny: początek adresu (localhost:4100) bierze się z baseURL w playwright.config.ts.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // TODO 2: dodaj do koszyka „Żel pod prysznic”.
  // Szukamy wiersza tabeli, bo pod tabelą są kafelki z tą samą nazwą.
  await page.getByRole('link', { name: 'Produkty' }).click();
  await page
    .getByRole('row')
    .filter({ hasText: 'Żel pod prysznic' })
    .getByRole('button', { name: 'Dodaj do koszyka' })
    .click();
  await expect(page.getByText('Produkt w koszyku: Żel pod prysznic')).toBeVisible();

  // TODO 3: otwórz koszyk i sprawdź, że „Żel pod prysznic” w nim jest.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  await expect(page).toHaveURL(/\/koszyk/);
  const wierszZelu = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
  await expect(wierszZelu).toBeVisible();

  // TODO 4: kliknij „Usuń” w wierszu „Żel pod prysznic”.
  await wierszZelu.getByRole('button', { name: 'Usuń' }).click();

  // TODO 5: sprawdź, że wiersza „Żel pod prysznic” już nie ma.
  // Po usunięciu adres to /koszyk?usunieto=1, dlatego regex bez $ na końcu.
  await expect(page).toHaveURL(/\/koszyk\?usunieto=1/);
  await expect(wierszZelu).toHaveCount(0);
});
