import { test, expect } from '@playwright/test';

// Ćwiczenie 09: testy API zamówień i dane przygotowane przez API.
// Opis endpointów: http://localhost:4100/api/docs (plik app/openapi.json).
//
// Logowanie przez API zwraca token. Token wysyłasz w nagłówku Authorization:
//   const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
//   const { token } = await logowanie.json();
//   await request.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
//
// Gdy test jest gotowy, zamień test.fixme na test i uruchom:
//   npx playwright test tests/cwiczenia/09-api.spec.ts

test.describe('API zamówień', () => {
  test('GET /api/orders zwraca zamówienia zalogowanego klienta', async ({ request }) => {
    // Ten test jest gotowy: wzór dla pozostałych.
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.get('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Podgląd odpowiedzi w terminalu: status i treść
    console.log('GET /api/orders:', odpowiedz.status(), await odpowiedz.json());

    expect(odpowiedz.status()).toBe(200);
    const zamowienia = await odpowiedz.json();
    expect(zamowienia).toContainEqual(
      expect.objectContaining({ number: 'ZAM-1001', product: 'Szampon nawilżający', customer: 'user' }),
    );
  });

  test('POST /api/orders tworzy zamówienie ze statusem „new”', async ({ request }) => {
    // Logowanie jako klient
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    // Nowe zamówienie: 2 sztuki produktu 20
    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 2 },
    });
    console.log('POST /api/orders (qty 2):', odpowiedz.status(), await odpowiedz.json());

    expect(odpowiedz.status()).toBe(201);
    const zamowienie = await odpowiedz.json();
    // objectContaining: sprawdzamy wybrane pola, pozostałe (np. data) mogą być dowolne
    expect(zamowienie).toEqual(
      expect.objectContaining({ product: 'Płyn do mycia naczyń', qty: 2, status: 'new' }),
    );
    // Numer jest za każdym razem inny, więc sprawdzamy tylko format: ZAM- i cztery cyfry
    expect(zamowienie.number).toMatch(/^ZAM-\d{4}$/);

    // Sprzątanie: admin anuluje zamówienie, towar wraca na stan
    const logowanieAdmina = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    const { token: tokenAdmina } = await logowanieAdmina.json();
    const anulowanie = await request.post(`/api/admin/orders/${zamowienie.number}/cancel`, {
      headers: { Authorization: `Bearer ${tokenAdmina}` },
    });
    console.log(`POST /api/admin/orders/${zamowienie.number}/cancel:`, anulowanie.status(), await anulowanie.json());
    expect(anulowanie.status()).toBe(200);
  });

  test('POST /api/orders z ilością 0 zwraca 400 z błędem pola qty', async ({ request }) => {
    // Logowanie jako klient: bez tokena API odpowie 401, zanim sprawdzi dane
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    // Zamówienie z błędną ilością (dozwolone 1–10)
    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 0 },
    });
    console.log('POST /api/orders (qty 0):', odpowiedz.status(), await odpowiedz.json());

    expect(odpowiedz.status()).toBe(400);
    expect(await odpowiedz.json()).toEqual({
      error: 'Błędne dane',
      errors: [{ field: 'qty', message: 'Ilość musi być liczbą całkowitą od 1 do 10' }],
    });
  });

  test('GET /api/orders bez logowania zwraca 401', async ({ request }) => {
    // Żądanie bez nagłówka Authorization, czyli bez tokena
    const odpowiedz = await request.get('/api/orders');
    console.log('GET /api/orders bez tokena:', odpowiedz.status(), await odpowiedz.json());

    expect(odpowiedz.status()).toBe(401);
    expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
  });

  test('GET /api/orders/ZAM-9999 zwraca 404', async ({ request }) => {
    // Logowanie jako klient: bez tokena API odpowie 401, a nie 404
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    // Pytamy o zamówienie, którego nie ma w bazie
    const odpowiedz = await request.get('/api/orders/ZAM-9999', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('GET /api/orders/ZAM-9999:', odpowiedz.status(), await odpowiedz.json());

    expect(odpowiedz.status()).toBe(404);
    expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
  });

  test('GET /api/orders/ZAM-1007 cudzego zamówienia zwraca 404 jak nieistniejące', async ({ request }) => {
    // ZAM-1007 istnieje w danych startowych, ale należy do klienta „biuro”, a nie do „user”
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.get('/api/orders/ZAM-1007', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('GET /api/orders/ZAM-1007 jako user:', odpowiedz.status(), await odpowiedz.json());

    // API nie zdradza, że cudze zamówienie istnieje: odpowiedź taka sama jak dla ZAM-9999
    expect(odpowiedz.status()).toBe(404);
    expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
  });
});

test.describe('Anulowanie zamówienia przygotowanego przez API', () => {
  // Numer zamówienia utworzonego przed testem
  let numer: string;

  test.beforeEach(async ({ request }) => {
    // Dane testowe przez API: klient składa nowe zamówienie (szybciej niż klikanie w sklepie)
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 1 },
    });
    console.log('beforeEach, POST /api/orders (qty 1):', odpowiedz.status(), await odpowiedz.json());
    expect(odpowiedz.status()).toBe(201);
    numer = (await odpowiedz.json()).number;
  });

  test.afterEach(async ({ request }) => {
    // Sprzątanie przez API: admin anuluje zamówienie, towar wraca na stan.
    // Działa także wtedy, gdy test padł w połowie.
    const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`afterEach, POST /api/admin/orders/${numer}/cancel:`, odpowiedz.status(), await odpowiedz.json());
    // 200: anulowane teraz; 409: test już je anulował w panelu
    expect([200, 409]).toContain(odpowiedz.status());
  });

  test('admin anuluje nowe zamówienie w panelu', async ({ page }) => {
    // Logowanie w przeglądarce jako admin
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('admin');
    await page.getByLabel('Hasło').fill('admin123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako admin')).toBeVisible();

    await page.goto('/admin/zamowienia');

    // Wiersz zamówienia z beforeEach, znaleziony po numerze
    const wiersz = page.getByRole('row').filter({ hasText: numer });
    await expect(wiersz.getByRole('cell', { name: 'Nowe', exact: true })).toBeVisible();

    await wiersz.getByRole('button', { name: 'Anuluj' }).click();

    await expect(page.getByText(`Anulowano zamówienie ${numer}`)).toBeVisible();
    await expect(wiersz.getByRole('cell', { name: 'Anulowane', exact: true })).toBeVisible();
  });
});
