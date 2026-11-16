import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz A: filtr kategorii na stronie „Produkty”.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('filtr „Dziecko” pokazuje tylko produkty dla dzieci', async ({ page }) => {
  // TODO 1: otwórz stronę „Produkty” (adres /).
  await page.goto('/');

  // TODO 2: w polu „Kategoria” wybierz „Dziecko” i kliknij „Filtruj”.
  await page.getByLabel('Kategoria').selectOption('Dziecko');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // TODO 3: sprawdź, że „Liczba produktów” to 3.
  await expect(page.getByTestId('product-count')).toHaveText('3');

  // TODO 4: sprawdź, że widać „Chusteczki nawilżane dla dzieci”, „Szampon dla dzieci” i „Krem ochronny dla dzieci”.
  // Szukamy wierszy tabeli, bo pod tabelą są kafelki z tymi samymi nazwami.
  await expect(page.getByRole('row').filter({ hasText: 'Chusteczki nawilżane dla dzieci' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Szampon dla dzieci' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Krem ochronny dla dzieci' })).toBeVisible();

  // TODO 5: sprawdź, że NIE widać „Szampon nawilżający” (kategoria Włosy).
  // Codegen tego nie nagra: liczymy wiersze z tą nazwą i oczekujemy zera.
  await expect(page.getByRole('row').filter({ hasText: 'Szampon nawilżający' })).toHaveCount(0);
});
