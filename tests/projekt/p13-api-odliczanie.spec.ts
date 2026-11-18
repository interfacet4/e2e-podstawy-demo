import { test, expect } from '@playwright/test';

// Ten plik domyślnie idzie na wspólny serwer szkoleniowy (działa tylko 16–18.11.2026).
// Inny adres podasz zmienną, np. lokalnie: $env:BASE_URL="http://localhost:4100"
const adresAplikacji = process.env.BASE_URL || 'https://namssor-376292984721.europe-central2.run.app';
test.use({ baseURL: adresAplikacji });

// Na starcie wypisuje w terminalu, na jaki adres idą testy z tego pliku:
// serwer szkoleniowy albo adres z $env:BASE_URL.
test.beforeAll(async () => {
  console.log(`P13: testy idą na adres ${adresAplikacji}`);
});

// P13. Odliczanie do Czarnego Piątku (docs/projekt.md).
// Nagłówek X-Namssor-Teraz podaje „dzisiejszą” datę (opis w /api/docs). Endpoint publiczny, bez logowania.

// Zmiana wymagań Bożeny z 13:00: zamiast 20.11 sprawdzamy dzień przed startem i dzień startu.
const daty = [
  {
    data: '2026-11-26',
    dni: 1,
    komunikat: 'Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji został 1 dzień.',
  },
  {
    data: '2026-11-27',
    dni: 0,
    komunikat: 'Czarny Piątek w Namssorze trwa! Tylko dziś najniższe ceny.',
  },
];

test.describe('P13: odliczanie do Czarnego Piątku w API', () => {
  // Osobny test dla każdej daty; data w nazwie, żeby nazwy testów się nie powtarzały.
  for (const { data, dni, komunikat } of daty) {
    test(`${data}: days_left równe ${dni} i komunikat zgodny z wymaganiem`, async ({ request }) => {
      const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': data } });

      expect(odpowiedz.status()).toBe(200);
      const tresc = await odpowiedz.json();
      expect(tresc.days_left).toBe(dni);
      expect(tresc.message).toBe(komunikat);
    });
  }

  test('nagłówek X-Namssor-Teraz z wartością „jutro” daje 400', async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': 'jutro' } });

    expect(odpowiedz.status()).toBe(400);
  });
});
