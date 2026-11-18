# Zasady pisania testów w tym repo

Repo szkoleniowe: aplikacja Namssor (`app/`, port 4100) i testy Playwright w TypeScript (`tests/`).
Testy czytają i oceniają testerzy, którzy dopiero uczą się kodu. Pisz prosto i czytelnie.

## Kod testu
- Importuj wyłącznie `import { test, expect } from '@playwright/test';`.
- Bez Page Object, własnych fixtures i funkcji pomocniczych, chyba że użytkownik o nie poprosi.
  Wyjątek: logowanie zawsze przez gotowe funkcje z `tests/pomocnicze/logowanie.ts`
  (`await zaloguj(page);` albo `await zalogujPrzezApi(request);`), z drugim importem
  `import { zaloguj } from '../pomocnicze/logowanie';`. Nie przepisuj ręcznie pól logowania.
- Lokatory w tej kolejności: `getByRole`, `getByLabel`, `getByText`, dopiero potem `getByTestId`.
  Nie używaj selektorów CSS i XPath, `id` ani klas.
- Wiersz tabeli znajdź po treści: `page.getByRole('row').filter({ hasText: 'ZAM-1003' })`.
- Asercje web-first, które same czekają: `await expect(lokator).toBeVisible()`, `toHaveText`, `toHaveURL`.
- Nigdy `page.waitForTimeout()` ani stałych pauz. Nie sprawdzaj stanu przez `isVisible()` w `if`.
- Jeden test sprawdza jedno zachowanie. Nazwa testu po polsku opisuje oczekiwany wynik.
- Komentarze po polsku, krótkie: co robi krok i dlaczego, gdy to nieoczywiste.
- Testy API przez fixture `request`; sprawdzaj status i treść odpowiedzi.

## Uruchamianie
- `npx playwright test` (wszystkie), `npx playwright test <plik>` (jeden plik), `npm run test:smoke`.
- Playwright sam uruchamia aplikację (`webServer` w `playwright.config.ts`).
- Po zmianach: `npm run typecheck`. Polecenia mają działać w PowerShell 5.1 (bez `&&`).
- Stan bazy psuje się po testach zmieniających dane: `npm run db:reset` przy zatrzymanej aplikacji.

## Dane
- Konta demo: `user` / `user123` (klient), `admin` / `admin123` (administrator).
- Opis API: `app/openapi.json`, w przeglądarce http://localhost:4100/api/docs.
- Nie zmieniaj kodu aplikacji w `app/`, chyba że użytkownik wyraźnie o to prosi.

## Review i dane testowe
- Sprawdzaj efekt biznesowy (status zamówienia, zapisane dane, treść komunikatu), a nie kolor, klasę CSS czy układ strony.
- Bierz oczekiwane wartości z wymagania albo przypadku testowego, nie przepisuj ich ze strony, i porównuj tekst dokładnie przez `toHaveText`, nie `toContainText`.
- Napisz asercję dla każdego zdania wymagania. Każda asercja ma paść, gdy akcja testu się nie uda: nie sprawdzaj elementów, które przed akcją wyglądały tak samo.
- Gdy test zmienia dane, przygotuj własne dane (najlepiej przez API w `beforeEach`) i sprzątaj po sobie w `afterEach`, żeby test przechodził przy każdym uruchomieniu i nie zależał od innych testów.
- Testuj wymaganie klienta na koncie `user`, a wymaganie admina na koncie `admin`. Stronę publiczną (np. „Produkty”) testuj bez logowania.
- W asercjach z `not` albo `toBeHidden()` używaj tylko tekstu, który znalazłeś w aplikacji, a lokator sprawdzaj zawsze przez `await expect(lokator).toX()`, nigdy przez `toBeTruthy()`.
- Nie ukrywaj niejednoznacznego lokatora za `.first()`, `.nth()` albo `.last()`, tylko zawęź go, np. szukaj elementu wewnątrz właściwego wiersza.
- Nie pisz „jestem pewien”, tylko pokaż dowód: uruchom test dwa razy i raz celowo zepsuj oczekiwaną wartość, żeby zobaczyć, że pada.
