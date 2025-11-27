# Cloudflare DNS Configuration Guide

Ten dokument opisuje jak skonfigurować automatyczną konfigurację DNS dla domen OVH przez Cloudflare wskazujących na Google Cloud.

## Architektura

```
Domena użytkownika (OVH)
    ↓
Nameservery zmienione na Cloudflare
    ↓
DNS Zone w Cloudflare
    ↓
Rekordy A/CNAME wskazujące na Google Cloud
    ↓
Twoja aplikacja na Google Cloud
```

## Krok 1: Utwórz konto Cloudflare

1. Zarejestruj się na https://cloudflare.com (darmowe konto wystarczy)
2. Przejdź do **Dashboard** → **Account** → **API Tokens**

## Krok 2: Wygeneruj Cloudflare API Token

1. Kliknij **Create Token**
2. Użyj template **"Edit zone DNS"** lub stwórz custom token z uprawnieniami:
   - **Zone:DNS:Edit** - edycja rekordów DNS
   - **Zone:Zone:Edit** - tworzenie/edycja stref DNS
   - **Zone Settings:Edit** - ustawienia stref (dla page rules)
   - **Account:Account Settings:Read** - odczyt ustawień konta

3. **Zone Resources:**
   - **Option A (Recommended):** Include → **All zones from an account** → [Wybierz swoje konto]
     - ✅ Automatyczna obsługa wszystkich domen w koncie
     - ✅ Nie wymaga aktualizacji tokena przy zakupie nowej domeny
   - **Option B:** Include → **Specific zone** → [Wybierz konkretną domenę]
     - ⚠️ Wymaga ręcznego dodawania każdej nowej domeny do tokena
     - Użyj tylko jeśli chcesz ograniczyć token do jednej domeny

4. Zapisz wygenerowany token (pokaże się tylko raz!)

## Krok 3: Znajdź Account ID

1. W Cloudflare Dashboard, przejdź do dowolnej strony
2. Po prawej stronie znajdziesz **Account ID** (lub w URL: `/[account_id]/`)
3. Skopiuj ten ID

## Krok 4: Ustaw Google Cloud Target

### Opcja A: Używasz Google Cloud Load Balancer (ZALECANE)

1. Utwórz Load Balancer w Google Cloud
2. Zarezerwuj **statyczny zewnętrzny IP**
3. Skopiuj ten adres IP (np. `34.120.45.67`)

### Opcja B: Używasz Cloud Run / App Engine

1. Znajdź domenę swojej aplikacji (np. `myapp-abc123.run.app`)
2. Użyj tej domeny jako target

## Krok 5: Konfiguracja Backend (.env)

Dodaj następujące zmienne do pliku `BACKEND/.env`:

```env
# ============================================================================
# CLOUDFLARE API CONFIGURATION
# ============================================================================

# Cloudflare API Token (z uprawnieniami do DNS i Zone management)
# Utwórz token w: https://dash.cloudflare.com/profile/api-tokens
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here

# Cloudflare Account ID
# Znajdziesz w: Cloudflare Dashboard → Any site → Overview (po prawej)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here

# ============================================================================
# GOOGLE CLOUD TARGET CONFIGURATION
# ============================================================================

# Opcja 1: Używasz Load Balancer z statycznym IP (ZALECANE)
# Podaj zewnętrzny statyczny IP swojego Load Balancera
GOOGLE_CLOUD_IP=34.120.45.67

# Opcja 2: Używasz Cloud Run / App Engine
# Podaj domenę swojej aplikacji (zakomentuj GOOGLE_CLOUD_IP jeśli używasz tej opcji)
# GOOGLE_CLOUD_DOMAIN=myapp-abc123.run.app

# ============================================================================
# ISTNIEJĄCE KONFIGURACJE OVH (bez zmian)
# ============================================================================

OVH_ENDPOINT=ovh-eu
OVH_APPLICATION_KEY=your_ovh_app_key
OVH_APPLICATION_SECRET=your_ovh_app_secret
OVH_CONSUMER_KEY=your_ovh_consumer_key
```

## Krok 6: Restart Backend

Po dodaniu zmiennych środowiskowych, zrestartuj backend:

```bash
docker-compose restart backend celery-worker
```

## Jak to działa?

Gdy użytkownik kupi domenę:

1. **Backend wykrywa nowe zamówienie** → uruchamia task `configure_domain_dns`

2. **Task tworzy zone w Cloudflare:**
   ```
   POST https://api.cloudflare.com/client/v4/zones
   ```

3. **Zmienia nameservery w OVH:**
   ```
   OVH API: /domain/{domain}/nameServers/update
   Ustawia: ns1.cloudflare.com, ns2.cloudflare.com
   ```

4. **Dodaje rekordy DNS w Cloudflare:**
   - Rekord A dla `@` (root) → `GOOGLE_CLOUD_IP`
   - Rekord A dla `www` → `GOOGLE_CLOUD_IP`
   - (lub CNAME jeśli używasz domeny Cloud Run)

5. **Włącza Cloudflare Proxy:**
   - Darmowy SSL/TLS
   - DDoS protection
   - CDN caching
   - Analytics

## Testowanie

Po konfiguracji możesz sprawdzić DNS używając:

```bash
# Sprawdź nameservery
dig NS yourdomain.com

# Sprawdź rekordy A
dig A yourdomain.com
dig A www.yourdomain.com

# Sprawdź przez Cloudflare
nslookup yourdomain.com 1.1.1.1
```

## Propagacja DNS

- **Nameservery OVH → Cloudflare:** 24-48 godzin
- **Rekordy DNS w Cloudflare:** Natychmiastowo (jeśli nameservery już wskazują na CF)
- **TTL:** Cloudflare używa Auto TTL (zwykle 5 minut)

## Troubleshooting

### Error: "Failed to create Cloudflare zone"

**Przyczyna:** Nieprawidłowy API token lub Account ID

**Rozwiązanie:**
1. Sprawdź czy token ma uprawnienia: Zone:DNS:Edit, Zone:Zone:Edit
2. Sprawdź czy Account ID jest poprawny
3. Sprawdź w Cloudflare Dashboard czy domena nie istnieje już w innym koncie

### Error: "Failed to update OVH nameservers"

**Przyczyna:** Domena może być zablokowana lub w trakcie transferu

**Rozwiązanie:**
1. Sprawdź status domeny w panelu OVH
2. Upewnij się że domena nie ma blokady transferu
3. Poczekaj 24h po zakupie domeny

### Domena nie odpowiada po 48h

**Rozwiązanie:**
1. Sprawdź w Cloudflare Dashboard czy zone został utworzony
2. Sprawdź w OVH czy nameservery zostały zmienione
3. Sprawdź logi Celery: `docker logs site777_celery_worker`

## Koszty

- **Cloudflare Free Plan:** $0/miesiąc
  - Unlimited DNS queries
  - DDoS protection
  - SSL/TLS
  - CDN dla statycznych zasobów
  
- **OVH Domena:** Zależnie od TLD (np. .com ~12€/rok)

- **Google Cloud:** Według użycia
  - Load Balancer: ~$18/miesiąc
  - Statyczny IP: $7.50/miesiąc (jeśli nieużywany)

## Dodatkowe funkcje Cloudflare

### Page Rules (3 darmowe na Free Plan)

Możesz dodać redirect z root domain do www (lub odwrotnie):

```javascript
// W tasks.py już jest implementacja
// Automatycznie tworzy Page Rule jeśli używasz CNAME
```

### SSL/TLS Settings

Cloudflare automatycznie generuje certyfikaty SSL. W dashboard możesz ustawić:
- **Flexible:** Cloudflare → User (SSL), Cloudflare → Origin (HTTP)
- **Full:** Cloudflare → User (SSL), Cloudflare → Origin (SSL self-signed)
- **Full (Strict):** Cloudflare → User (SSL), Cloudflare → Origin (SSL valid)

Zalecam: **Full (Strict)** jeśli Google Cloud ma SSL, inaczej **Flexible**

## Bezpieczeństwo

### Ochrona API Token

**NIGDY** nie commituj `.env` do Git!

Dodaj do `.gitignore`:
```
.env
.env.*
!.env.example
```

### Rotacja tokenów

Zalecam zmianę API token co 90 dni:
1. Wygeneruj nowy token w Cloudflare
2. Zaktualizuj `.env`
3. Restart backend
4. Usuń stary token z Cloudflare

## Support

W razie problemów:
- Check logs: `docker logs site777_celery_worker --tail 100`
- Cloudflare API Docs: https://api.cloudflare.com/
- OVH API Console: https://eu.api.ovh.com/console/

## Przykładowa konfiguracja końcowa

```
example.com (OVH)
├── Nameservers: ns1.cloudflare.com, ns2.cloudflare.com
│
Cloudflare Zone
├── @ → A → 34.120.45.67 (proxied ☁️)
├── www → A → 34.120.45.67 (proxied ☁️)
├── SSL: Full (Strict)
└── Cache: Automatic
    │
    └── Google Cloud Load Balancer (34.120.45.67)
        └── Your Application
```

