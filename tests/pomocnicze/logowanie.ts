import { expect, type APIRequestContext, type Page } from '@playwright/test';

// Logowanie wspólne dla wielu testów (ćwiczenie 11 i projekt).
// Bez parametrów loguje konto ze zmiennych APP_USER i APP_PASSWORD,
// a gdy ich nie ma, konto szkoleniowe tester12 (zasada na dzień 18.11.2026).
// To samo konto ustawisz jawnie w oknie testów:
//   $env:APP_USER="tester12"
//   $env:APP_PASSWORD="czarny-piatek-2026"
// Inne konto (np. user albo admin z założeń testu) podajesz w wywołaniu, patrz niżej.
// Hasło jest fikcyjne: konta tester01–tester12 istnieją tylko w bazie szkoleniowej Namssor.

const domyslnyLogin = () => process.env.APP_USER || 'tester12';
const domyslneHaslo = () => process.env.APP_PASSWORD || 'czarny-piatek-2026';

// Logowanie przez formularz w przeglądarce.
// Wywołanie w teście: await zaloguj(page);
// Inne konto: await zaloguj(page, 'biuro', 'biuro123');
export async function zaloguj(page: Page, login = domyslnyLogin(), haslo = domyslneHaslo()) {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill(login);
  await page.getByLabel('Hasło').fill(haslo);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  // Bez tej asercji test szedłby dalej także po nieudanym logowaniu.
  await expect(page.getByText(`Zalogowano jako ${login}`)).toBeVisible();
}

// Logowanie w testach API. Po nim `request` wysyła ciasteczko sesji w kolejnych żądaniach.
// Wywołanie w teście: await zalogujPrzezApi(request);
export async function zalogujPrzezApi(request: APIRequestContext, login = domyslnyLogin(), haslo = domyslneHaslo()) {
  const odpowiedz = await request.post('/api/login', { data: { login, password: haslo } });
  expect(odpowiedz.status(), `logowanie ${login} przez API`).toBe(200);
}
