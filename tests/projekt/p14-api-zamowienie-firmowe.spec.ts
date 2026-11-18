import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// P14. Zamówienie firmowe przez API (docs/projekt.md).
// Założenia wskazują konto biuro / biuro123 (Biuro Mikołaja). Test działa lokalnie:
// sprzątanie wymaga konta admin, którego hasła na serwerze nie znamy.

const zamowienieFirmowe = { product_id: 21, qty: 10, nip: '101-202-30-36', company: 'Biuro Mikołaja' };
let numerZamowienia = '';

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request, 'biuro', 'biuro123');
});

// Sprzątanie: administrator anuluje zamówienie z testu, kalendarze wracają na stan.
test.afterEach(async ({ request }) => {
  if (!numerZamowienia) return;
  await zalogujPrzezApi(request, 'admin', 'admin123');
  expect((await request.post(`/api/admin/orders/${numerZamowienia}/cancel`)).status()).toBe(200);
  numerZamowienia = '';
});

test.describe('P14: zamówienie firmowe przez API', () => {
  test('zamówienie 10 kalendarzy na Biuro Mikołaja daje 201 i fakturę FV/2026/<numer>', async ({ request }) => {
    const odpowiedz = await request.post('/api/business-orders', { data: zamowienieFirmowe });

    expect(odpowiedz.status()).toBe(201);
    const zamowienie = await odpowiedz.json();
    numerZamowienia = zamowienie.number;
    expect(zamowienie.status).toBe('new');
    expect(zamowienie.qty).toBe(10);
    expect(zamowienie.total_cents).toBe(39990);
    expect(zamowienie.invoice.company).toBe('Biuro Mikołaja');

    // Faktura do tego zamówienia.
    const faktura = await request.get(`/api/orders/${numerZamowienia}/invoice`);
    expect(faktura.status()).toBe(200);
    expect((await faktura.json()).invoice_number).toBe(`FV/2026/${numerZamowienia}`);
  });

  test('ilość 1001 daje 400 i błąd w polu qty', async ({ request }) => {
    const odpowiedz = await request.post('/api/business-orders', { data: { ...zamowienieFirmowe, qty: 1001 } });

    expect(odpowiedz.status()).toBe(400);
    const tresc = await odpowiedz.json();
    expect(tresc.errors.map((blad: { field: string }) => blad.field)).toContain('qty');
  });
});
