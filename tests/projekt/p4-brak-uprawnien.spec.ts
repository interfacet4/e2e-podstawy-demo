import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// P4. Klient nie wejdzie do panelu administratora (docs/projekt.md).
// Założenia scenariusza wskazują konta user i admin. Test działa lokalnie
// (na serwerze szkoleniowym hasło konta admin zna tylko trener).

test.describe('P4: panel administratora', () => {
  test('klient pod adresem /admin widzi „Brak uprawnień” i nie ma w menu „Panel admina”', async ({ page }) => {
    await zaloguj(page, 'user', 'user123');
    await page.goto('/admin');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Brak uprawnień');
    await expect(page.getByText('Ta strona wymaga roli admin.', { exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Panel admina' })).toHaveCount(0);
  });

  test('administrator ma w menu pozycję „Panel admina”', async ({ page }) => {
    await zaloguj(page, 'admin', 'admin123');

    await expect(page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Panel admina' })).toBeVisible();
  });
});
