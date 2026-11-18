import { test, expect } from '@playwright/test';

// Polowanie (ćwiczenie 13), niespodzianka Klaudiusza: ukryte wymagania Bożeny w API.
// Ślad: w stopce każdej strony jest komentarz HTML (widoczny w „Pokaż źródło strony”):
//   TODO(Bożena): wymagania na Czarny Piątek (wersja robocza) są pod /api/bozena/wymagania.
// To niespodzianka, a nie błąd: flaga jest taka sama na wersji zwykłej i na rc,
// więc test przechodzi na obu adresach. Adres jest publiczny, bez logowania.

test('ukryte wymagania Bożeny w API pokazują flagę niespodzianki FLAGA-9R6VC', async ({ request }) => {
  const odpowiedz = await request.get('/api/bozena/wymagania');

  expect(odpowiedz.status()).toBe(200);
  const tresc = await odpowiedz.json();
  expect(tresc.autor).toBe('Bożena');
  expect(tresc.status).toBe('ostatnia zmiana, obiecuję');
  expect(tresc.flaga).toBe('FLAGA-9R6VC');
});
