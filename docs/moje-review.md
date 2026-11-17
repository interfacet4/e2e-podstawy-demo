# Moje review

## Ćwiczenie 08: poprawki do planu

Plan: `tests/cwiczenia/08-zmiana-adresu.spec.ts`, przypadki TC-ADR-01 i TC-ADR-02 (`docs/scenariusze/zmiana-adresu.md` i `.feature`).

### Oczekiwane wyniki i punkty planu, które je sprawdzają

| Wynik | Oczekiwany wynik | Punkt planu |
|---|---|---|
| TC-ADR-01 / 1 | W nagłówku „Zalogowano jako user (user)” | `beforeEach`: asercja tekstu po zalogowaniu |
| TC-ADR-01 / 2 | Nagłówek „Zmiana adresu dostawy”, pola z adresem startowym | `beforeEach`: nagłówek; test 1: asercja startowa na 4 polach |
| TC-ADR-01 / 3 | Pola pokazują wpisane wartości | test 1: `toHaveValue` po wpisaniu |
| TC-ADR-01 / 4 | Komunikat „Zapisano adres dostawy.” | test 1: `status` z dokładnym tekstem |
| TC-ADR-01 / 5 | Po odświeżeniu pola mają nowy adres | test 1: `reload()` i 4 pola |
| TC-ADR-02 / 1 | Formularz z adresem startowym | **brak w testach 2–4**: poprawka 1 |
| TC-ADR-02 / 3 | „Popraw błędy w formularzu (1).”, komunikat pod polem, brak „Zapisano adres dostawy.” | testy 2–4: `alert`, tekst pod polem, `not.toBeVisible` |
| TC-ADR-02 / 4 | Po ponownym otwarciu kod pocztowy nadal `00-001` | testy 2–4: ponowne otwarcie „Adres dostawy” i 4 pola |
| Gherkin, Przykłady | Telefon `12345`, puste Miasto | testy 3 i 4 (TC-ADR-02 ich nie ma, Gherkin tak) |

Trzy rzeczy z treści ćwiczenia:
- Przywrócenie adresu startowego: tak, `afterEach` z asercją, że zapis się udał.
- Sprawdzenie, że błędny adres się nie zapisał: tak, po ponownym otwarciu strony, a nie zaraz po kliknięciu. Formularz po błędzie pokazuje błędną wartość, więc sprawdzenie od razu nic by nie dało (lista kontrolna, pkt 3).
- Konto `user`: tak, we wszystkich testach (pkt 10).

### Poprawki

1. **Testy 2–4: dodać asercję stanu startowego przed wpisaniem błędnej wartości** (TC-ADR-02, krok 1; lista kontrolna, pkt 11). Bez niej, gdy baza jest „brudna”, końcowa asercja „adres startowy” padnie z mylącym powodem. Najprościej przenieść asercję na 4 pola z testu 1 do `beforeEach`.
2. **Testy 2–4: zachować kolejność asercji: najpierw `alert`, potem `not.toBeVisible()` dla „Zapisano adres dostawy.”** (pkt 3 i 13). Asercja `not` sprawdzona przed odpowiedzią serwera przeszłaby od razu, bo na starej stronie też nie ma tego komunikatu. Asercja na `alert` czeka, aż strona po zapisie się wczyta. Tekst „Zapisano adres dostawy.” istnieje w aplikacji (sprawdzony przez MCP), więc asercja `not` ma sens.
3. **Komunikaty: dokładny tekst, nie fragment** (pkt 5). `toHaveText` na `alert` i `status`, a komunikat pod polem przez `getByText('…', { exact: true })`. Teksty przepisać z przypadku testowego, nie ze strony (pkt 15). Zgadzają się znak po znaku.
4. **Link w menu: `getByRole('link', { name: 'Adres dostawy', exact: true })`** (pkt 7). W menu jest też „Moje adresy”, więc lepiej nie polegać na dopasowaniu fragmentu.
5. **Nazwy testów 2–4 z nazwą pola i wartością**, np. „błędna wartość „31001” w polu Kod pocztowy blokuje zapis adresu” (pkt 1). W raporcie od razu widać, który wiersz tabeli Przykłady padł.
6. **Dopisać do planu krok weryfikacji, że test potrafi paść** (pkt 12): na chwilę zmienić w teście 1 oczekiwane Miasto po odświeżeniu na „Gdańsk”, a w teście 2 oczekiwany kod po ponownym otwarciu na `31001`. Oczekiwany wynik: `failed`. Potem przywrócić.
7. **Uruchomić plik dwa razy pod rząd** (pkt 9). Oczekiwany wynik: za każdym razem `4 passed`, a po teście pole Miasto ma wartość „Warszawa”.

## Ćwiczenie 08: porównanie formatów TC-FV-01 (krok 6)

`docs/scenariusze/biuro-mikolaja.md` (Azure Test Plans) i `docs/scenariusze/biuro-mikolaja.feature` (Gherkin). Numery linii z pliku `.feature`.

| Krok w Azure Test Plans | Linia w Gherkinie | Różnica |
|---|---|---|
| Warunki wstępne: konta, pusty koszyk, nie ruszać ZAM-1007 | 5, 9 | Gherkin nie wymienia konta `admin` / `admin123` |
| 1. Zaloguj się jako `@klient` → „Zalogowano jako biuro (user)” | 8 | Gherkin: brak oczekiwanego wyniku (napisu w nagłówku) |
| 2. Karta produktu, „Ilość” 10, „Dodaj do koszyka” → „Dodano do koszyka: Kalendarz adwentowy 2026” | 12 | Gherkin: brak komunikatu, nie mówi, że ilość wpisuje się w pole „Ilość” |
| 3. Koszyk → jedna pozycja, ilość 10, „Pozycji: 1, razem: 399,90 zł” | brak | Gherkin w ogóle nie sprawdza koszyka przed złożeniem zamówienia |
| 4. „Faktura na firmę”, NIP, firma, „Złóż zamówienie…” → „Złożono zamówienie: ZAM-…”, zapisz numer | 13–17 | brak (Gherkin: `<numer>` zamiast „zapisz numer”) |
| 5. Numer na liście „Moje zamówienia” → „Nowe”, „Faktura na firmę: Biuro Mikołaja, NIP 2412241228”, „Pobierz fakturę” | 18 | Gherkin: brak nazwy firmy na stronie zamówienia i przycisku „Pobierz fakturę”; nie mówi, jak dojść do strony zamówienia |
| 6. Wyloguj, admin, `/admin/zamowienia/<numer>` → „Nowe”, pole „Status zamówienia” | 19 | Gherkin łączy kroki 6–8 w jedno zdanie: bez logowania admina, bez adresu strony, bez sprawdzenia statusu „Nowe” w panelu |
| 7. „Opłacone”, „Zapisz status” → „Opłacone” | 19 | Gherkin: brak sprawdzenia statusu pośredniego „Opłacone” |
| 8. „Wysłane”, „Zapisz status” → „Wysłane” | 19 | Gherkin nie sprawdza statusu w panelu admina, tylko później u klienta (linia 20) |
| 9. Wyloguj, `@klient`, zamówienie → „Wysłane” | 20 | Gherkin: brak wylogowania admina i ponownego logowania klienta |
| 10. „Pobierz fakturę” → plik `faktura-<numer>.html`, NIP nabywcy, nabywca, pozycja, „Razem do zapłaty” | 21–27 | Gherkin: brak nabywcy „Biuro Mikołaja” w fakturze |
| Po teście: status „Wysłane”, zamówienie zostaje, reset przez `npm run db:reset` | brak | Gherkin nie mówi, co zostaje w bazie po teście |

**Czego brakuje w Gherkinie:** oczekiwanych wyników kroków 1–3 (logowanie, komunikat dodania, cały koszyk), sprawdzenia statusów „Nowe” i „Opłacone” w panelu admina, nazwy firmy na stronie zamówienia i w fakturze, przycisku „Pobierz fakturę”, konta admina i informacji o stanie po teście.

**Czego brakuje w krokach Azure Test Plans:**
- opisu celu biznesowego, czyli kto i po co to robi (linie 2–4: „Klient firmowy… zamawia kalendarze na fakturę”);
- pozycji faktury w tabeli z nazwanymi kolumnami (linie 25–26: Nazwa, Ilość, Cena, Wartość). W kroku 10 wartości są zapisane jednym zdaniem i nie wiadomo, w której kolumnie faktury ma być „10”, a w której „39,99 zł”;
- jawnego powiązania z zamówieniem z kroku 4 przez `<numer>` w linii 17 i 22. W Azure to luźne „zapisz numer” i „zamówienie z kroku 4”.

**Wniosek:** test piszemy z Azure Test Plans (więcej oczekiwanych wyników), a z Gherkina bierzemy sprawdzenie pozycji faktury kolumna po kolumnie.
