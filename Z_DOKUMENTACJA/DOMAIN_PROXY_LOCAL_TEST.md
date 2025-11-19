# 🧪 Testowanie Domain Proxy Lokalnie

## 📋 Co testujemy?

System składa się z:
1. **Backend Django** - zwraca konfigurację domen (target, proxy_mode)
2. **Cloudflare Worker** - proxy dla domen użytkowników
3. **Cloudflare Tunnel** - wystawia localhost:8000 na internet
4. **Frontend Settings** - UI do zmiany target i proxy_mode

---

## 🚀 Krok 1: Uruchom wszystkie serwisy lokalnie

```powershell
# W głównym katalogu projektu
docker-compose up -d

# Sprawdź czy wszystko działa
docker-compose ps
```

Powinny być uruchomione:
- ✅ `site777_django_app` (port 8000)
- ✅ `site777_celery_worker`
- ✅ `site777_postgres_db` (port 5432)
- ✅ `site777_redis` (port 6379)
- ✅ `site777_studio_frontend_app` (port 3000)

---

## 🌐 Krok 2: Wystaw backend na internet (Cloudflare Tunnel)

**W nowym oknie PowerShell:**

```powershell
cd C:\Users\Bogdan\ZPI2\ZPI
cmd /c "npx cloudflared tunnel --url http://localhost:8000"
```

**Skopiuj URL który się pojawi**, np:
```
https://example-name-here.trycloudflare.com
```

⚠️ **WAŻNE:** Zostaw ten terminal otwarty! Tunnel musi działać cały czas.

---

## 🔧 Krok 3: Zaktualizuj Worker config

**W pliku `CLOUDFLARE_WORKER/wrangler.toml`:**

```toml
name = "domain-proxy-worker"
main = "worker.js"
compatibility_date = "2024-01-01"

# Environment Variables
[vars]
BACKEND_API = "https://TWOJ-TUNNEL-URL.trycloudflare.com/api/v1/domains/resolve/"
```

Zastąp `TWOJ-TUNNEL-URL` swoim URL z kroku 2.

---

## ☁️ Krok 4: Deploy Worker na Cloudflare

**W nowym oknie PowerShell:**

```powershell
cd C:\Users\Bogdan\ZPI2\ZPI\CLOUDFLARE_WORKER
cmd /c "npx wrangler deploy"
```

Worker zostanie zdeployowany na:
```
https://domain-proxy-worker.sbddomain.workers.dev
```

---

## 🧪 Krok 5: Przetestuj API bezpośrednio

```powershell
# Test 1: Sprawdź czy backend odpowiada przez tunnel
Invoke-WebRequest -Uri "https://TWOJ-TUNNEL-URL.trycloudflare.com/api/v1/domains/resolve/dronecomponentsfpv.online/" | Select-Object -ExpandProperty Content

# Powinno zwrócić JSON:
# {
#   "target": "youtube.com",
#   "proxy_mode": false,
#   "domain": "dronecomponentsfpv.online",
#   ...
# }
```

---

## 🎨 Krok 6: Zmień konfigurację w UI

1. **Otwórz Frontend:**
   ```
   http://localhost:3000/settings/domains
   ```

2. **Znajdź swoją domenę** (np. `dronecomponentsfpv.online`)

3. **Kliknij "Edit"**

4. **Zmień ustawienia:**
   - **Target:** `example.com` (testowa strona)
   - **Proxy Mode:** ✅ **ON** (zaznacz switch)
   - **Kliknij "Save"**

5. **Sprawdź logi backend:**
   ```powershell
   docker-compose logs -f backend
   ```
   
   Powinno pokazać:
   ```
   INFO api.views [Domain Order] Updated target for dronecomponentsfpv.online: example.com
   INFO api.views [Domain Order] Updated proxy_mode for dronecomponentsfpv.online: True
   ```

---

## 🔍 Krok 7: Przetestuj Worker lokalnie (symulator)

**Otwórz plik HTML:**

```powershell
Start-Process "C:\Users\Bogdan\ZPI2\ZPI\test_worker_locally.html"
```

W przeglądarce:

1. **Kliknij "Test Backend API"**
   - Powinno pokazać JSON z konfiguracją domeny

2. **Kliknij "Simulate Proxy (example.com)"**
   - Powinno pokazać iframe z `example.com`
   - URL pozostaje lokalny (symulacja proxy)

---

## 🌍 Krok 8: Przetestuj prawdziwą domenę

**Otwórz w przeglądarce:**
```
http://dronecomponentsfpv.online
```

### Oczekiwane rezultaty:

**Jeśli Proxy Mode = ON:**
- URL w pasku: `dronecomponentsfpv.online`
- Zawartość: Pokazuje `example.com`

**Jeśli Proxy Mode = OFF:**
- Browser przekierowuje do: `https://example.com`
- URL zmienia się w pasku przeglądarki

---

## 📊 Krok 9: Sprawdź logi

### Backend (Django):
```powershell
docker-compose logs -f backend
```

Szukaj:
```
INFO api.views [Domain Resolve] dronecomponentsfpv.online -> example.com
```

### Celery (cache purging):
```powershell
docker-compose logs -f celery-worker
```

Szukaj:
```
INFO api.tasks [Celery] Purging Cloudflare cache for domain: dronecomponentsfpv.online
```

### Cloudflare Tunnel:
W terminalu gdzie działa tunnel, szukaj:
```
INF HTTP/1.1 GET /api/v1/domains/resolve/dronecomponentsfpv.online/
```

---

## 🔄 Krok 10: Test pełnej zmiany (Push Model)

1. **W Settings → Domains:**
   - Zmień `target` z `example.com` na `httpbin.org`
   - Proxy Mode: **ON**
   - Save

2. **Backend automatycznie:**
   - Zapisze zmiany do bazy ✅
   - Wywoła Celery task `purge_cloudflare_cache` ✅
   - Wyczyści cache Cloudflare (jeśli `CLOUDFLARE_ZONE_ID` ustawione) ✅

3. **Worker przy następnym requestcie:**
   - Pobierze świeże dane z backendu ✅
   - Pokaże nowy target ✅

4. **Odśwież `http://dronecomponentsfpv.online`:**
   - Powinno pokazać `httpbin.org` zamiast `example.com`

---

## ✅ Checklist diagnostyczny

Jeśli coś nie działa, sprawdź:

- [ ] `docker-compose ps` - wszystkie serwisy `Up`
- [ ] Cloudflare Tunnel działa (terminal otwarty)
- [ ] `wrangler.toml` ma prawidłowy URL tunnelu
- [ ] Worker jest zdeployowany (`npx wrangler deploy`)
- [ ] Backend zwraca JSON dla domeny (test curl)
- [ ] CORS nie blokuje (sprawdź console w przeglądarce)
- [ ] DNS domeny wskazuje na Cloudflare (nslookup)

---

## 🐛 Typowe problemy

### 1. CORS error
**Rozwiązanie:** Backend już ma CORS dla `.trycloudflare.com`, restart backend:
```powershell
docker-compose restart backend
```

### 2. 530 Error (Tunnel unregistered)
**Rozwiązanie:** Tunnel się wyłączył, uruchom ponownie i zaktualizuj `wrangler.toml`

### 3. Worker nie widzi zmian
**Rozwiązanie:** 
- Jeśli cache jest włączony - czeka 5 minut
- Jeśli cache wyłączony - restart Worker (redeploy)
- Sprawdź czy Celery purge działa (`CLOUDFLARE_ZONE_ID` w `.env`)

### 4. Domain not configured (404)
**Rozwiązanie:** 
- Sprawdź w bazie czy domain order istnieje
- Status musi być `ACTIVE`
- `target` musi być ustawiony

---

## 📝 Notatki

### Jak wyłączyć cache w Worker (tylko testy):

W `worker.js` zakomentuj:
```javascript
// cf: {
//   cacheTtl: 300,
//   cacheEverything: true,
// }
```

### Jak włączyć cache purging:

1. W Cloudflare Dashboard → youreasysite.com → Overview
2. Skopiuj **Zone ID** (po prawej stronie)
3. W `BACKEND/.env`:
   ```
   CLOUDFLARE_ZONE_ID=twoj_zone_id_tutaj
   ```
4. Restart Celery:
   ```powershell
   docker-compose restart celery-worker
   ```

---

## 🎯 Przykładowe scenariusze testowe

### Scenariusz 1: Proxy Mode dla prostej strony
```
Target: example.com
Proxy Mode: ON
Result: Pokazuje example.com z URL dronecomponentsfpv.online
```

### Scenariusz 2: Redirect Mode
```
Target: example.com
Proxy Mode: OFF
Result: Browser przekierowuje na https://example.com
```

### Scenariusz 3: Proxy dla API
```
Target: httpbin.org
Proxy Mode: ON
Result: Pokazuje httpbin.org z zachowanym URL
```

### Scenariusz 4: YouTube (NIE DZIAŁA w proxy!)
```
Target: youtube.com
Proxy Mode: ON
Result: YouTube blokuje (X-Frame-Options)
Recommendation: Użyj Redirect Mode
```

---

## 🔗 Przydatne linki

- **Frontend:** http://localhost:3000/settings/domains
- **Backend API:** http://localhost:8000/api/v1/domains/resolve/{domain}/
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Worker URL:** https://domain-proxy-worker.sbddomain.workers.dev
- **Local Simulator:** C:\Users\Bogdan\ZPI2\ZPI\test_worker_locally.html

---

## 📚 Dokumentacja powiązana

- `Z_DOKUMENTACJA/DOMAIN_SYSTEM.md` - Architektura systemu domen
- `Z_DOKUMENTACJA/PROXY_MODE_GUIDE.md` - Szczegóły proxy mode
- `CLOUDFLARE_WORKER/README.md` - Worker deployment guide
