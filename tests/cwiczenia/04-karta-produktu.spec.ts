import { test, expect } from '@playwright/test';

// Ćwiczenie 04b: ta sama cena promocyjna na kafelku, na karcie produktu i w koszyku.
// Karta: docs/cwiczenia/04-locatory-codegen.md (część 04b)
// Konto tester11 ma osobny koszyk: testy z ćwiczeń 02 i 04 dodają produkty do koszyka konta user.

test('cena promocyjna kremu jest taka sama na kafelku, karcie produktu i w koszyku', async ({ page }) => {
  // TODO 1: zaloguj się jako tester11 / czarny-piatek-2026.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester11');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester11')).toBeVisible();

  // TODO 2: na stronie „Produkty” znajdź kafelek „Krem do twarzy na dzień” i sprawdź w nim ceny i plakietkę.
  // Nazwa kremu jest na stronie dwa razy (tabela i kafelek), dlatego najpierw zawężamy do kafelka,
  // a ceny szukamy już tylko w nim.
  await page.getByRole('link', { name: 'Produkty' }).click();
  const kafelekKremu = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  await expect(kafelekKremu.getByText('26,39 zł')).toBeVisible();
  await expect(kafelekKremu.getByText('32,99 zł')).toBeVisible();
  await expect(kafelekKremu.getByText('-20%')).toBeVisible();

  // TODO 3: kliknij nazwę produktu w kafelku. Sprawdź nagłówek karty produktu i te same trzy rzeczy.
  await kafelekKremu.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();
  await expect(page.getByRole('heading', { name: 'Krem do twarzy na dzień' })).toBeVisible();
  // Szukamy w ramce karty produktu, żeby nie trafić np. w baner promocji nad nią.
  const kartaProduktu = page.getByRole('article').filter({ hasText: 'Krem do twarzy na dzień' });
  await expect(kartaProduktu.getByText('26,39 zł')).toBeVisible();
  await expect(kartaProduktu.getByText('32,99 zł')).toBeVisible();
  await expect(kartaProduktu.getByText('-20%')).toBeVisible();

  // TODO 4: kliknij „Dodaj do koszyka” i sprawdź komunikat.
  await kartaProduktu.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Krem do twarzy na dzień')).toBeVisible();

  // TODO 5: przejdź do koszyka. Sprawdź, że wiersz kremu ma cenę 26,39 zł.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wierszKremu = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  await expect(wierszKremu).toContainText('26,39 zł');

  // TODO 6: usuń krem z koszyka, żeby następne uruchomienie zaczynało od pustego koszyka.
  await wierszKremu.getByRole('button', { name: 'Usuń' }).click();
  await expect(wierszKremu).toHaveCount(0);
  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
});

// Osobne konto tester12, żeby ten test nie mieszał w koszyku testu wyżej (tester11).
test('kod CZARNY20 obniża sumę do zapłaty za krem do 21,11 zł', async ({ page }) => {
  // Logowanie jako tester12.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester12');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester12')).toBeVisible();

  // Dodanie kremu do koszyka z tabeli produktów.
  await page.getByRole('link', { name: 'Produkty' }).click();
  await page
    .getByRole('row')
    .filter({ hasText: 'Krem do twarzy na dzień' })
    .getByRole('button', { name: 'Dodaj do koszyka' })
    .click();
  await expect(page.getByText('Dodano do koszyka: Krem do twarzy na dzień')).toBeVisible();

  // Wpisanie kodu rabatowego w koszyku.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  await page.getByLabel('Kod rabatowy').fill('CZARNY20');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  // Komunikat i suma po rabacie: 26,39 zł - 20% = 21,11 zł.
  await expect(page.getByText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.')).toBeVisible();
  await expect(page.getByText('razem: 21,11 zł')).toBeVisible();

  // Sprzątanie: najpierw kod, potem krem, żeby następne uruchomienie zaczynało od pustego koszyka.
  await page.getByRole('button', { name: 'Usuń kod' }).click();
  await expect(page.getByText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.')).toBeHidden();
  const wierszKremu = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  await wierszKremu.getByRole('button', { name: 'Usuń' }).click();
  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
});

// Karta produktu jest dostępna bez logowania, więc ten test się nie loguje.
test('na karcie niedostępnego serum nie da się dodać produktu do koszyka', async ({ page }) => {
  await page.goto('/');

  // Otwarcie karty przez kafelek (nazwa serum jest też w tabeli, dlatego zawężamy do kafelka).
  const kafelekSerum = page.getByRole('article', { name: 'Serum z witaminą C' });
  await kafelekSerum.getByRole('link', { name: 'Serum z witaminą C' }).click();
  await expect(page.getByRole('heading', { name: 'Serum z witaminą C' })).toBeVisible();

  // Przycisk i pole ilości są wyłączone (szare, nie da się w nie kliknąć).
  await expect(page.getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
  await expect(page.getByLabel('Ilość')).toBeDisabled();
});
