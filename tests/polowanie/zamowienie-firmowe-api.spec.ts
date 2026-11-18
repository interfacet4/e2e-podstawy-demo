import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): scenariusz P14 (docs/projekt.md) na koncie pary.
// Konto: domyślne z zalogujPrzezApi() (tester12), a nie wspólne konto biuro z P14.
// Adres: zmienna BASE_URL (raz rc, raz wersja zwykła).
// Sprzątanie: brak. Klient nie może anulować zamówienia, a fair play pozwala tworzyć własne zamówienia.

const zamowienieFirmowe = { product_id: 21, qty: 10, nip: '101-202-30-36', company: 'Biuro Mikołaja' };

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
});

test.describe('zamówienie firmowe przez API', () => {
  test('zamówienie 10 kalendarzy na Biuro Mikołaja daje 201 i fakturę FV/2026/<numer> z NIP nabywcy 1012023036', async ({ request }) => {
    const odpowiedz = await request.post('/api/business-orders', { data: zamowienieFirmowe });

    expect(odpowiedz.status()).toBe(201);
    const zamowienie = await odpowiedz.json();
    expect(zamowienie.status).toBe('new');
    expect(zamowienie.qty).toBe(10);
    expect(zamowienie.total_cents).toBe(39990);
    expect(zamowienie.invoice.company).toBe('Biuro Mikołaja');

    // Faktura do tego zamówienia: numer i NIP nabywcy (bez kresek, jak w P10).
    const faktura = await request.get(`/api/orders/${zamowienie.number}/invoice`);
    expect(faktura.status()).toBe(200);
    const dane = await faktura.json();
    expect(dane.invoice_number).toBe(`FV/2026/${zamowienie.number}`);
    expect(dane.buyer.nip).toBe('1012023036');
  });

  test('ilość 1001 daje 400 i błąd w polu qty', async ({ request }) => {
    const odpowiedz = await request.post('/api/business-orders', { data: { ...zamowienieFirmowe, qty: 1001 } });

    expect(odpowiedz.status()).toBe(400);
    const tresc = await odpowiedz.json();
    expect(tresc.errors.map((blad: { field: string }) => blad.field)).toContain('qty');
  });
});
