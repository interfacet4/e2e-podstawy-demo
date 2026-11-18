import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Ten plik domyślnie idzie na wspólny serwer szkoleniowy (działa tylko 16–18.11.2026).
// Inny adres podasz zmienną, np. lokalnie: $env:BASE_URL="http://localhost:4100"
const adresAplikacji = process.env.BASE_URL || 'https://namssor-376292984721.europe-central2.run.app';
test.use({ baseURL: adresAplikacji });

// Na starcie wypisuje w terminalu, na jaki adres idą testy z tego pliku:
// serwer szkoleniowy albo adres z $env:BASE_URL.
test.beforeAll(async () => {
  console.log(`P9: testy idą na adres ${adresAplikacji}`);
});

// P9. Ta sama cena promocyjna w trzech miejscach (docs/projekt.md).
// Klient: konto domyślne z zaloguj() (dziś tester12, albo konto pary z APP_USER).
// Oczekiwane ceny z wymagania: stara 32,99 zł, nowa 26,39 zł, plakietka -20%.

// Koszyk jest wspólny dla całego konta: test zaczyna i kończy z pustym koszykiem.
test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  await request.delete('/api/cart');
});

// „Test na koniec usuwa krem z koszyka” – przez API, żeby sprzątanie zadziałało także po błędzie w teście.
test.afterEach(async ({ request }) => {
  const odpowiedz = await request.delete('/api/cart');
  expect(odpowiedz.status()).toBe(200);
});

test('krem do twarzy ma cenę 26,39 zł zamiast 32,99 zł na kafelku, na karcie produktu i w koszyku', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/');

  // 1. Kafelek w sekcji „Oferta na Czarny Piątek”.
  const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  // Stara cena nie ma roli ani etykiety, więc szukamy jej po data-testid.
  // Samego przekreślenia (wyglądu) nie sprawdzamy: liczy się, że obok nowej ceny jest stara.
  await expect(kafelek.getByTestId('tile-old-price')).toHaveText('32,99 zł');
  await expect(kafelek.getByTestId('tile-price')).toHaveText('26,39 zł');
  await expect(kafelek.getByTestId('tile-badge')).toHaveText('-20%');

  // 2. Karta produktu: wchodzimy linkiem z kafelka.
  await kafelek.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Krem do twarzy na dzień');
  const karta = page.getByTestId('product-card');
  await expect(karta.getByTestId('product-old-price')).toHaveText('32,99 zł');
  await expect(karta.getByTestId('product-price')).toHaveText('26,39 zł');
  await expect(karta.getByTestId('product-badge')).toHaveText('-20%');

  // 3. Koszyk.
  await karta.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await page.getByRole('navigation', { name: 'Menu główne' }).getByRole('link', { name: 'Koszyk' }).click();
  const wiersz = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  // Kolumna „Cena” pokazuje starą cenę, nową cenę i plakietkę, dlatego porównujemy cały tekst komórki.
  await expect(wiersz.getByTestId('cart-item-price')).toHaveText('32,99 zł 26,39 zł -20%');
});
