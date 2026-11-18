import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): scenariusz P6 (docs/projekt.md), część z poprawnym zamówieniem.
// Konto: domyślne z zalogujPrzezApi() (tester12). Zamówienia klient nie może anulować,
// a fair play pozwala tworzyć własne zamówienia.

test('zamówienie 2 sztuk balsamu przez API daje 201 i można je potem pobrać po numerze', async ({ request }) => {
  await zalogujPrzezApi(request);

  const odpowiedz = await request.post('/api/orders', { data: { product_id: 10, qty: 2 } });
  expect(odpowiedz.status()).toBe(201);
  const zamowienie = await odpowiedz.json();
  expect(zamowienie.number).toMatch(/^ZAM-\d+$/);
  expect(zamowienie.qty).toBe(2);
  expect(zamowienie.status).toBe('new');
  expect(zamowienie.product).toBe('Balsam do ciała');

  const pobranie = await request.get(`/api/orders/${zamowienie.number}`);
  expect(pobranie.status()).toBe(200);
  expect(await pobranie.json()).toEqual(zamowienie);
});
