import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P10. Zamówienie na firmę i faktura (docs/projekt.md).
// Założenia wskazują konto biuro / biuro123 (Biuro Mikołaja). Test działa lokalnie.
// Oba testy używają koszyka konta biuro, więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

let numerZamowienia = '';

test.describe('P10: faktura na firmę', () => {
  // Dane: w koszyku biura jest tylko „Kalendarz adwentowy 2026” (id 21).
  test.beforeEach(async ({ request, page }) => {
    await zalogujPrzezApi(request, 'biuro', 'biuro123');
    await request.delete('/api/cart');
    expect((await request.post('/api/cart/items', { data: { product_id: 21, qty: 1 } })).status()).toBe(201);

    await zaloguj(page, 'biuro', 'biuro123');
    await page.goto('/koszyk');
    await page.getByLabel('Faktura na firmę').check();
  });

  // Sprzątanie: pusty koszyk biura, a zamówienie z testu anuluje administrator.
  test.afterEach(async ({ request }) => {
    expect((await request.delete('/api/cart')).status()).toBe(200);
    if (!numerZamowienia) return;
    await zalogujPrzezApi(request, 'admin', 'admin123');
    expect((await request.post(`/api/admin/orders/${numerZamowienia}/cancel`)).status()).toBe(200);
    numerZamowienia = '';
  });

  test('zamówienie z fakturą dla Biura Mikołaja daje fakturę FV/2026/<numer> na 39,99 zł', async ({ page }) => {
    await page.getByLabel('NIP').fill('101-202-30-36');
    await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
    await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

    // Strona „Moje zamówienia”, w adresie numer nowego zamówienia.
    await expect(page).toHaveURL(/\/zamowienia\?zlozono=ZAM-\d+$/);
    numerZamowienia = new URL(page.url()).searchParams.get('zlozono') ?? '';
    await expect(page.getByRole('heading', { name: 'Moje zamówienia', level: 1 })).toBeVisible();

    // Strona tego zamówienia: dane firmy i NIP bez kresek.
    await page.getByRole('link', { name: numerZamowienia, exact: true }).click();
    await expect(page.getByText('Faktura na firmę:')).toHaveText('Faktura na firmę: Biuro Mikołaja, NIP 1012023036');

    // „Pobierz fakturę” pobiera plik faktura-<numer>.html.
    const pobieranie = page.waitForEvent('download');
    const link = page.getByRole('link', { name: 'Pobierz fakturę' });
    await link.click();
    expect((await pobieranie).suggestedFilename()).toBe(`faktura-${numerZamowienia}.html`);

    // Treść tego samego pliku pobieramy z adresu linku (sesja przeglądarki, bez czytania z dysku).
    const faktura = await (await page.request.get((await link.getAttribute('href')) ?? '')).text();
    expect(faktura).toContain(`Faktura FV/2026/${numerZamowienia}`);
    expect(faktura).toContain('Biuro Mikołaja');
    expect(faktura).toContain('NIP nabywcy: 1012023036');
    expect(faktura).toContain('Razem do zapłaty: 39,99 zł');
  });

  test('NIP z błędną sumą kontrolną zatrzymuje zamówienie w koszyku', async ({ page }) => {
    await page.getByLabel('NIP').fill('101-202-30-37');
    await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
    await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

    await expect(page.getByText('Nieprawidłowy NIP: błędna suma kontrolna', { exact: true })).toBeVisible();
    // Klient zostaje w koszyku, a kalendarz nadal w nim jest. Te asercje przejdą także bez kliknięcia:
    // zostają, bo sprawdzają zdanie wymagania. O akcji świadczy komunikat o NIP wyżej.
    await expect(page.getByRole('heading', { name: 'Koszyk', level: 1 })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' })).toBeVisible();
  });
});
