import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// P6. Zamówienie przez API i błędne dane (docs/projekt.md).
// Klient: konto domyślne z zalogujPrzezApi() (dziś tester12), logowanie przez POST /api/login.
// Test działa lokalnie: sprzątanie wymaga konta admin, a zamówienia zmniejszają stan magazynu.

let numerZamowienia = '';

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
});

// Sprzątanie: administrator anuluje zamówienie z testu, balsam wraca na stan.
test.afterEach(async ({ request }) => {
  if (!numerZamowienia) return;
  await zalogujPrzezApi(request, 'admin', 'admin123');
  const anulowanie = await request.post(`/api/admin/orders/${numerZamowienia}/cancel`);
  expect(anulowanie.status()).toBe(200);
  numerZamowienia = '';
});

test.describe('P6: zamówienie przez API', () => {
  test('zamówienie 2 sztuk balsamu daje 201 i można je potem pobrać po numerze', async ({ request }) => {
    const odpowiedz = await request.post('/api/orders', { data: { product_id: 10, qty: 2 } });

    expect(odpowiedz.status()).toBe(201);
    const zamowienie = await odpowiedz.json();
    numerZamowienia = zamowienie.number;
    expect(zamowienie.number).toMatch(/^ZAM-\d+$/);
    expect(zamowienie.qty).toBe(2);
    expect(zamowienie.status).toBe('new');
    expect(zamowienie.product).toBe('Balsam do ciała');

    // GET /api/orders/<numer> zwraca 200 i to samo zamówienie.
    const pobranie = await request.get(`/api/orders/${numerZamowienia}`);
    expect(pobranie.status()).toBe(200);
    expect(await pobranie.json()).toEqual(zamowienie);
  });

  test('ilość 0 daje 400 i błąd w polu qty', async ({ request }) => {
    const odpowiedz = await request.post('/api/orders', { data: { product_id: 10, qty: 0 } });

    expect(odpowiedz.status()).toBe(400);
    const tresc = await odpowiedz.json();
    expect(tresc.errors.map((blad: { field: string }) => blad.field)).toContain('qty');
  });

  test('niedostępny produkt 3 daje 409 i komunikat „Brak towaru na stanie”', async ({ request }) => {
    const odpowiedz = await request.post('/api/orders', { data: { product_id: 3, qty: 1 } });

    expect(odpowiedz.status()).toBe(409);
    expect(await odpowiedz.json()).toEqual({ error: 'Brak towaru na stanie' });
  });
});
