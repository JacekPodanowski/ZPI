# DDoS Protection Configuration Guide

## Przegląd

Backend został wyposażony w kompleksowy system ochrony przed atakami DDoS składający się z czterech warstw:

1. **Middleware DDoS Protection** - monitoruje i blokuje podejrzany ruch z burst allowance
2. **Django Axes** - chroni przed atakami brute-force na logowanie
3. **Rate Limiting** - limituje liczbę zapytań do krytycznych endpointów
4. **CAPTCHA System** - wymaga CAPTCHA po 3 nieudanych próbach (zamiast blokady)

## Komponenty Systemu

### 1. DDoS Protection Middleware (`api/ddos_middleware.py`)

**Funkcje:**
- Rate limiting per IP: 120 req/min, 2000 req/godzinę (production)
- **Burst allowance**: pozwala na krótkie skoki do +30 req w 10s oknie
- **Wyższe limity dla zalogowanych**: 2x standardowe limity
- **Różne limity dla endpointów**: publiczne (stricter) vs prywatne (relaxed)
- Wykrywanie podejrzanych wzorców URL
- Automatyczne blokowanie IP na 30 min po przekroczeniu limitów
- Whitelist dla zaufanych IP

**Konfiguracja w `.env`:**
```env
DDOS_REQUESTS_PER_MINUTE=120
DDOS_REQUESTS_PER_HOUR=2000
DDOS_BLOCK_DURATION=1800
DDOS_BURST_ALLOWANCE=30
DDOS_BURST_WINDOW=10
DDOS_SUSPICIOUS_THRESHOLD=100
```

### 2. Django Axes (Brute-force Protection)

**Funkcje:**
- Blokowanie po 7 nieudanych próbach logowania
- Czas blokady: 30 minut
- Blokowanie oparte na kombinacji user + IP
- Automatyczne resetowanie licznika po udanym logowaniu

**Konfiguracja w `.env`:**
```env
AXES_FAILURE_LIMIT=7
AXES_COOLOFF_TIME=0.5
```

### 3. CAPTCHA System (Progressive Security)

**Funkcje:**
- Po 3 nieudanych próbach logowania → wymagaj CAPTCHA (zamiast blokady!)
- Integracja z Google reCAPTCHA v2/v3
- Automatyczne resetowanie po udanym logowaniu
- Lepsza user experience niż natychmiastowa blokada

**Konfiguracja w `.env`:**
```env
CAPTCHA_FAILURE_THRESHOLD=3
RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
```

**Użycie w kodzie:**
```python
from api.rate_limiting import (
    requires_captcha, 
    verify_recaptcha, 
    increment_failed_attempts,
    reset_failed_attempts,
    get_captcha_status
)

# Sprawdź czy CAPTCHA wymagane
if requires_captcha(email, 'login'):
    captcha_token = request.data.get('captcha_token')
    if not captcha_token or not verify_recaptcha(captcha_token):
        return Response({'error': 'CAPTCHA required', **get_captcha_status(email)}, status=400)

# Po nieudanym logowaniu
increment_failed_attempts(email, 'login')

# Po udanym logowaniu
reset_failed_attempts(email, 'login')
```

### 4. Rate Limiting Dekoratory (`api/rate_limiting.py`)

**Dostępne dekoratory:**

| Dekorator | Limit | Użycie |
|-----------|-------|--------|
| `@rate_limit_strict` | 10 req/min | rejestracja, magic links |
| `@rate_limit_moderate` | 30 req/min | reset hasła, booking |
| `@rate_limit_relaxed` | 120 req/min | ogólne API |
| `@auth_rate_limit_strict` | 20 req/min | auth: upload |
| `@auth_rate_limit_moderate` | 60 req/min | auth: AI |
| `@auth_rate_limit_relaxed` | 240 req/min | auth: edytor |

## Limity dla Różnych Typów Użytkowników

| Typ | Limit/min | Limit/h | Burst |
|-----|-----------|---------|-------|
| Anonimowy (publiczne) | 60 | 1000 | +30 |
| Anonimowy (prywatne) | 120 | 2000 | +30 |
| Zalogowany | 240 | 4000 | +30 |

## Endpointy Publiczne vs Prywatne

**Publiczne (stricter - 50% normalnych limitów):**
- `/api/v1/public-sites/`
- `/api/v1/booking/`
- `/api/v1/availability/`

**Prywatne (relaxed dla auth users - 2x limity):**
- `/api/v1/sites/`
- `/api/v1/editor/`
- `/api/v1/upload/`

## Odpowiedzi API przy Przekroczeniu Limitów

### Rate Limit Exceeded (429)
```json
{
  "error": "Rate limit exceeded",
  "detail": "Maximum 5 requests per 60 seconds allowed",
  "retry_after": 45
}
```

### IP Blocked (429)
```json
{
  "error": "Too many requests. Your IP has been temporarily blocked.",
  "retry_after": 3420
}
```

### Suspicious Activity (403)
```json
{
  "error": "Suspicious activity detected. Your IP has been blocked."
}
```

## Monitoring i Logowanie

System loguje wszystkie istotne zdarzenia:

```python
# Przykładowe logi
"Rate limit exceeded for IP: 192.168.1.100"
"Suspicious request from 10.0.0.5: /.env"
"Blocking IP 203.0.113.42 due to suspicious activity"
"IP 198.51.100.10 has been blocked for 3600 seconds"
```

## Testowanie Ochrony

### Test Rate Limiting
```bash
# Wyślij 10 żądań w ciągu minuty
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/v1/auth/register/ \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","password":"test123"}'
  sleep 1
done
```

### Test DDoS Protection
```bash
# Szybkie kolejne żądania (powinny być zablokowane)
for i in {1..100}; do
  curl http://localhost:8000/api/v1/sites/ &
done
```

### Test Axes (Brute-force)
```bash
# 6 nieudanych prób logowania
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/v1/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong'$i'"}'
done
```

## Zarządzanie Whitelist

Dodaj zaufane IP do `settings.py`:

```python
DDOS_WHITELIST = [
    '127.0.0.1',
    'localhost',
    '10.0.0.1',  # Twój VPN
    '203.0.113.0/24',  # Twoja sieć firmowa
]
```

## Redis - Wymagania

System wymaga działającego Redisa do:
- Cache'owania liczników rate limiting
- Przechowywania zablokowanych IP
- Django Axes storage

Redis jest już skonfigurowany w `docker-compose.yml` i działa automatycznie.

## Migracje Bazy Danych

Django Axes wymaga migracji:

```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

## Best Practices

1. **Monitoring:** Regularnie sprawdzaj logi pod kątem nietypowej aktywności
2. **Tuning:** Dostosuj limity do swojego ruchu (zmienne w `.env`)
3. **Whitelist:** Dodaj IP swojego CI/CD i monitoringu
4. **Alerts:** Rozważ integrację z systemem alertów (np. Sentry)
5. **Load Balancer:** Upewnij się, że prawdziwe IP są przekazywane przez `X-Forwarded-For`
6. **CAPTCHA:** Skonfiguruj reCAPTCHA dla lepszego UX zamiast blokowania

## Wyłączanie w Development

Aby poluzować ochronę podczas developmentu, dodaj do `.env`:

```env
DDOS_REQUESTS_PER_MINUTE=1000
DDOS_REQUESTS_PER_HOUR=10000
AXES_FAILURE_LIMIT=100
CAPTCHA_FAILURE_THRESHOLD=100
```

## Troubleshooting

### Problem: Legalny użytkownik jest blokowany
**Rozwiązanie:** 
1. Sprawdź burst allowance - może za szybko klika
2. Dodaj jego IP do whitelist
3. Zwiększ limity jeśli problem się powtarza

### Problem: Rate limiting nie działa
**Rozwiązanie:** Sprawdź czy Redis działa: `docker-compose ps redis`

### Problem: Axes blokuje zbyt często
**Rozwiązanie:** Zwiększ `AXES_FAILURE_LIMIT` lub skonfiguruj CAPTCHA

### Problem: CAPTCHA nie działa
**Rozwiązanie:** Sprawdź klucze `RECAPTCHA_SITE_KEY` i `RECAPTCHA_SECRET_KEY`

## Wartości Produkcyjne (Domyślne)

Obecna konfiguracja jest zoptymalizowana dla produkcji:

```env
# Aktualne wartości produkcyjne
DDOS_REQUESTS_PER_MINUTE=120
DDOS_REQUESTS_PER_HOUR=2000
DDOS_BLOCK_DURATION=1800  # 30 min
DDOS_BURST_ALLOWANCE=30
AXES_FAILURE_LIMIT=7
AXES_COOLOFF_TIME=0.5  # 30 min
CAPTCHA_FAILURE_THRESHOLD=3
```

Te wartości balansują bezpieczeństwo z user experience:
- ✅ Normalne przeglądanie nie zostanie zablokowane
- ✅ Burst przy ładowaniu strony jest dozwolony
- ✅ Zalogowani userzy mają 2x limity
- ✅ CAPTCHA zamiast blokady przy nieudanych logowaniach
- ✅ Krótszy czas blokady (30 min vs 1h)

## Kontakt z Support

Jeśli zauważysz atak DDoS:
1. Sprawdź logi: `docker-compose logs backend | grep "Rate limit\|Blocked\|Suspicious"`
2. Zidentyfikuj atakujące IP
3. Dodaj je do blacklist w Cloudflare/Load Balancer
4. Rozważ tymczasowe zmniejszenie limitów
