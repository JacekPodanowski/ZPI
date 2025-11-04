# Magic Link Passwordless Authentication

## Przegląd Systemu
Uwierzytelnianie bez hasła za pomocą magic linków pozwala użytkownikom logować się jednym kliknięciem w link wysłany na email. System eliminuje potrzebę zapamiętywania haseł i zwiększa bezpieczeństwo.

## Przepływ Użytkownika
1. Użytkownik klika "Zaloguj się bez hasła (magiczny link)"
2. Podaje swój adres email
3. System wysyła email z jednorazowym linkiem logowania
4. Użytkownik klika link w emailu
5. Jest automatycznie zalogowany i przekierowany do panelu

## System Wysyłania Email

### Infrastruktura Email
**Backend Email:** Django używa `django.core.mail` do wysyłania emaili

**Konfiguracja w `settings.py`:**
```python
# Development - wyświetla emaile w konsoli
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Production - wysyła przez SMTP
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # lub inny provider
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = 'noreply@youreasysite.com'
```

### Proces Wysyłania Magic Link

**1. Request Magic Link (`RequestMagicLinkView`):**
```python
# Użytkownik wysyła POST /api/v1/auth/magic-link/request/ z emailem
# Backend:
1. Waliduje email i sprawdza czy użytkownik istnieje
2. Generuje token: get_random_string(64) - kryptograficznie bezpieczny
3. Tworzy rekord MagicLink w bazie z tokenem i czasem wygaśnięcia
4. Buduje URL: f"{FRONTEND_URL}/studio/magic-login/{token}"
5. Renderuje szablon HTML: 'emails/magic_link_login.html'
6. Wysyła email przez send_mail()
```

**2. Szablon Email (`templates/emails/magic_link_login.html`):**
- **HTML Email** z profesjonalnym designem
- **Główny CTA Button** - duży, wyraźny przycisk "Sign In to Your Account"
- **Kontekst:**
  - `user` - obiekt użytkownika (imię, email)
  - `magic_link_url` - pełny URL do weryfikacji
  - `expiry_minutes` - czas ważności (15 minut)
- **Elementy bezpieczeństwa:**
  - Ostrzeżenie o czasie wygaśnięcia
  - Info że link jest jednorazowy
  - Fallback link do copy-paste
  - Nota o ignorowaniu jeśli nie zamawiano

**3. Email Content:**
```html
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 600px;">
  <h1 style="color: rgb(146, 0, 32);">🔑 Magic Login Link</h1>
  <p>Hello {{ user.first_name }},</p>
  <p>Click the button below to log in instantly:</p>
  
  <a href="{{ magic_link_url }}" style="
    display: inline-block;
    padding: 14px 32px;
    background: rgb(146, 0, 32);
    color: white;
    text-decoration: none;
    border-radius: 6px;
  ">Sign In to Your Account</a>
  
  <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
    <strong>⏱️ This link expires in {{ expiry_minutes }} minutes</strong>
    <br>Can only be used once.
  </div>
  
  <p>If button doesn't work, copy this link:</p>
  <div style="background: #f9f9f9; padding: 10px;">
    {{ magic_link_url }}
  </div>
  
  <p>If you didn't request this, ignore this email.</p>
</body>
</html>
```

### Weryfikacja Email
**1. Kliknięcie Linku:**
- URL: `http://localhost:3000/studio/magic-login/{token}`
- React router otwiera `MagicLoginPage.jsx`

**2. Weryfikacja Tokenu (`VerifyMagicLinkView`):**
```python
# Frontend wysyła POST /api/v1/auth/magic-link/verify/ z tokenem
# Backend:
1. Szuka tokenu w bazie danych
2. Sprawdza czy ważny (not used && not expired)
3. Oznacza jako użyty (used=True, used_at=now())
4. Generuje JWT tokens (access + refresh)
5. Zwraca tokeny do frontendu
```

**3. Auto-login:**
- Frontend zapisuje tokeny do localStorage
- Wywołuje `refresh()` aby załadować dane użytkownika
- Przekierowuje do `/studio/sites` po 2 sekundach

## Architektura Techniczna

### Backend (Django)

**Model Bazy Danych:**
```python
class MagicLink(models.Model):
    email = EmailField()           # Email użytkownika
    token = CharField(64, unique)  # Kryptograficzny token
    created_at = DateTimeField()   # Kiedy utworzono
    expires_at = DateTimeField()   # Kiedy wygasa (created + 15min)
    used = BooleanField()          # Czy użyty
    used_at = DateTimeField()      # Kiedy użyty
```

**API Endpoints:**
- `POST /api/v1/auth/magic-link/request/` - Wysyła magic link
- `POST /api/v1/auth/magic-link/verify/` - Weryfikuje token i loguje

### Frontend (React)

**Komponenty:**
- `LoginPage.jsx` - Tryb 'magic' dla żądania linku
- `MagicLoginPage.jsx` - Strona weryfikacji tokenu
- `authService.js` - Metody `requestMagicLink()` i `verifyMagicLink()`

**Route:**
```jsx
<Route path="magic-login/:token" element={<MagicLoginPage />} />
```

## Bezpieczeństwo

### Zabezpieczenia
1. **Limit czasowy**: 15 minut ważności
2. **Jednorazowe**: Jeden użyj = token nieważny
3. **Kryptografia**: 64-znakowy losowy token
4. **Weryfikacja konta**: Tylko zweryfikowane konta
5. **Brak ujawniania**: Nie informuje czy email istnieje

### Email Security
1. **HTTPS**: Wszystkie linki przez HTTPS w produkcji
2. **Ostrzeżenia**: Email zawiera instrukcje bezpieczeństwa
3. **Minimalizm**: Tylko token w URLu, zero wrażliwych danych

## Konserwacja

### Automatyczne Czyszczenie
Celery task codziennie o 3:00 usuwa wygasłe tokeny:
```python
@shared_task
def cleanup_expired_magic_links():
    MagicLink.objects.filter(expires_at__lt=timezone.now()).delete()
```

### Panel Admina
- URL: `/admin/api/magiclink/`
- Widok: email, token (preview), daty, status użycia
- Filtry: użyte/nieużyte, data utworzenia, wygaśnięcia
- Wyszukiwanie: email, token

## Pliki Zmodyfikowane

### Backend
- `api/models.py` - Model MagicLink
- `api/views.py` - RequestMagicLinkView, VerifyMagicLinkView
- `api/urls.py` - Routing magic link endpoints
- `api/admin.py` - Rejestracja MagicLink w adminie
- `api/tasks.py` - Task czyszczący wygasłe linki
- `templates/emails/magic_link_login.html` - Szablon emaila ✨ NOWY
- `api/migrations/0005_magiclink.py` - Migracja bazy ✨ NOWY

### Frontend
- `services/authService.js` - API methods
- `STUDIO/pages/Auth/LoginPage.jsx` - Tryb 'magic'
- `STUDIO/pages/Auth/MagicLoginPage.jsx` - Strona weryfikacji ✨ NOWY
- `STUDIO/routes.jsx` - Route `/magic-login/:token`

## Konfiguracja Email w Produkcji

### Gmail SMTP
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Google App Password, nie zwykłe hasło!
DEFAULT_FROM_EMAIL=noreply@youreasysite.com
```

### SendGrid
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=noreply@youreasysite.com
```

### Mailgun
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=postmaster@your-domain.mailgun.org
EMAIL_HOST_PASSWORD=your-mailgun-password
DEFAULT_FROM_EMAIL=noreply@youreasysite.com
```

## Development vs Production

### Development (Console Backend)
```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```
- Emaile wyświetlają się w konsoli Dockera
- Kopiujesz link ręcznie do przeglądarki
- Szybkie testowanie bez konfiguracji SMTP

### Production (SMTP Backend)
```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# + wszystkie EMAIL_* settings
```
- Prawdziwe emaile wysyłane do użytkowników
- Wymaga konfiguracji SMTP providera
- Profesjonalny wygląd z HTML templates

## Troubleshooting Email

### Email się nie wysyła
1. Sprawdź logi: `docker logs site777_django_app`
2. Weryfikuj SMTP credentials w `.env`
3. Testuj connection:
```python
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Body', 'from@example.com', ['to@example.com'])
```

### Gmail blokuje logowanie
- Użyj Google App Password zamiast zwykłego hasła
- Włącz "Less secure app access" (niezalecane)
- Lub użyj SendGrid/Mailgun

### Email trafia do SPAM
- Skonfiguruj SPF, DKIM, DMARC records
- Użyj dedykowanego email service providera
- Dodaj unsubscribe link w footerze
