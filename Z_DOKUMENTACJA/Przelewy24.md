Przelewy24 w Django + React - Kroki bez kodu
📋 KROK 1: Rejestracja i konfiguracja

Załóż konto testowe na przelewy24.pl (sandbox)
Pobierz dane dostępowe: Merchant ID, POS ID, CRC Key
Dodaj te dane do Django settings lub zmiennych środowiskowych
Zainstaluj bibliotekę requests w Django (do komunikacji z API P24)


🔧 KROK 2: Backend Django - endpointy API
Musisz stworzyć 3 endpointy:
A) POST /api/payments/create/

Przyjmuje: kwotę, ID zamówienia, opis, email klienta
Generuje podpis SHA-384 (wymagany przez P24)
Wysyła request do API Przelewy24 żeby zarejestrować transakcję
Otrzymuje token płatności
Zwraca URL do przekierowania (https://sandbox.przelewy24.pl/trnRequest/{token})

B) POST /api/payments/webhook/

Odbiera powiadomienie od Przelewy24 o statusie płatności
Weryfikuje podpis (bezpieczeństwo!)
Wysyła request weryfikacyjny do P24 (potwierdzenie)
Aktualizuje status zamówienia w bazie danych
Zwraca "OK" do P24

C) GET /api/payments/status/<order_id>/

Sprawdza status płatności w bazie danych
Zwraca informację czy płatność została zakończona
Używane przez frontend po powrocie z P24


💾 KROK 3: Model w Django
Stwórz model do przechowywania transakcji:

ID zamówienia (session_id)
Kwota
Status (pending/completed/failed)
Token płatności
Data utworzenia
Data aktualizacji


⚛️ KROK 4: Frontend React - strony
Musisz mieć 3 strony/komponenty:
A) Strona koszyka/checkout

Przycisk "Zapłać przez Przelewy24"
Po kliknięciu: wysyła POST do /api/payments/create/
Otrzymuje URL płatności
Przekierowuje użytkownika (window.location.href = paymentUrl)

B) Strona sukcesu /payment/success

Użytkownik wraca tu po płatności
Pobiera ID zamówienia z URL (query params)
Wysyła GET do /api/payments/status/<order_id>/
Wyświetla status: sukces/oczekiwanie/błąd

C) Strona błędu /payment/failed (opcjonalnie)

Gdy użytkownik anuluje płatność
Możliwość powrotu do koszyka


🔄 KROK 5: Przepływ procesu
Normalny proces płatności:

Użytkownik klika "Zapłać" w React
React → Django: POST do /api/payments/create/
Django → Przelewy24: rejestracja transakcji
Django → React: zwraca URL płatności
React przekierowuje do Przelewy24
Użytkownik płaci na stronie P24
P24 → Django: webhook z potwierdzeniem (w tle)
Django weryfikuje i aktualizuje status w bazie
P24 → React: przekierowanie na /payment/success
React → Django: sprawdza status
React wyświetla potwierdzenie


🧪 KROK 6: Testowanie
Testy manualne w sandbox:

Test podstawowy:

Utwórz transakcję testową (np. 100 zł)
Kliknij "Zapłać"
Sprawdź czy przekierowanie działa
W sandboxie P24 wybierz bank testowy
Zaloguj się dowolnymi danymi
Potwierdź płatność
Sprawdź czy wraca na /payment/success
Sprawdź czy status w bazie to "completed"


Test karty kredytowej:

Użyj testowej karty: 4111 1111 1111 1111
CVV: 123, data: przyszła
Potwierdź płatność


Test anulowania:

Rozpocznij płatność
Anuluj w P24
Sprawdź czy status = "failed"


Test webhooków:

Użyj ngrok lub podobnego narzędzia do tunelowania (żeby P24 mogło wysłać webhook do lokalnego Django)
Sprawdź logi Django czy webhook przychodzi
Sprawdź czy podpis się weryfikuje
Sprawdź czy status się aktualizuje



Testy automatyczne (opcjonalnie):

Test jednostkowy generowania podpisu
Test mocka API Przelewy24
Test walidacji webhooków
Test aktualizacji statusu w bazie

Narzędzia pomocnicze:

ngrok - tunelowanie localhost dla webhooków
Postman - testowanie endpointów API
Django Admin - sprawdzanie statusów transakcji
Panel P24 sandbox - sprawdzanie transakcji po stronie P24


⚠️ WAŻNE - Bezpieczeństwo:

NIGDY nie przechowuj CRC Key w React - tylko w Django!
Zawsze weryfikuj podpis w webhookach
Zawsze wysyłaj request weryfikacyjny do P24 po otrzymaniu webhooka
Używaj HTTPS w produkcji
Kwoty zawsze w groszach (100 zł = 10000)
Loguj wszystkie transakcje


📝 Checklist przed wdrożeniem:

 Konto produkcyjne P24 utworzone
 Dane produkcyjne w Django (zmień URL z sandbox na produkcyjny)
 Webhook działa (sprawdź w panelu P24)
 URL powrotu poprawnie skonfigurowany
 Testy wszystkich scenariuszy przeszły
 HTTPS włączone
 Logi transakcji działają
 Obsługa błędów zaimplementowana


Potrzebujesz wyjaśnienia któregoś kroku bardziej szczegółowo?