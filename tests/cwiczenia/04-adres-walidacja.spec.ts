import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz C: adres dostawy z błędnym kodem pocztowym.
// Karta: docs/cwiczenia/04-locatory-codegen.md
// Kod nagrany Codegenem i poprawiony.

test('błędny kod pocztowy blokuje zapis adresu', async ({ page }) => {
  // TODO 1: zaloguj się jako user / user123.
  // Adres względny: początek adresu (localhost:4100) bierze się z baseURL w playwright.config.ts.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // TODO 2: otwórz „Adres dostawy” z menu.
  await page.getByRole('link', { name: 'Adres dostawy' }).click();
  await expect(page.getByRole('heading', { name: 'Zmiana adresu dostawy' })).toBeVisible();

  // TODO 3: w polu „Kod pocztowy” wpisz 00000 (bez myślnika) i kliknij „Zapisz adres”.
  await page.getByLabel('Kod pocztowy').fill('00000');
  await page.getByRole('button', { name: 'Zapisz adres' }).click();

  // TODO 4: sprawdź komunikat „Popraw błędy w formularzu (1).”
  await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');

  // TODO 5: sprawdź komunikat przy polu: „Kod pocztowy musi mieć format 00-000”.
  await expect(page.getByText('Kod pocztowy musi mieć format 00-000')).toBeVisible();

  // TODO 6: sprawdź, że NIE pojawił się komunikat „Zapisano adres dostawy.”
  // Sprawdzamy dopiero po asercjach wyżej: wtedy wiemy, że strona po zapisie już się wczytała.
  await expect(page.getByText('Zapisano adres dostawy.')).toBeHidden();
});
