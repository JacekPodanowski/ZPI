# Google Calendar Integration System

## Overview

System integracji z Google Calendar umożliwia użytkownikom z odpowiednimi uprawnieniami automatyczną synchronizację wydarzeń z kalendarza YourEasySite do ich osobistego kalendarza Google. Każda zmiana w wydarzeniach (dodanie, edycja, usunięcie) jest automatycznie odzwierciedlana w Google Calendar.

## Architektura

### Modele

#### GoogleCalendarIntegration
Przechowuje dane OAuth i ustawienia synchronizacji dla każdego Site:
- `site` - OneToOne relacja z Site
- `connected_by` - użytkownik, który połączył konto
- `google_email` - email konta Google
- `access_token` / `refresh_token` - tokeny OAuth2
- `calendar_id` - ID kalendarza Google (zazwyczaj email)
- `is_active` - czy integracja jest aktywna
- `sync_enabled` - czy synchronizacja jest włączona
- `last_sync_at` - timestamp ostatniej synchronizacji

#### GoogleCalendarEvent
Mapuje lokalne Event na eventy w Google Calendar:
- `event` - OneToOne z Event
- `integration` - ForeignKey do GoogleCalendarIntegration
- `google_event_id` - ID eventu w Google Calendar
- `last_synced_at` - timestamp ostatniej synchronizacji

### Serwis Synchronizacji

`google_calendar_service.py` zawiera główną logikę:

#### GoogleCalendarService
- `get_authorization_url(state)` - generuje URL do OAuth flow
- `exchange_code_for_tokens(code)` - wymienia kod na tokeny
- `get_credentials(integration)` - pobiera i odświeża tokeny
- `create_event(integration, event)` - tworzy event w Google Calendar
- `update_event(integration, event)` - aktualizuje event
- `delete_event(integration, event)` - usuwa event
- `sync_all_events(integration)` - synchronizuje wszystkie eventy

### Sygnały Django

W `signals.py`:
- `sync_event_to_google_calendar_on_save` - automatycznie synchronizuje przy zapisie Event
- `sync_event_to_google_calendar_on_delete` - automatycznie usuwa z Google Calendar

### API Endpoints

```
GET    /api/v1/sites/{site_id}/google-calendar/connect/        # Rozpocznij OAuth flow
POST   /api/v1/sites/{site_id}/google-calendar/callback/      # Obsłuż callback OAuth
GET    /api/v1/sites/{site_id}/google-calendar/status/        # Status integracji
POST   /api/v1/sites/{site_id}/google-calendar/disconnect/    # Odłącz integrację
POST   /api/v1/sites/{site_id}/google-calendar/toggle-sync/   # Włącz/wyłącz sync
POST   /api/v1/sites/{site_id}/google-calendar/manual-sync/   # Ręczna pełna synchronizacja
```

## Konfiguracja Google Cloud Console

### 1. Utwórz Projekt w Google Cloud Console
1. Przejdź do https://console.cloud.google.com/
2. Utwórz nowy projekt lub wybierz istniejący
3. Włącz Google Calendar API:
   - Przejdź do "APIs & Services" > "Library"
   - Wyszukaj "Google Calendar API"
   - Kliknij "Enable"

### 2. Skonfiguruj OAuth Consent Screen
1. Przejdź do "APIs & Services" > "OAuth consent screen"
2. Wybierz typ użytkownika (External dla publicznej aplikacji)
3. Wypełnij wymagane pola:
   - **App name**: YourEasySite
   - **User support email**: Twój email
   - **Developer contact information**: Twój email
4. Dodaj scopes:
   - `.../auth/calendar` - Pełny dostęp do kalendarza
5. Dodaj Test Users (dla trybu testowego):
   - Dodaj emaile użytkowników, którzy będą testować integrację

### 3. Utwórz OAuth 2.0 Credentials
1. Przejdź do "APIs & Services" > "Credentials"
2. Kliknij "Create Credentials" > "OAuth client ID"
3. Wybierz "Web application"
4. Wypełnij:
   - **Name**: YourEasySite Calendar Integration
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://youreasysite.pl` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/studio/auth/google/callback` (development)
     - `https://youreasysite.pl/studio/auth/google/callback` (production)
5. Zapisz Client ID i Client Secret

### 4. Ustaw Zmienne Środowiskowe

Dodaj do `.env`:
```env
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/studio/auth/google/callback
```

W produkcji:
```env
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=https://youreasysite.pl/studio/auth/google/callback
```

## Flow Użycia

### 1. Połączenie Kalendarza
```javascript
// Frontend wywołuje endpoint connect
const response = await fetch(`/api/v1/sites/${siteId}/google-calendar/connect/`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { authorization_url } = await response.json();

// Przekieruj użytkownika do authorization_url
window.location.href = authorization_url;
```

### 2. Callback OAuth
```javascript
// Po autoryzacji Google przekierowuje do redirect_uri z code i state
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

// Wyślij code do backendu
await fetch(`/api/v1/sites/${siteId}/google-calendar/callback/`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ code, state })
});

// Backend automatycznie synchronizuje wszystkie istniejące eventy
```

### 3. Automatyczna Synchronizacja
Po połączeniu, każda zmiana w Event jest automatycznie synchronizowana:
- Tworzenie nowego Event → tworzy event w Google Calendar
- Edycja Event → aktualizuje event w Google Calendar
- Usunięcie Event → usuwa event z Google Calendar

### 4. Zarządzanie Integracją
```javascript
// Sprawdź status
const status = await fetch(`/api/v1/sites/${siteId}/google-calendar/status/`);

// Włącz/wyłącz synchronizację
await fetch(`/api/v1/sites/${siteId}/google-calendar/toggle-sync/`, {
  method: 'POST'
});

// Ręczna synchronizacja wszystkich eventów
await fetch(`/api/v1/sites/${siteId}/google-calendar/manual-sync/`, {
  method: 'POST'
});

// Odłącz integrację
await fetch(`/api/v1/sites/${siteId}/google-calendar/disconnect/`, {
  method: 'POST'
});
```

## Uprawnienia

Aby połączyć kalendarz, użytkownik musi mieć uprawnienia do zarządzania Site:
- Być właścicielem Site (`site.owner`)
- LUB mieć rolę team member z odpowiednimi uprawnieniami

Sprawdzane przez `HasSitePermission().has_site_permission(user, site)`

## Format Eventu w Google Calendar

Event w Google Calendar zawiera:
- **Tytuł**: Tytuł eventu z YourEasySite
- **Opis**: 
  - Opis eventu
  - Host/Przypisana osoba
  - Typ (Individual/Group)
  - Capacity
  - Liczba uczestników
- **Czas**: Start i end time z eventu
- **Attendees**: 
  - Przypisana osoba (host)
  - Zarezerwowani klienci
- **Przypomnienia**:
  - Email 24h przed
  - Popup 1h przed

## Obsługa Błędów

Serwis loguje wszystkie błędy, ale nie przerywa działania aplikacji:
- Błędy OAuth są logowane i zwracane użytkownikowi
- Błędy synchronizacji są logowane, ale nie blokują zapisywania Event
- Tokeny są automatycznie odświeżane gdy wygasną

## Bezpieczeństwo

- Tokeny są przechowywane w bazie danych (zalecane jest szyfrowanie w produkcji)
- OAuth flow używa state parameter dla CSRF protection
- Tylko użytkownicy z odpowiednimi uprawnieniami mogą zarządzać integracją
- Refresh token jest używany do automatycznego odświeżania access token

## Testowanie

### Lokalne Testowanie
1. Ustaw zmienne środowiskowe w `.env`
2. Uruchom migracje: `docker-compose exec backend python manage.py migrate`
3. W Google Cloud Console dodaj swój email jako Test User
4. Użyj `http://localhost:3000` jako redirect URI

### Produkcja
1. Zmień OAuth consent screen na "Production"
2. Zaktualizuj redirect URI na produkcyjny URL
3. Dodaj zmienne środowiskowe na serwerze produkcyjnym

## Migracja

Utworzono nowe migracje dla modeli:
- `GoogleCalendarIntegration`
- `GoogleCalendarEvent`

Uruchom:
```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

## TODO / Przyszłe Usprawnienia

- [ ] Szyfrowanie tokenów w bazie danych
- [ ] Sync dwukierunkowy (Google Calendar → YourEasySite)
- [ ] Wybór konkretnego kalendarza (zamiast primary)
- [ ] Synchronizacja AvailabilityBlock jako "busy" time
- [ ] Batch sync dla lepszej wydajności
- [ ] Webhook od Google dla real-time updates
