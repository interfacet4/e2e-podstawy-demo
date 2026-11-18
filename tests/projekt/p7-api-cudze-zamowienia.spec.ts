import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// P7. Klient nie widzi cudzych zamówień (docs/projekt.md).
// Dane startowe: ZAM-1005 należy do konta admin, ZAM-1001 do konta user.
// Założenia wskazują konta user i admin, dlatego test działa lokalnie.
// Każdy test ma osobny `request`, więc sesja jednego konta nie przechodzi do drugiego testu.

test.describe('P7: dostęp do zamówień w API', () => {
  test('klient user pobiera swoje ZAM-1001, a cudze ZAM-1005 dostaje jako nieistniejące (404)', async ({ request }) => {
    await zalogujPrzezApi(request, 'user', 'user123');

    const swoje = await request.get('/api/orders/ZAM-1001');
    expect(swoje.status()).toBe(200);

    const cudze = await request.get('/api/orders/ZAM-1005');
    expect(cudze.status()).toBe(404);
    expect(await cudze.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
  });

  test('administrator pobiera zamówienie klienta ZAM-1001', async ({ request }) => {
    await zalogujPrzezApi(request, 'admin', 'admin123');

    const odpowiedz = await request.get('/api/orders/ZAM-1001');
    expect(odpowiedz.status()).toBe(200);
  });

  test('bez logowania API odpowiada 401 „Wymagane logowanie”', async ({ request }) => {
    const odpowiedz = await request.get('/api/orders/ZAM-1001');

    expect(odpowiedz.status()).toBe(401);
    expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
  });
});
