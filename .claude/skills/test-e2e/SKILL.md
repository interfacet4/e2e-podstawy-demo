---
name: test-e2e
description: Pisze test E2E Playwright według zasad z CLAUDE.md. Użyj, gdy użytkownik prosi o nowy test, automatyzację przypadku testowego albo scenariusza.
---

# Test E2E krok po kroku

Wykonaj kroki po kolei i nie pomijaj żadnego. Zasady pisania kodu są w `CLAUDE.md`: przestrzegaj ich w każdym kroku.

## Logowanie: helper z `tests/pomocnicze/logowanie.ts`

Użytkownik prosi, żeby testy logowały się gotowymi funkcjami. To wyjątek od zasady z `CLAUDE.md` „bez funkcji pomocniczych”: dotyczy tylko tych dwóch funkcji, innych helperów nie twórz.

- Logowanie w przeglądarce: `await zaloguj(page);`, potem przejście na stronę testu (`page.goto(...)`), bo funkcja kończy na stronie głównej.
- Logowanie w teście API albo w `beforeEach`/`afterEach` przygotowującym dane: `await zalogujPrzezApi(request);`.
- Import (ścieżka względna od pliku testu): z `tests/cwiczenia/` i `tests/czytanie/` to `import { zaloguj } from '../pomocnicze/logowanie';`. Drugi import jest dodatkowy, `import { test, expect } from '@playwright/test';` zostaje.
- Bez argumentów funkcja loguje konto ze zmiennych `APP_USER`/`APP_PASSWORD`, a gdy ich nie ma, `tester12` / `czarny-piatek-2026`. Wywołuj ją bez argumentów we wszystkich testach, chyba że założenia testu wskazują inne konto (np. `user` albo `admin`) — wtedy podaj je w argumentach.
- Inne konto (np. admin): `await zaloguj(page, 'admin', 'admin123');`. Nie przepisuj ręcznie pól `Login`, `Hasło` i przycisku `Zaloguj`.
- Nie dopisuj po `zaloguj` asercji „Zalogowano jako …”, bo funkcja sama ją sprawdza.

1. **Przeczytaj przypadek testowy.** Wypisz wymaganie zdanie po zdaniu i oczekiwane wartości (liczby, teksty). Jeśli czegoś brakuje albo coś jest niejasne, zapytaj użytkownika, zanim pójdziesz dalej.
2. **Przejdź scenariusz w aplikacji.** Uruchom aplikację (`npm start`, http://localhost:4100) i przejdź scenariusz w przeglądarce skillem `playwright-cli`. Zanotuj prawdziwe nazwy przycisków, etykiety pól i komunikaty. Jeśli aplikacja pokazuje coś innego niż wymaganie, zgłoś to użytkownikowi: to może być błąd.
3. **Pokaż plan i poczekaj na akceptację.** Podaj: nazwę pliku (`tests/cwiczenia/<numer>-<temat>.spec.ts`), nazwę testu, konto i sposób logowania (`zaloguj` / `zalogujPrzezApi`, z argumentami czy bez), dane do przygotowania i posprzątania, kroki z lokatorami oraz asercje z wartościami z wymagania. Nie pisz kodu, dopóki użytkownik nie zaakceptuje planu.
4. **Napisz test.** Trzymaj się zaakceptowanego planu i zasad z `CLAUDE.md`. Logowanie pisz helperem (sekcja wyżej). Po zapisaniu uruchom `npm run typecheck`.
5. **Uruchom test dwa razy.** Uruchom `npx playwright test <plik> --repeat-each=2`. Oba przebiegi mają przejść. Jeśli drugi pada, test nie sprząta po sobie: popraw go.
6. **Pokaż, że test potrafi paść.** Zmień na chwilę oczekiwaną wartość z wymagania (np. liczbę albo tekst), uruchom test i pokaż `failed`. Przywróć wartość. Potem zrób tymczasową kopię testu bez głównej akcji (np. kliknięcia), zamień w niej `expect` na `expect.soft`, uruchom ją i pokaż, że padła każda asercja, nie tylko pierwsza. Usuń kopię i uruchom test jeszcze raz: ma być `passed`.
7. **Przejdź listę kontrolną.** Sprawdź test pytaniami z `docs/lista-kontrolna-review.md`. Na pytania 3 i 12 odpowiedz osobno dla każdej asercji. Pokaż tabelę: numer pytania, tak/nie, numer linii i powód przy każdym „nie”. Każde „nie” popraw i wróć do kroku 5.

Na koniec podaj polecenie, którym użytkownik sam uruchomi test, i wyniki z kroków 5–7 (liczby `passed`/`failed`), bez zapewnień typu „jestem pewien”.
