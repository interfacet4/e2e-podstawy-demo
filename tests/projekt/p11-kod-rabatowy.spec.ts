import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P11. Kod rabatowy w koszyku (docs/projekt.md).
// Klient: konto domyślne z zaloguj() (dziś tester12, albo konto pary z APP_USER).

// Trzy testy dzielą koszyk jednego konta, więc biegną po kolei, nie równolegle.
test.describe.configure({ mode: 'serial' });

test.describe('P11: kod rabatowy w koszyku', () => {
  // Dane: w koszyku jest tylko „Mydło w kostce” (id 11), bez kodu rabatowego.
  test.beforeEach(async ({ request, page }) => {
    await zalogujPrzezApi(request);
    await request.delete('/api/cart');
    const dodanie = await request.post('/api/cart/items', { data: { product_id: 11, qty: 1 } });
    expect(dodanie.status()).toBe(201);

    await zaloguj(page);
    await page.goto('/koszyk');
    await expect(page.getByRole('row').filter({ hasText: 'Mydło w kostce' })).toBeVisible();
  });

  // „Test na koniec usuwa kod i mydło z koszyka”: DELETE /api/cart czyści pozycje i kod.
  test.afterEach(async ({ request }) => {
    const odpowiedz = await request.delete('/api/cart');
    expect(odpowiedz.status()).toBe(200);
  });

  test('kod CZARNY20 zostaje przyjęty, a pod sumą jest linia z kwotą przed rabatem i rabatem', async ({ page }) => {
    await page.getByLabel('Kod rabatowy').fill('CZARNY20');
    await page.getByRole('button', { name: 'Zastosuj kod' }).click();

    await expect(page.getByRole('status')).toHaveText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.');
    // Mydło kosztuje 4,99 zł (dane startowe), 20% z 4,99 zł to 1,00 zł po zaokrągleniu do grosza.
    await expect(page.getByText('Przed rabatem:')).toHaveText('Przed rabatem: 4,99 zł, rabat (CZARNY20): -1,00 zł');
  });

  test('nieznany kod NIEMA daje komunikat o braku kodu i nie obniża ceny', async ({ page }) => {
    await page.getByLabel('Kod rabatowy').fill('NIEMA');
    await page.getByRole('button', { name: 'Zastosuj kod' }).click();

    await expect(page.getByRole('alert')).toHaveText('Nie ma takiego kodu rabatowego: NIEMA');
    // „Bez rabatu”: nie ma linii z rabatem, a koszyk kosztuje tyle co mydło (4,99 zł).
    await expect(page.getByText('Przed rabatem:')).toHaveCount(0);
    await expect(page.getByTestId('cart-total')).toHaveText('4,99 zł');
  });

  test('kod WLOSY15 bez produktów z kategorii Włosy daje komunikat, że kod działa tylko na tę kategorię', async ({ page }) => {
    await page.getByLabel('Kod rabatowy').fill('WLOSY15');
    await page.getByRole('button', { name: 'Zastosuj kod' }).click();

    await expect(page.getByRole('alert')).toHaveText(
      'Kod WLOSY15 działa tylko na produkty z kategorii Włosy. W koszyku nie ma takich produktów.',
    );
  });
});
