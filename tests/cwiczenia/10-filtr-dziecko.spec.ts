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

  // Wszystkie 3 produkty mają w kolumnie „Kategoria” wartość „Dziecko”.
  await expect(
    page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Dziecko', exact: true }) }),
  ).toHaveCount(3);
});
