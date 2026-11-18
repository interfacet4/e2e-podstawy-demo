import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// P3. Administrator dodaje produkt (docs/projekt.md).
// Założenia scenariusza wskazują konto admin, dlatego podajemy je w zaloguj().
// Sprzątanie: aplikacja nie ma usuwania produktów (ani w panelu, ani w API).
// Dlatego każda nazwa jest unikalna (data i godzina), a kolejne przebiegi sobie nie przeszkadzają.
test('administrator dodaje produkt, a klient znajduje go na liście jako dostępny w cenie 12,50 zł', async ({ page }) => {
  const nazwa = `Produkt testowy P3 ${Date.now()}`;

  await zaloguj(page, 'admin', 'admin123');

  // Droga jak u testera ręcznego: menu „Panel admina” › kafelek „Produkty”.
  await page.getByRole('link', { name: 'Panel admina' }).click();
  // „Produkty” jest też w menu głównym, więc szukamy linku w treści strony.
  await page.getByRole('main').getByRole('link', { name: 'Produkty' }).click();

  await page.getByLabel('Nazwa').fill(nazwa);
  await page.getByLabel('Kategoria').fill('Testowe');
  await page.getByLabel('Cena (zł)').fill('12,50');
  await page.getByLabel('Stan').fill('5');
  await page.getByRole('button', { name: 'Dodaj produkt' }).click();

  // Komunikat po zapisie (pasek „flash” nad formularzem).
  await expect(page.getByTestId('flash')).toHaveText(`Dodano produkt: ${nazwa}`);

  // Strona „Produkty” i wyszukiwarka.
  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Produkty' }).click();
  await page.getByLabel('Szukaj produktu').fill(nazwa);
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Pod tabelą są kafelki z tą samą nazwą, więc sprawdzamy wewnątrz wiersza tabeli.
  const wiersz = page.getByRole('row').filter({ hasText: nazwa });
  await expect(wiersz.getByRole('cell', { name: '12,50 zł', exact: true })).toBeVisible();
  await expect(wiersz.getByRole('cell', { name: 'Dostępny', exact: true })).toBeVisible();
  await expect(wiersz.getByRole('button', { name: `Dodaj do koszyka: ${nazwa}` })).toBeEnabled();
});
