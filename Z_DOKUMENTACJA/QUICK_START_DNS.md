# Quick Start: Cloudflare DNS Configuration

## Wymagane API Keys w `.env`

Dodaj do pliku `BACKEND/.env`:

```env
# === CLOUDFLARE ===
# 1. Utwórz token w: https://dash.cloudflare.com/profile/api-tokens
# 2. Template: "Edit zone DNS" LUB custom z uprawnieniami:
#    - Zone:DNS:Edit
#    - Zone:Zone:Edit  
#    - Zone Settings:Edit
CLOUDFLARE_API_TOKEN=your_token_here

# 3. Znajdź w Dashboard → Overview (po prawej stronie)
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# === GOOGLE CLOUD TARGET ===
# Wybierz JEDNĄ opcję:

# Opcja A: Load Balancer (ZALECANE)
GOOGLE_CLOUD_IP=34.120.45.67

# Opcja B: Cloud Run / App Engine (zakomentuj GOOGLE_CLOUD_IP powyżej)
# GOOGLE_CLOUD_DOMAIN=myapp-abc123.run.app

# === OVH (już masz skonfigurowane) ===
OVH_ENDPOINT=ovh-eu
OVH_APPLICATION_KEY=...
OVH_APPLICATION_SECRET=...
OVH_CONSUMER_KEY=...
```

## Jak zdobyć wartości?

### CLOUDFLARE_API_TOKEN
1. Zaloguj się do Cloudflare
2. Idź do: https://dash.cloudflare.com/profile/api-tokens
3. **Create Token** → **Use template: "Edit zone DNS"**
4. **Permissions:** (już ustawione przez template)
   - Zone → DNS → Edit
   - Zone → Zone → Edit
5. **Zone Resources:** 
   - Include → **All zones from an account** → [Wybierz swoje konto]
   - LUB: Include → **Specific zone** → [Wybierz konkretną domenę]
   - ⚠️ Dla automatycznej konfiguracji wybierz "All zones"
6. **Continue to summary** → **Create Token**
7. ⚠️ Skopiuj token (pokaże się tylko raz!)

### CLOUDFLARE_ACCOUNT_ID
1. W Cloudflare Dashboard przejdź do **dowolnej domeny** (lub dodaj testową)
2. Po prawej stronie zobaczysz **Account ID**
3. Skopiuj (format: 32-znakowy hex)

### GOOGLE_CLOUD_IP
**Potrzebujesz Google Cloud Load Balancer!**

```bash
# 1. Utwórz Load Balancer w Google Cloud Console
# 2. Zarezerwuj statyczny IP:
gcloud compute addresses create youreasysite-ip \
  --global \
  --ip-version IPV4

# 3. Sprawdź IP:
gcloud compute addresses describe youreasysite-ip --global
```

**LUB** użyj istniejącego IP z Load Balancera.

### GOOGLE_CLOUD_DOMAIN
Jeśli używasz Cloud Run:
```bash
gcloud run services describe YOUR_SERVICE --region=REGION --format='value(status.url)'
```

Skopiuj domenę (np. `myapp-abc123-uc.a.run.app`)

## Test konfiguracji

```bash
# Restart backend
docker-compose restart backend celery-worker

# Sprawdź logi
docker logs site777_celery_worker --tail 50

# Kup testową domenę przez UI
# Backend automatycznie:
# 1. Utworzy zone w Cloudflare
# 2. Zmieni nameservery w OVH  
# 3. Doda rekordy DNS
```

## Weryfikacja

Po zakupie domeny sprawdź w Cloudflare Dashboard:
- ✅ Nowa zona DNS powinna się pojawić
- ✅ Rekordy A dla `@` i `www` powinny wskazywać na Google Cloud IP
- ✅ Status: "Active"

Sprawdź nameservery (może potrwać 24-48h):
```bash
dig NS yourdomain.com
# Powinno zwrócić: ns1.cloudflare.com, ns2.cloudflare.com
```

## Pełna dokumentacja

Zobacz `CLOUDFLARE_DNS_SETUP.md` dla szczegółów.
