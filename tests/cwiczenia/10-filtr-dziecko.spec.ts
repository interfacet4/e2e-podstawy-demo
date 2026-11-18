import { test, expect } from '@playwright/test';

// Ćwiczenie 10: test napisany skillem /test-e2e.
// Wymaganie: filtr kategorii „Dziecko” na stronie produktów pokazuje dokładnie 3 produkty.
// Test tylko czyta dane, więc nie przygotowuje ich i nie sprząta.

test('filtr kategorii „Dziecko” pokazuje dokładnie 3 produkty', async ({ page }) => {
  // Strona „Produkty” jest publiczna, logowanie nie jest potrzebne.
  await page.goto('/');

  // Wybieramy kategorię „Dziecko” i zatwierdzamy filtr.
  await page.getByLabel('Kategoria').selectOption('Dziecko');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Licznik nad tabelą pokazuje dokładnie 3.
  await expect(page.getByText('Liczba produktów:')).toHaveText('Liczba produktów: 3');

  // Tabela ma dokładnie 3 produkty: liczymy tylko wiersze z komórkami, bez wiersza nagłówka.
  await expect(page.getByRole('row').filter({ has: page.getByRole('cell') })).toHaveCount(3);

  // W tabeli nie ma produktu z inną kategorią niż „Dziecko”.
  // Liczymy wiersze z komórkami, w których nie ma komórki „Dziecko”: bez filtra byłoby ich 18.
  await expect(
    page
      .getByRole('row')
      .filter({ has: page.getByRole('cell') })
      .filter({ hasNot: page.getByRole('cell', { name: 'Dziecko', exact: true }) }),
  ).toHaveCount(0);
});
