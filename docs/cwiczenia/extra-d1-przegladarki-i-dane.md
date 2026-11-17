# Zadanie dodatkowe D1. Te same testy w trzech przeglądarkach, na telefonie i dla kilku zestawów danych

Zadanie dodatkowe · dzień 1 · ok. 75 min · w parach

## Cel

Uruchomisz istniejące testy w Firefoksie, WebKicie i na emulowanym telefonie bez zmiany kodu testu. Znajdziesz zrzut ekranu z nieudanego testu i dołączysz własny zrzut do raportu. Zamienisz jeden test na pętlę po zestawach danych. Każdy zestaw będzie osobnym testem w raporcie. Zrobisz to dla adresu, a potem dla kodów rabatowych.

## Materiał wejściowy

> **Od Bożeny:** Połowa klientów kupi na Czarny Piątek z telefonu, druga połowa w Safari, a trzecia połowa wpisze wszystkie kody rabatowe, jakie znajdzie w internecie. Kody mam w tabelce: jeden działa, jeden wygasł, jeden jest tylko na włosy. Sprawdźcie je wszystkie. Tabelkę zmieniam ostatni raz, obiecuję.

Gałąź `extra/d1-przegladarki-i-dane`. Nowe pliki są w `tests/extra/d1/`:

| Plik | Co w nim jest |
|---|---|
| `telefon.spec.ts` | test z `test.fixme` i TODO: przejście do koszyka na ekranie telefonu |
| `zrzuty.spec.ts` | test „Moje zamówienia” z `test.fixme` i TODO: zrzut ekranu do raportu |
| `dane-adresu.spec.ts` | gotowy test jednego błędnego adresu i TODO: pętla po zestawach danych |
| `kody-rabatowe.spec.ts` | gotowy test jednego kodu rabatowego i TODO: pętla po tabeli kodów |

`playwright.config.ts` ma już projekty `firefox` i `webkit` z `default: false`: nie uruchamiają się przy `npm test`, tylko gdy wskażesz je przez `--project`.

## Kroki

PowerShell, z katalogu głównego repo. Polecenia `npx` i `git` wpisujesz w oknie testów.

1. **Zapisz swoją pracę na gałęzi `main`.**
   ```powershell
   git add .
   git commit -m "Praca przed zadaniem D1"
   ```
   Oczekiwany wynik: pierwsza linia `[main 1a2b3c4] Praca przed zadaniem D1` (skrót będzie inny). Odpowiedź `nothing to commit, working tree clean` też jest w porządku: wszystko było już zapisane.

2. **Przełącz się na gałąź zadania i uruchom pliki startowe.**
   ```powershellgit remote add upstream https://github.com/agentGreg/e2e-podstawy-demo.git
   git fetch origin
   git switch extra/d1-przegladarki-i-dane
   npx playwright test tests/extra/d1
   ```
   Oczekiwany wynik: `2 passed` i `2 skipped`.

3. **Uruchom gotowe testy w Firefoksie i WebKicie.** WebKit to silnik przeglądarki Safari. Każda przeglądarka to osobne pobranie, kilkadziesiąt MB.
   ```powershell
   npx playwright install firefox webkit
   npx playwright test tests/przyklady --project=firefox
   npx playwright test tests/przyklady --project=webkit
   npx playwright test tests/przyklady --project=chromium --project=firefox --project=webkit
   ```
   Oczekiwany wynik: `3 passed`, `3 passed`, a w ostatnim poleceniu `9 passed`. W liście wyników nazwa przeglądarki stoi w nawiasie: `[firefox]`, `[webkit]`.

4. **Dodaj projekt „telefon” i uruchom w nim test.** W `playwright.config.ts` dopisz w tablicy `projects` nowy projekt: nazwa `telefon`, `default: false`, te same `testIgnore` co w projekcie `chromium`, a w `use` urządzenie `devices['Pixel 7']`. Potem w `tests/extra/d1/telefon.spec.ts` wykonaj punkty TODO 1–4 i zamień `test.fixme` na `test`.
   ```powershell
   npx playwright test tests/extra/d1/telefon.spec.ts --project=telefon
   npx playwright test tests/extra/d1/telefon.spec.ts
   ```
   Oczekiwany wynik: najpierw `1 passed`, potem `1 skipped`. Drugie polecenie uruchamia się w projekcie `chromium`, gdzie `isMobile` jest `false`, więc test się pomija.

> **Jeśli utknąłeś po 10 minutach**
> Skopiuj projekt `firefox` z konfiguracji i zmień w kopii trzy rzeczy: nazwę, urządzenie w `use` i dopisz `testIgnore`. Komunikat `Project(s) "telefn" not found. Available projects: ...` oznacza literówkę w nazwie projektu w poleceniu albo w konfiguracji.

5. **Obejrzyj zrzut z nieudanego testu, potem zrób zrzut sam.** W `tests/extra/d1/zrzuty.spec.ts` zamień `test.fixme` na `test`, a w asercji na chwilę zmień `ZAM-1001` na `ZAM-9999`. Uruchom plik:
   ```powershell
   npx playwright test tests/extra/d1/zrzuty.spec.ts
   ```
   Oczekiwany wynik: `1 failed` po ok. 5 s, a w opisie błędu `attachment #1: screenshot (image/png)` i ścieżka kończąca się na `test-failed-1.png`. Ten zrzut powstaje sam, bo konfiguracja ma `screenshot: 'only-on-failure'`. Przywróć `ZAM-1001` w asercji, wykonaj punkty TODO 1 i 2 (ręczny zrzut całej strony i załącznik w raporcie), uruchom plik jeszcze raz i otwórz raport:
   ```powershell
   npx playwright test tests/extra/d1/zrzuty.spec.ts
   npx playwright show-report
   ```
   Oczekiwany wynik: `1 passed`. W raporcie, w szczegółach testu, sekcja „Attachments” z pozycją `moje-zamowienia` i podglądem strony.

6. **Zamień test adresu na pętlę po zestawach danych.** W `tests/extra/d1/dane-adresu.spec.ts` wykonaj punkty TODO 1–3: `interface` z polami zestawu, tablica co najmniej czterech zestawów (w każdym błędne dokładnie jedno pole: kod pocztowy, telefon, miasto, ulica), pętla `for (const zestaw of zestawy)` wokół testu. Komunikaty przy polach sprawdzisz ręcznie na http://localhost:4100/konto/adres (aplikacja działa w oknie aplikacji po `npm start`).
   ```powershell
   npx playwright test tests/extra/d1/dane-adresu.spec.ts
   ```
   Oczekiwany wynik: `4 passed`, każdy test z innym opisem w nazwie.

> **Jeśli utknąłeś po 10 minutach**
> Błąd `duplicate test title` oznacza, że wszystkie testy z pętli mają tę samą nazwę. Nazwa musi zawierać pole zestawu, np. `` test(`błędny adres nie zapisuje się: ${zestaw.opis}`, ...) ``. Zwróć uwagę na odwrócone apostrofy `` ` `` zamiast `'`.

7. **Zamień test kodu rabatowego na tabelę danych.** W `tests/extra/d1/kody-rabatowe.spec.ts` wykonaj punkty TODO 1–3 tym samym wzorcem co w kroku 6. Tabela ma cztery kody: `CZARNY20` (przyjęty), `JESIEN10` (wygasł), `WLOSY15` (działa tylko na kategorię Włosy, a w koszyku jest krem do twarzy) i kod, którego nie ma. Komunikaty skopiuj z koszyka konta `tester10` na http://localhost:4100/koszyk.
   ```powershell
   npx playwright test tests/extra/d1/kody-rabatowe.spec.ts
   ```
   Oczekiwany wynik: `4 passed`, każdy test z innym kodem w nazwie.

8. **Uruchom cały zestaw na komputerze i na telefonie.**
   ```powershell
   npx playwright test tests/extra/d1
   npx playwright test tests/extra/d1 --project=telefon
   ```
   Oczekiwany wynik: `9 passed` i `1 skipped`, potem `10 passed`.

9. **Zapisz pracę i wróć do projektu.**
   ```powershell
   git add .
   git commit -m "Zadanie D1: przeglądarki, telefon i dane"
   git switch main
   ```
   Oczekiwany wynik: `Switched to branch 'main'`.

## Przykład wyniku

Zestaw danych i pętla dla innego formularza (logowanie), nie dla adresu:
```ts
interface ZestawLogowania {
  opis: string;
  login: string;
  haslo: string;
}

const zestawy: ZestawLogowania[] = [
  { opis: 'złe hasło', login: 'user', haslo: 'zle-haslo' },
  { opis: 'nieznany login', login: 'nikt', haslo: 'user123' },
];

for (const zestaw of zestawy) {
  test(`logowanie się nie udaje: ${zestaw.opis}`, async ({ page }) => {
    // ...
  });
}
```

Wynik polecenia `npx playwright test tests/extra/d1/dane-adresu.spec.ts` z kroku 6 (czasy, kolejność i liczba workers u ciebie będą inne):
```
Running 4 tests using 4 workers
  ✓  4 [chromium] › tests/extra/d1/dane-adresu.spec.ts:42:7 › błędny adres nie zapisuje się: cyfra w nazwie miasta (356ms)
  ✓  3 [chromium] › tests/extra/d1/dane-adresu.spec.ts:42:7 › błędny adres nie zapisuje się: pusta ulica (360ms)
  ✓  1 [chromium] › tests/extra/d1/dane-adresu.spec.ts:42:7 › błędny adres nie zapisuje się: kod pocztowy bez myślnika (361ms)
  ✓  2 [chromium] › tests/extra/d1/dane-adresu.spec.ts:42:7 › błędny adres nie zapisuje się: telefon z 5 cyframi (361ms)

  4 passed (1.2s)
```

## Kryterium „gotowe”

- [ ] `npx playwright test tests/extra/d1` daje `9 passed` i `1 skipped`, a z `--project=telefon` daje `10 passed`.
- [ ] `npm test` przechodzi i nie uruchamia projektu `telefon` (w liście wyników nie ma `[telefon]`).
- [ ] Zmieniasz `oczekiwanyBlad` w jednym zestawie adresu albo `komunikat` w jednym zestawie kodu na inny tekst: pada dokładnie jeden test, a jego nazwa mówi, który zestaw. Potem przywracasz tekst.
- [ ] Pokazujesz drugiej osobie w raporcie HTML załącznik `moje-zamowienia` i plik `test-failed-1.png` z kroku 5.

## Dla szybszych

> **Skończyłeś wcześniej**
> Dodaj do interfejsu pole `liczbaBledow: number` i piąty zestaw z dwoma błędnymi polami naraz. Asercja komunikatu ma używać tego pola: `Popraw błędy w formularzu (2).` Potem dodaj drugi projekt telefonu, `telefon-iphone`, z `devices['iPhone 15']`, i uruchom w nim `tests/extra/d1`. Sprawdź w wyniku, w jakiej przeglądarce działa ten projekt i dlaczego (podpowiedź: `defaultBrowserType` w opisie urządzenia). W tabeli kodów dopisz piąty zestaw: kod `czarny20` wpisany małymi literami ze spacją na końcu. Zanim uruchomisz test, zapisz, jakiego komunikatu się spodziewasz.

## Artefakt do zabrania

Projekt `telefon` w `playwright.config.ts` i wzorzec testu sterowanego danymi, użyty dwa razy (adres, kody rabatowe): `interface`, tablica zestawów, pętla z nazwą testu zawierającą opis zestawu.

## Rozwiązanie wzorcowe

Gałąź `solution/extra-d1`:
```powershell
git fetch origin
git diff origin/extra/d1-przegladarki-i-dane origin/solution/extra-d1 -- tests/extra/d1 playwright.config.ts
```
