import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): scenariusz P10 (docs/projekt.md) na koncie pary.
// Konto: domyślne z zaloguj() (tester12), dane firmy jak w scenariuszu (Biuro Mikołaja).
// Oba testy używają tego samego koszyka, więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

test.describe('faktura na firmę', () => {
  // Dane: w koszyku jest tylko „Kalendarz adwentowy 2026” (id 21).
  test.beforeEach(async ({ request, page }) => {
    await zalogujPrzezApi(request);
    await request.delete('/api/cart');
    expect((await request.post('/api/cart/items', { data: { product_id: 21, qty: 1 } })).status()).toBe(201);

    await zaloguj(page);
    await page.goto('/koszyk');
    await page.getByLabel('Faktura na firmę').check();
  });

  test.afterEach(async ({ request }) => {
    expect((await request.delete('/api/cart')).status()).toBe(200);
  });

  test('zamówienie z fakturą daje fakturę FV/2026/<numer> dla Biura Mikołaja na 39,99 zł', async ({ page }) => {
    await page.getByLabel('NIP').fill('101-202-30-36');
    await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
    await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

    await expect(page).toHaveURL(/\/zamowienia\?zlozono=ZAM-\d+$/);
    const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';

    await page.getByRole('link', { name: numer, exact: true }).click();
    await expect(page.getByText('Faktura na firmę:')).toHaveText('Faktura na firmę: Biuro Mikołaja, NIP 1012023036');

    const pobieranie = page.waitForEvent('download');
    const link = page.getByRole('link', { name: 'Faktura (HTML)' });
    await link.click();
    expect((await pobieranie).suggestedFilename()).toBe(`faktura-${numer}.html`);

    const faktura = await (await page.request.get((await link.getAttribute('href')) ?? '')).text();
    expect(faktura).toContain(`Faktura FV/2026/${numer}`);
    expect(faktura).toContain('NIP nabywcy: 1012023036');
    expect(faktura).toContain('Razem do zapłaty: 39,99 zł');
  });

  test('NIP z błędną sumą kontrolną zatrzymuje zamówienie w koszyku', async ({ page }) => {
    await page.getByLabel('NIP').fill('101-202-30-37');
    await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
    await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

    await expect(page.getByText('Nieprawidłowy NIP: błędna suma kontrolna', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Koszyk', level: 1 })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' })).toBeVisible();
  });
});
