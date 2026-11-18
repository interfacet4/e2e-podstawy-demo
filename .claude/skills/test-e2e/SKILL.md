---
name: test-e2e
description: Pisze test E2E Playwright według zasad z CLAUDE.md. Użyj, gdy użytkownik prosi o nowy test, automatyzację przypadku testowego albo scenariusza.
---

# Test E2E krok po kroku

Wykonaj kroki po kolei i nie pomijaj żadnego. Zasady pisania kodu są w `CLAUDE.md`: przestrzegaj ich w każdym kroku.

1. **Przeczytaj przypadek testowy.** Wypisz wymaganie zdanie po zdaniu i oczekiwane wartości (liczby, teksty). Jeśli czegoś brakuje albo coś jest niejasne, zapytaj użytkownika, zanim pójdziesz dalej.
2. **Przejdź scenariusz w aplikacji.** Uruchom aplikację (`npm start`, http://localhost:4100) i przejdź scenariusz w przeglądarce skillem `playwright-cli`. Zanotuj prawdziwe nazwy przycisków, etykiety pól i komunikaty. Jeśli aplikacja pokazuje coś innego niż wymaganie, zgłoś to użytkownikowi: to może być błąd.
3. **Pokaż plan i poczekaj na akceptację.** Podaj: nazwę pliku (`tests/cwiczenia/<numer>-<temat>.spec.ts`), nazwę testu, konto, dane do przygotowania i posprzątania, kroki z lokatorami oraz asercje z wartościami z wymagania. Nie pisz kodu, dopóki użytkownik nie zaakceptuje planu.
4. **Napisz test.** Trzymaj się zaakceptowanego planu i zasad z `CLAUDE.md`. Po zapisaniu uruchom `npm run typecheck`.
5. **Uruchom test dwa razy.** Uruchom `npx playwright test <plik> --repeat-each=2`. Oba przebiegi mają przejść. Jeśli drugi pada, test nie sprząta po sobie: popraw go.
6. **Pokaż, że test potrafi paść.** Zmień na chwilę oczekiwaną wartość z wymagania (np. liczbę albo tekst), uruchom test i pokaż `failed`. Przywróć wartość. Potem zrób tymczasową kopię testu bez głównej akcji (np. kliknięcia), zamień w niej `expect` na `expect.soft`, uruchom ją i pokaż, że padła każda asercja, nie tylko pierwsza. Usuń kopię i uruchom test jeszcze raz: ma być `passed`.
7. **Przejdź listę kontrolną.** Sprawdź test pytaniami z `docs/lista-kontrolna-review.md`. Na pytania 3 i 12 odpowiedz osobno dla każdej asercji. Pokaż tabelę: numer pytania, tak/nie, numer linii i powód przy każdym „nie”. Każde „nie” popraw i wróć do kroku 5.

Na koniec podaj polecenie, którym użytkownik sam uruchomi test, i wyniki z kroków 5–7 (liczby `passed`/`failed`), bez zapewnień typu „jestem pewien”.
