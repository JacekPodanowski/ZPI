# DDoS Protection Configuration Guide

## Przegląd

Backend został wyposażony w kompleksowy system ochrony przed atakami DDoS składający się z trzech warstw:

1. **Middleware DDoS Protection** - monitoruje i blokuje podejrzany ruch
2. **Django Axes** - chroni przed atakami brute-force na logowanie
3. **Rate Limiting** - limituje liczbę zapytań do krytycznych endpointów

## Komponenty Systemu

### 1. DDoS Protection Middleware (`api/ddos_middleware.py`)

**Funkcje:**
- Rate limiting per IP: 60 req/min, 1000 req/godzinę (domyślnie)
- Wykrywanie podejrzanych wzorców URL (próby dostępu do `/admin/`, `/.env`, `/wp-admin`, itp.)
- Automatyczne blokowanie IP na 1 godzinę po przekroczeniu limitów
- Whitelist dla zaufanych IP

**Konfiguracja w `.env`:**
```env
DDOS_REQUESTS_PER_MINUTE=60
DDOS_REQUESTS_PER_HOUR=1000
DDOS_BLOCK_DURATION=3600
DDOS_SUSPICIOUS_THRESHOLD=100
```

### 2. Django Axes (Brute-force Protection)

**Funkcje:**
- Blokowanie po 5 nieudanych próbach logowania (domyślnie)
- Czas blokady: 1 godzina
- Blokowanie oparte na kombinacji user + IP
- Automatyczne resetowanie licznika po udanym logowaniu

**Konfiguracja w `.env`:**
```env
AXES_FAILURE_LIMIT=5
AXES_COOLOFF_TIME=1
```

### 3. Rate Limiting Dekoratory (`api/rate_limiting.py`)

**Dostępne dekoratory:**

- `@rate_limit_strict` - 5 req/min (dla rejestracji, magic links)
- `@rate_limit_moderate` - 20 req/min (dla reset hasła, booking)
- `@rate_limit_relaxed` - 100 req/min
- `@auth_rate_limit_moderate` - 50 req/min per user (dla upload, AI)

**Chronione endpointy:**
- Rejestracja użytkowników
- Wysyłka emaili weryfikacyjnych
- Magic link logowanie
- Reset hasła
- Upload plików
- AI endpoints
- Publiczne API (booking, dostępność)

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

## Wyłączanie w Development

Aby wyłączyć ochronę podczas developmentu, dodaj do `.env`:

```env
DDOS_REQUESTS_PER_MINUTE=10000
DDOS_REQUESTS_PER_HOUR=100000
AXES_FAILURE_LIMIT=1000
```

Lub usuń middleware z `MIDDLEWARE` w `settings.py` (niezalecane).

## Troubleshooting

### Problem: Legalny użytkownik jest blokowany
**Rozwiązanie:** Dodaj jego IP do whitelist lub zwiększ limity

### Problem: Rate limiting nie działa
**Rozwiązanie:** Sprawdź czy Redis działa: `docker-compose ps redis`

### Problem: Axes blokuje zbyt często
**Rozwiązanie:** Zwiększ `AXES_FAILURE_LIMIT` w `.env`

## Produkcja

Dla środowiska produkcyjnego zalecane wartości:

```env
# Produkcja - bardziej restrykcyjne limity
DDOS_REQUESTS_PER_MINUTE=30
DDOS_REQUESTS_PER_HOUR=500
DDOS_BLOCK_DURATION=7200  # 2 godziny
AXES_FAILURE_LIMIT=3
AXES_COOLOFF_TIME=2  # 2 godziny
```

## Kontakt z Support

Jeśli zauważysz atak DDoS:
1. Sprawdź logi: `docker-compose logs backend | grep "Rate limit\|Blocked\|Suspicious"`
2. Zidentyfikuj atakujące IP
3. Dodaj je do blacklist w Cloudflare/Load Balancer
4. Rozważ tymczasowe zmniejszenie limitów
