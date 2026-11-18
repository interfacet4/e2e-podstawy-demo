import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): API dla nieistniejącego zamówienia.
// Konto: domyślne z zalogujPrzezApi() (tester12). Adres: zmienna BASE_URL (raz rc, raz wersja zwykła).
// Test tylko czyta dane. Treść błędu jak w P7 (docs/projekt.md) dla cudzego zamówienia.

test('nieistniejące zamówienie ZAM-999999 daje 404 i „Nie ma takiego zamówienia”', async ({ request }) => {
  await zalogujPrzezApi(request);

  const odpowiedz = await request.get('/api/orders/ZAM-999999');

  expect(odpowiedz.status()).toBe(404);
  expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
});
