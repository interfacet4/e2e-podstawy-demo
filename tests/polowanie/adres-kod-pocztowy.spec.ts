import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): walidacja kodu pocztowego w adresie profilu.
// Formularz „Moje adresy” podpowiada „Format: 00-000”, więc kod 00950 (bez kreski) ma być odrzucony.
// Konto: domyślne z zalogujPrzezApi() (tester12). Adres: zmienna BASE_URL (raz rc, raz wersja zwykła).
const nazwa = `Kod ${Date.now()}`;

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
});

// Sprzątanie: gdyby aplikacja zapisała adres, usuwamy go (adres główny ma id 0 i zostaje).
test.afterEach(async ({ request }) => {
  const adresy = await (await request.get('/api/account/addresses')).json();
  for (const adres of adresy.filter((a: { name: string }) => a.name === nazwa)) {
    expect((await request.delete(`/api/account/addresses/${adres.id}`)).status()).toBe(200);
  }
  // Zapisany adres mógł zostać domyślnym: przywracamy „Adres główny” jako domyślny.
  const poSprzataniu = await (await request.get('/api/account/addresses')).json();
  if (!poSprzataniu.find((a: { id: number; default: boolean }) => a.id === 0)?.default) {
    await request.put('/api/account/addresses/0/default');
  }
});

test('adres w profilu z kodem pocztowym 00950 jest odrzucony: 400 i błąd w polu postal_code', async ({ request }) => {
  const odpowiedz = await request.post('/api/account/addresses', {
    data: { name: nazwa, street: 'ul. Biurowa 7', postal_code: '00950', city: 'Warszawa', phone: '600 700 800' },
  });

  expect(odpowiedz.status()).toBe(400);
  const tresc = await odpowiedz.json();
  const bladKodu = tresc.errors.find((blad: { field: string }) => blad.field === 'postal_code');
  expect(bladKodu.message).toBe('Kod pocztowy musi mieć format 00-000');
});
