import { test, expect } from '@playwright/test';

// Polowanie (ćwiczenie 13), niespodzianka Klaudiusza: „Tryb Klaudiusza”.
// Ślad: skrypt w źródle każdej strony liczy kliknięcia w logo „namssor”.
// Po 5 kliknięciach w ciągu 10 s pokazuje komunikat Klaudiusza i flagę.
// To niespodzianka, a nie błąd: działa tak samo na wersji zwykłej i na rc. Bez logowania.

test('5 kliknięć w logo włącza „Tryb Klaudiusza” z komunikatem i flagą FLAGA-WUR7S', async ({ page }) => {
  await page.goto('/');
  const logo = page.getByRole('link', { name: 'namssor' });

  // Każde kliknięcie przeładowuje stronę główną. Licznik kliknięć trzyma przeglądarka (sessionStorage).
  for (let klikniecie = 1; klikniecie <= 5; klikniecie++) {
    await logo.click();
    await expect(page.getByRole('heading', { name: 'Produkty', level: 1 })).toBeVisible();
  }

  await expect(page.getByText('Tryb Klaudiusza:')).toHaveText(
    'Tryb Klaudiusza: wszystkie testy są zielone. Jestem pewien, że to działa.',
  );
  // Wartość flagi odczytana z aplikacji (taka sama na obu adresach).
  await expect(page.getByTestId('egg-flag')).toHaveText('Flaga: FLAGA-WUR7S');
});
