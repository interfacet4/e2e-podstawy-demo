import { test, expect } from '@playwright/test';

// Polowanie (ćwiczenie 13): sortowanie katalogu po cenie.
// Katalog (/api/catalog) to te same produkty i ceny co kafelki na stronie „Produkty”.
// Adres: zmienna BASE_URL (raz rc, raz wersja zwykła). Endpoint publiczny, bez logowania.
// Ceny i stany zmieniają inne pary, więc oczekiwaną kolejność liczymy w teście:
// porównujemy listę cen z tą samą listą posortowaną liczbowo.

test.describe('sortowanie katalogu po cenie', () => {
  test('katalog posortowany „cena” ma ceny od najniższej do najwyższej', async ({ request }) => {
    const odpowiedz = await request.get('/api/catalog?sort=cena');

    expect(odpowiedz.status()).toBe(200);
    const ceny = ((await odpowiedz.json()) as { promo_price_cents: number }[]).map((p) => p.promo_price_cents);
    expect(ceny).toEqual([...ceny].sort((a, b) => a - b));
  });

  test('katalog posortowany „cena-malejaco” ma ceny od najwyższej do najniższej', async ({ request }) => {
    const odpowiedz = await request.get('/api/catalog?sort=cena-malejaco');

    expect(odpowiedz.status()).toBe(200);
    const ceny = ((await odpowiedz.json()) as { promo_price_cents: number }[]).map((p) => p.promo_price_cents);
    expect(ceny).toEqual([...ceny].sort((a, b) => b - a));
  });
});
