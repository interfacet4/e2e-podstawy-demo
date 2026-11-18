import { test, expect } from '@playwright/test';

// Polowanie (ćwiczenie 13): produktu niedostępnego nie da się dodać do koszyka z karty produktu.
// Na liście produktów „Serum z witaminą C” jest niedostępne, a na rc karta tego produktu
// ma aktywny przycisk „Dodaj do koszyka”. Strona publiczna: bez logowania.

test('na karcie niedostępnego serum przycisk „Dodaj do koszyka” jest wyłączony', async ({ page }) => {
  await page.goto('/');

  // Warunek wstępny z listy produktów: serum jest niedostępne (przycisk w tabeli wyłączony).
  await expect(page.getByRole('button', { name: 'Dodaj do koszyka: Serum z witaminą C' })).toBeDisabled();

  // Karta produktu: wchodzimy linkiem z kafelka.
  await page.getByRole('article', { name: 'Serum z witaminą C' }).getByRole('link', { name: 'Serum z witaminą C' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Serum z witaminą C');

  await expect(page.getByTestId('product-card').getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
});
