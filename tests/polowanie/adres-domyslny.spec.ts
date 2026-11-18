import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (ćwiczenie 13): dodanie adresu w „Moich adresach” nie zmienia adresu domyślnego.
// Wymaganie P12 (docs/projekt.md): klient dodaje adres, „potem ustawia go jako domyślny”.
// Na rc nowy adres od razu staje się domyślny, bez kliknięcia „Ustaw jako domyślny”.
// Konto: domyślne z zaloguj() (tester12).
const nazwa = `Praca ${Date.now()}`;

// Sprzątanie: usuwamy przez API adres o tej nazwie (adres główny ma id 0 i zostaje).
test.afterEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  const adresy = await (await request.get('/api/account/addresses')).json();
  for (const adres of adresy.filter((a: { name: string }) => a.name === nazwa)) {
    const usuniecie = await request.delete(`/api/account/addresses/${adres.id}`);
    expect(usuniecie.status()).toBe(200);
  }
});

test('nowy adres staje się domyślny dopiero po kliknięciu „Ustaw jako domyślny”', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/konto/adresy');

  await page.getByLabel('Nazwa adresu').fill(nazwa);
  await page.getByLabel('Ulica i numer').fill('ul. Biurowa 7');
  await page.getByLabel('Kod pocztowy').fill('00-950');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByLabel('Telefon').fill('600 700 800');
  await page.getByRole('button', { name: 'Dodaj adres' }).click();
  await expect(page.getByTestId('flash')).toHaveText(`Dodano adres: ${nazwa}`);

  // Zaraz po dodaniu domyślny jest nadal „Adres główny”, a nowy adres ma przycisk do ustawienia.
  const glowny = page.getByRole('article').filter({ has: page.getByRole('heading', { name: /^Adres główny/ }) });
  const nowy = page.getByRole('article').filter({ has: page.getByRole('heading', { name: new RegExp(`^${nazwa}`) }) });
  await expect(glowny.getByTestId('default-address')).toHaveText('Domyślny');
  await expect(nowy.getByTestId('default-address')).toHaveCount(0);

  // Dopiero kliknięcie przenosi plakietkę na nowy adres. Plakietka jest jedna na stronie.
  await nowy.getByRole('button', { name: `Ustaw jako domyślny: ${nazwa}` }).click();
  await expect(nowy.getByTestId('default-address')).toHaveText('Domyślny');
  await expect(page.getByTestId('default-address')).toHaveCount(1);
});
