import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P15. Status zamówienia w panelu admina (docs/projekt.md).
// Klient: konto domyślne z zalogujPrzezApi() (dziś tester12); administrator: admin (z założeń).
// Test działa lokalnie (konto admin).
// Sprzątanie: zamówienia „Wysłane” nie da się już anulować, więc zostaje w bazie.
// Każdy przebieg zakłada nowe zamówienie (1 mydło), więc kolejne przebiegi sobie nie przeszkadzają.

let numerZamowienia = '';

// Dane: zamówienie klienta złożone przez API (1 „Mydło w kostce”, id 11).
test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  const odpowiedz = await request.post('/api/orders', { data: { product_id: 11, qty: 1 } });
  expect(odpowiedz.status()).toBe(201);
  numerZamowienia = (await odpowiedz.json()).number;
});

test('administrator zmienia status na „Opłacone”, potem „Wysłane”, a klient widzi w API „shipped”', async ({ page, request }) => {
  await zaloguj(page, 'admin', 'admin123');
  await page.goto(`/admin/zamowienia/${numerZamowienia}`);

  // Nowe → Opłacone.
  await page.getByLabel('Status zamówienia').selectOption('Opłacone');
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  await expect(page.getByTestId('order-status')).toHaveText('Opłacone');

  // Opłacone → Wysłane.
  await page.getByLabel('Status zamówienia').selectOption('Wysłane');
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  await expect(page.getByTestId('order-status')).toHaveText('Wysłane');

  // Klient (sesja `request` z beforeEach) widzi status „shipped”.
  const odpowiedz = await request.get(`/api/orders/${numerZamowienia}`);
  expect(odpowiedz.status()).toBe(200);
  expect((await odpowiedz.json()).status).toBe('shipped');
});
