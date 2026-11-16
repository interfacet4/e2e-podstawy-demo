import { test, expect } from '@playwright/test';

// Ćwiczenie 03b: przeczytaj ten plik i opisz słowami, co sprawdza.

// Produkty w promocji Czarnego Piątku: stara cena, nowa cena po rabacie.
const produktyWPromocji = [
  { nazwa: 'Odżywka do włosów', staraCena: '14,99 zł', nowaCena: '11,99 zł' },
  { nazwa: 'Krem do twarzy na dzień', staraCena: '32,99 zł', nowaCena: '26,39 zł' },
  { nazwa: 'Serum z witaminą C', staraCena: '49,99 zł', nowaCena: '39,99 zł' },
];

test.describe('Ceny promocyjne na kafelkach', () => {
  // Dla każdego produktu z listy powstaje osobny test.
  for (const produkt of produktyWPromocji) {
    test(`${produkt.nazwa} ma cenę obniżoną o 20%`, async ({ page }) => {
      await page.goto('/');

      // Kafelek ma nazwę produktu jako nazwę dostępną (aria-labelledby).
      const kafelek = page.getByRole('article', { name: produkt.nazwa });

      await expect(kafelek.getByTestId('tile-old-price')).toHaveText(produkt.staraCena);
      await expect(kafelek.getByTestId('tile-price')).toHaveText(produkt.nowaCena);
      // Tego obiecuje nazwa testu: plakietka pokazuje rabat 20%, a nie tylko jest widoczna.
      await expect(kafelek.getByTestId('tile-badge')).toHaveText('-20%');
    });
  }
});
