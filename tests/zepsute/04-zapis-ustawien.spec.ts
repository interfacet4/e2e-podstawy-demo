import { test, expect } from '@playwright/test';

// Wymaganie: administrator zapisuje ustawienia sklepu bez zmian. Widzi komunikat
// „Zapisano ustawienia”, a tryb konserwacji zostaje wyłączony.

test('zapis ustawień pokazuje komunikat', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();

  await page.goto('/admin/ustawienia');
  await page.getByRole('button', { name: 'Zapisz' }).click();
  await expect(page.getByTestId('maintenance-state')).toHaveText('Stan: wyłączony');

  // Dajemy aplikacji chwilę na zapis ustawień - niepotrzebne 
  //await page.waitForTimeout(6000);

  await expect(page.getByText('Zapisano ustawienia')).toBeVisible();
});
