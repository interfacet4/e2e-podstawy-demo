import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Ten plik domyślnie idzie na wspólny serwer szkoleniowy (działa tylko 16–18.11.2026).
// Inny adres podasz zmienną, np. lokalnie: $env:BASE_URL="http://localhost:4100"
const adresAplikacji = process.env.BASE_URL || 'https://namssor-376292984721.europe-central2.run.app';
test.use({ baseURL: adresAplikacji });

// Na starcie wypisuje w terminalu, na jaki adres idą testy z tego pliku:
// serwer szkoleniowy albo adres z $env:BASE_URL.
test.beforeAll(async () => {
  console.log(`P12: testy idą na adres ${adresAplikacji}`);
});

// P12. Drugi adres w profilu (docs/projekt.md).
// Klient: konto domyślne z zaloguj() (dziś tester12, albo konto pary z APP_USER).
const nazwa = `Praca ${Date.now()}`;

// Gdyby test padł przed usunięciem adresu, usuwamy go przez API (adres główny ma id 0 i zostaje).
test.afterEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  const adresy = await (await request.get('/api/account/addresses')).json();
  for (const adres of adresy.filter((a: { name: string }) => a.name === nazwa)) {
    expect((await request.delete(`/api/account/addresses/${adres.id}`)).status()).toBe(200);
  }
});

test('nowy adres ustawiony jako domyślny ma jedyną plakietkę, a po jego usunięciu domyślny jest „Adres główny”', async ({ page }) => {
  await zaloguj(page);
  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Moje adresy' }).click();

  await page.getByLabel('Nazwa adresu').fill(nazwa);
  await page.getByLabel('Ulica i numer').fill('ul. Biurowa 7');
  await page.getByLabel('Kod pocztowy').fill('00-950');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByLabel('Telefon').fill('600 700 800');
  await page.getByRole('button', { name: 'Dodaj adres' }).click();

  // Komunikat i nowy adres na liście (komunikat znika po kilku sekundach, sprawdzamy go od razu).
  await expect(page.getByTestId('flash')).toHaveText(`Dodano adres: ${nazwa}`);
  const nowy = page.getByRole('article').filter({ has: page.getByRole('heading', { name: new RegExp(`^${nazwa}`) }) });
  const glowny = page.getByRole('article').filter({ has: page.getByRole('heading', { name: /^Adres główny/ }) });
  await expect(nowy).toBeVisible();

  // „Ustaw jako domyślny”: plakietka przy nowym adresie i tylko jedna na stronie.
  await nowy.getByRole('button', { name: `Ustaw jako domyślny: ${nazwa}` }).click();
  await expect(nowy.getByTestId('default-address')).toHaveText('Domyślny');
  await expect(page.getByTestId('default-address')).toHaveCount(1);

  // „Adres główny” nie ma przycisku „Usuń”. To stan stały, niezależny od akcji testu:
  // asercja zostaje, bo sprawdza zdanie wymagania. Tekst „Usuń” jest na stronie (przy nowym adresie).
  await expect(glowny.getByRole('button', { name: /Usuń/ })).toHaveCount(0);

  // Test usuwa swój adres, a „Domyślny” wraca do „Adres główny”.
  await nowy.getByRole('button', { name: `Usuń adres: ${nazwa}` }).click();
  await expect(nowy).toHaveCount(0);
  await expect(glowny.getByTestId('default-address')).toHaveText('Domyślny');
});
