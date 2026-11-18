import { test, expect } from '@playwright/test';

// Na starcie wypisuje w terminalu, na jaki adres idą testy z tego pliku:
// localhost (aplikacja lokalna) albo serwer szkoleniowy z $env:BASE_URL.
test.beforeAll(async ({}, testInfo) => {
  console.log(`P5: testy idą na adres ${testInfo.project.use.baseURL}`);
});

// P5. Katalog produktów w API (docs/projekt.md).
// Katalog jest publiczny, więc testy nie logują się.
test.describe('P5: katalog produktów w API', () => {
  test('lista produktów z kategorii Dziecko zwraca 3 produkty tej kategorii', async ({ request }) => {
    const odpowiedz = await request.get('/api/products?category=Dziecko');

    expect(odpowiedz.status()).toBe(200);
    const produkty = await odpowiedz.json();
    expect(produkty).toHaveLength(3);
    // Każdy produkt z listy ma kategorię „Dziecko”.
    for (const produkt of produkty) {
      expect(produkt.category).toBe('Dziecko');
    }
  });

  test('nieistniejący produkt 999 daje 404 i komunikat „Nie ma takiego produktu”', async ({ request }) => {
    const odpowiedz = await request.get('/api/products/999');

    expect(odpowiedz.status()).toBe(404);
    expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego produktu' });
  });
});
