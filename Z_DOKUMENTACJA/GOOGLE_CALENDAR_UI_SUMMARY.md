# Google Calendar Integration - Frontend Implementation Summary

## Zaimplementowane komponenty UI

### 1. GoogleCalendarPopup Component
**Lokalizacja:** `FRONTEND/src/STUDIO/components_STUDIO/Dashboard/Calendar/GoogleCalendarPopup.jsx`

**Funkcjonalność:**
- **Jedna główna ikonka** przy nazwie miesiąca, która zarządza synchronizacją **wszystkich stron użytkownika**
- Multi-tenant approach: jedna ikonka obsługuje wiele stron jednocześnie
- Mini popup z listą wszystkich stron i ich statusami synchronizacji
- Każda strona może być niezależnie połączona z Google Calendar
- Przycisk "Synchronizuj wszystkie kalendarze" - jednoczesna synchronizacja wszystkich połączonych stron

**Dla każdej strony:**
- Przycisk "Połącz z Google Calendar" gdy nie ma aktywnej integracji
- Panel zarządzania gdy jest połączona:
  - Wyświetlanie emaila Google
  - Status synchronizacji (aktywna/wstrzymana)
  - Data ostatniej synchronizacji
  - Przyciski: Wstrzymaj/Wznów, Sync, Odłącz

**Stany głównej ikonki:**
- 🟢 Zielona - przynajmniej jedna strona połączona
- ⚪ Szara - żadna strona nie jest połączona

**UI Details:**
- Licznik połączeń: "X z Y połączonych" w nagłówku popupa
- Lista stron z wizualnym wskaźnikiem statusu (CheckCircle/Cancel)
- Kompaktowe karty dla każdej strony z osobnymi akcjami
- Maksymalna wysokość: 80vh z scroll dla wielu stron

### 2. GoogleCalendarCallback Page
**Lokalizacja:** `FRONTEND/src/STUDIO/pages/Auth/GoogleCalendarCallback.jsx`

**Funkcjonalność:**
- Obsługuje redirect z Google OAuth
- Pokazuje loading podczas wymiany tokenu
- Wyświetla sukces z animacją ✓
- Wyświetla błąd jeśli coś pójdzie nie tak
- Automatycznie przekierowuje do kalendarza po sukcesie (2s delay)

### 3. Integracja z CalendarGridControlled
**Lokalizacja:** `FRONTEND/src/STUDIO/components_STUDIO/Dashboard/Calendar/CalendarGridControlled.jsx`

**Zmiany:**
- Import komponentu GoogleCalendarPopup
- Dodanie ikonki **przy nazwie miesiąca** (obok "MMMM YYYY")
- Przekazywanie props `sites` (array) zamiast pojedynczego `siteId`
- Ikonka zawsze widoczna, niezależnie od selectedSiteId

**Architektura:**
- Centralized multi-tenant approach: jedna ikonka obsługuje wszystkie strony
- Użytkownik widzi agregowany status (liczba połączonych stron)
- Zarządzanie synchronizacją dla każdej strony osobno w popupie
- Możliwość masowej synchronizacji wszystkich kalendarzy jednym kliknięciem

## Routing

**Nowa trasa:** `/studio/auth/google/callback`
- Typ: PUBLIC (nie wymaga autoryzacji, ale używa tokena z localStorage)
- Handler: GoogleCalendarCallback
- Dodana w: `FRONTEND/src/STUDIO/routes.jsx`

## API Integration

Wszystkie endpointy używają:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const token = localStorage.getItem('access_token');
```

**Używane endpointy:**
- `GET /sites/{siteId}/google-calendar/status/` - sprawdzenie statusu
- `GET /sites/{siteId}/google-calendar/connect/` - inicjalizacja OAuth
- `POST /sites/{siteId}/google-calendar/callback/` - finalizacja OAuth
- `POST /sites/{siteId}/google-calendar/disconnect/` - odłączenie
- `POST /sites/{siteId}/google-calendar/toggle-sync/` - włącz/wyłącz sync
- `POST /sites/{siteId}/google-calendar/manual-sync/` - ręczna synchronizacja

## UX Flow

### Pierwszy kontakt (brak połączeń):
1. Użytkownik widzi szarą ikonkę Google Calendar obok nazwy miesiąca
2. Klika na ikonkę → otwiera się popup z listą wszystkich jego stron
3. Przy każdej stronie widzi przycisk "Połącz z Google Calendar"
4. Klika przycisk przy wybranej stronie → przekierowanie do Google OAuth
5. Autoryzuje dostęp w Google
6. Wraca do aplikacji → strona callback
7. Widzi animowany sukces ✓
8. Automatyczne przekierowanie do kalendarza
9. Ikonka staje się zielona (jeśli to pierwsze połączenie)

### Zarządzanie synchronizacją (po połączeniu):
1. Użytkownik widzi zieloną ikonkę
2. Klika → popup ze szczegółami wszystkich stron
3. Nagłówek pokazuje: "X z Y połączonych"
4. Dla każdej strony widzi:
   - Status połączenia (✓ zielone / ✗ szare)
   - Email Google (dla połączonych)
   - Data ostatniej synchronizacji
   - Przyciski akcji: Wstrzymaj/Wznów, Sync, Odłącz
5. Na górze popupa: przycisk "Synchronizuj wszystkie kalendarze"
   - Jednoczesnie synchronizuje wszystkie aktywne strony
   - Pokazuje progress i podsumowanie

### Połączenie kolejnej strony:
1. W popupie przewija do niepołączonej strony
2. Klika "Połącz z Google Calendar" przy tej stronie
3. Proces OAuth (może użyć tego samego konta Google)
4. Po powrocie - strona automatycznie dodana do synchronizacji

## Styling

**Kolory:**
- Success (połączone): `success.main` (zielony)
- Default (niepołączone): `text.secondary` (szary)
- Error: `error.main` (czerwony)

**Animacje:**
- Hover na ikonce: scale(1.1)
- Popup: fade in/out z Framer Motion
- Success icon: spring animation
- Loading: CircularProgress

**Responsywność:**
- Popup dostosowuje się do rozmiaru ekranu
- Minimalana szerokość: 320px
- Maksymalna szerokość: 400px
- Padding i spacing skalują się responsywnie

## Konfiguracja wymagana

### Backend (.env):
```env
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/studio/auth/google/callback
```

### Google Cloud Console:
1. Włącz Google Calendar API
2. Skonfiguruj OAuth consent screen
3. Utwórz OAuth 2.0 credentials
4. Dodaj Authorized redirect URI: `http://localhost:3000/studio/auth/google/callback`

## Testowanie

### Lokalne testowanie:
1. Upewnij się że backend działa
2. Ustaw prawidłowe zmienne środowiskowe
3. W Google Cloud Console dodaj siebie jako Test User
4. Przejdź do kalendarza w Studio
5. Kliknij ikonkę Google Calendar
6. Postępuj zgodnie z krokami OAuth
7. Sprawdź czy wydarzenie dodane w aplikacji pojawia się w Google Calendar

### Możliwe błędy:
- "Redirect URI mismatch" → sprawdź konfigurację w Google Cloud Console
- "Authorization denied" → sprawdź czy użytkownik jest dodany jako Test User
- "Failed to connect" → sprawdź logi backendu i poprawność tokenów
- Ikonka nie pojawia się → sprawdź czy selectedSiteId jest przekazywane do komponentu

## Przyszłe usprawnienia

- [ ] Dodać wskaźnik "syncing" podczas automatycznej synchronizacji
- [ ] Dodać historię synchronizacji w popup
- [ ] Dodać możliwość wyboru konkretnego kalendarza (nie tylko primary)
- [ ] Dodać notification gdy synchronizacja się nie powiedzie
- [ ] Dodać badge z liczbą zsynchronizowanych wydarzeń
- [ ] Dodać możliwość synchronizacji pojedynczego wydarzenia
