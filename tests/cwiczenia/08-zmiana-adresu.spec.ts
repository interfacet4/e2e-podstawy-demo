import { test, expect } from '@playwright/test';

// Ćwiczenie 08, część A: zmiana adresu dostawy.
// Przypadki testowe: docs/scenariusze/zmiana-adresu.md (TC-ADR-01, TC-ADR-02)
// i docs/scenariusze/zmiana-adresu.feature.
// Plan po review: docs/moje-review.md

// Adres startowy konta user (stan po npm run db:reset).
const adresStartowy = {
  ulica: 'ul. Przykładowa 12/3',
  kod: '00-001',
  miasto: 'Warszawa',
  telefon: '500 100 200',
};

// Wiersze tabeli „Przykłady” z pliku .feature: jedno błędne pole na test.
const bledneDane = [
  { pole: 'Kod pocztowy', wartosc: '31001', komunikat: 'Kod pocztowy musi mieć format 00-000' },
  { pole: 'Telefon', wartosc: '12345', komunikat: 'Telefon musi mieć 9 cyfr (opcjonalnie z +48)' },
  { pole: 'Miasto', wartosc: '', komunikat: 'Podaj miasto' },
];

test.describe('Zmiana adresu dostawy', () => {
  // Wszystkie testy zmieniają adres jednego konta user.
  // Uruchomione równolegle nadpisywałyby go sobie nawzajem, więc biegną po kolei.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // TC-ADR-01, krok 1: logowanie jako user.
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('user');
    await page.getByLabel('Hasło').fill('user123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako user (user)')).toBeVisible();

    // TC-ADR-01, krok 2 i TC-ADR-02, krok 1: formularz z adresem startowym.
    // exact: true, bo w menu jest też link „Moje adresy”.
    await page.getByRole('link', { name: 'Adres dostawy', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Zmiana adresu dostawy' })).toBeVisible();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue(adresStartowy.ulica);
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue(adresStartowy.kod);
    await expect(page.getByLabel('Miasto')).toHaveValue(adresStartowy.miasto);
    await expect(page.getByLabel('Telefon')).toHaveValue(adresStartowy.telefon);
  });

  test.afterEach(async ({ page }) => {
    // Sprzątanie, także po nieudanym teście: przywracamy adres startowy,
    // żeby następny test (i następne uruchomienie) zaczynał od tego samego stanu.
    await page.goto('/konto/adres');
    await page.getByLabel('Ulica i numer').fill(adresStartowy.ulica);
    await page.getByLabel('Kod pocztowy').fill(adresStartowy.kod);
    await page.getByLabel('Miasto').fill(adresStartowy.miasto);
    await page.getByLabel('Telefon').fill(adresStartowy.telefon);
    await page.getByRole('button', { name: 'Zapisz adres' }).click();
    await expect(page.getByRole('status')).toHaveText('Zapisano adres dostawy.');
  });

  test('poprawny adres zapisuje się i zostaje po odświeżeniu strony', async ({ page }) => {
    // TC-ADR-01, krok 3: wpisanie nowego adresu.
    await page.getByLabel('Ulica i numer').fill('ul. Lipowa 7');
    await page.getByLabel('Kod pocztowy').fill('31-001');
    await page.getByLabel('Miasto').fill('Kraków');
    await page.getByLabel('Telefon').fill('600 200 300');
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
    await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');

    // TC-ADR-01, krok 4: zapis i komunikat.
    await page.getByRole('button', { name: 'Zapisz adres' }).click();
    await expect(page.getByRole('status')).toHaveText('Zapisano adres dostawy.');

    // TC-ADR-01, krok 5: po odświeżeniu (F5) pola nadal mają nowy adres.
    await page.reload();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
    await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');
  });

  // TC-ADR-02 i „Szablon scenariusza”: jeden test na każdy wiersz tabeli Przykłady.
  for (const dane of bledneDane) {
    test(`błędna wartość „${dane.wartosc}” w polu ${dane.pole} blokuje zapis adresu`, async ({ page }) => {
      // TC-ADR-02, kroki 2–3: jedno błędne pole, reszta bez zmian.
      await page.getByLabel(dane.pole).fill(dane.wartosc);
      await page.getByRole('button', { name: 'Zapisz adres' }).click();

      // Najpierw alert: czekamy, aż strona po zapisie się wczyta.
      await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
      await expect(page.getByText(dane.komunikat, { exact: true })).toBeVisible();
      // Dopiero teraz sprawdzenie „brak sukcesu” ma sens (strona już po odpowiedzi serwera).
      await expect(page.getByText('Zapisano adres dostawy.')).toBeHidden();

      // TC-ADR-02, krok 4: otwieramy stronę od nowa. Formularz po błędzie
      // pokazuje błędną wartość, więc tylko ponowne otwarcie pokazuje, co jest zapisane.
      await page.getByRole('link', { name: 'Adres dostawy', exact: true }).click();
      await expect(page.getByLabel('Ulica i numer')).toHaveValue(adresStartowy.ulica);
      await expect(page.getByLabel('Kod pocztowy')).toHaveValue(adresStartowy.kod);
      await expect(page.getByLabel('Miasto')).toHaveValue(adresStartowy.miasto);
      await expect(page.getByLabel('Telefon')).toHaveValue(adresStartowy.telefon);
    });
  }
});
