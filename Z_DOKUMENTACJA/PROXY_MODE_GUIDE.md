# Proxy Mode vs Redirect Mode - Domain Configuration

## Dwa Tryby Działania Domeny

System wspiera **dwa tryby** konfiguracji domeny:

### 1. **Redirect Mode** (domyślny) - ↗️
**URL w przeglądarce: ZMIENIA SIĘ**

```
Użytkownik wpisuje:    http://dronecomponentsfpv.online
Przeglądarka pokazuje: https://youtube.com
```

**Jak działa:**
- Cloudflare Page Rule wykonuje przekierowanie HTTP 301
- Przeglądarka automatycznie przekierowuje użytkownika
- URL w pasku adresu zmienia się na target
- Najszybsze, najlepsze SEO
- Działa dla WSZYSTKICH stron

**Zalety:**
- ✅ Szybkie (tylko przekierowanie)
- ✅ Dobre dla SEO (301 permanent redirect)
- ✅ Działa zawsze
- ✅ Nie wymaga Cloudflare Worker

**Wady:**
- ❌ URL się zmienia (użytkownik widzi docelowy URL)

---

### 2. **Proxy Mode** - 🔄
**URL w przeglądarce: POZOSTAJE**

```
Użytkownik wpisuje:    http://dronecomponentsfpv.online
Przeglądarka pokazuje: http://dronecomponentsfpv.online
Zawartość:             (z youtube.com)
```

**Jak działa:**
- Cloudflare Worker pobiera zawartość z target URL
- Worker serwuje ją pod oryginalnym URL
- URL w pasku adresu NIE zmienia się
- Reverse proxy (pełny mirror strony)

**Zalety:**
- ✅ URL pozostaje niezmieniony
- ✅ Użytkownik nie wie że jest przekierowany
- ✅ Branding domeny zachowany

**Wady:**
- ❌ **YouTube/Google BLOKUJĄ proxy** (X-Frame-Options)
- ❌ Wolniejsze (Worker musi pobrać całą zawartość)
- ❌ Wymaga Worker (płatny plan Free tier ma limity)
- ❌ Może złamać JavaScript/cookies cross-domain

---

## Kiedy Użyć Którego Trybu?

### Użyj **Redirect Mode** gdy:
- ✅ Przekierowujesz na YouTube/Facebook/Instagram (blokują proxy)
- ✅ Chcesz najlepszą wydajność
- ✅ Zależy Ci na SEO
- ✅ Cel: duże serwisy (YouTube, Google, itp.)

### Użyj **Proxy Mode** gdy:
- ✅ Przekierowujesz na **własną stronę** (subdomenę YourEasySite)
- ✅ Chcesz zachować branding domeny
- ✅ Target NIE blokuje iframe/proxy
- ✅ Cel: Twoja strona wygenerowana przez system

---

## Konfiguracja w UI

### Włączenie Proxy Mode:

1. Przejdź do **Settings → Orders**
2. Znajdź swoją domenę
3. Kliknij **Edit** (✏️)
4. Ustaw **Target URL**
5. **Włącz switch "Proxy Mode"** 🔄
6. Kliknij **Save** (💾)

### Testowanie:

**Redirect Mode:**
```bash
curl -L http://dronecomponentsfpv.online
# → Przekieruje na https://youtube.com
```

**Proxy Mode:**
```bash
curl http://dronecomponentsfpv.online
# → Zwróci zawartość z youtube.com
# → URL pozostaje dronecomponentsfpv.online
```

---

## Implementacja Techniczna

### Backend (Django)

**Model `DomainOrder`:**
```python
proxy_mode = models.BooleanField(
    default=False,
    help_text='If True, use reverse proxy. If False, use 301 redirect'
)
```

**API Response:**
```json
{
  "target": "youtube.com",
  "proxy_mode": true,  // ← Nowe pole
  "domain": "dronecomponentsfpv.online"
}
```

### Cloudflare Worker

**Redirect Mode (proxy_mode=false):**
```javascript
return Response.redirect(targetUrl, 301);
```

**Proxy Mode (proxy_mode=true):**
```javascript
const targetResponse = await fetch(targetUrl);
return new Response(targetResponse.body, {
  status: targetResponse.status,
  headers: newHeaders
});
```

### Frontend (React)

**OrdersPage UI:**
```jsx
<Switch
  checked={proxyModeValue}
  onChange={(e) => setProxyModeValue(e.target.checked)}
  label="🔄 Proxy Mode (zachowaj URL)"
/>
```

---

## Ograniczenia Proxy Mode

### Strony które BLOKUJĄ proxy:
- ❌ YouTube (`X-Frame-Options: DENY`)
- ❌ Google (`X-Frame-Options: SAMEORIGIN`)
- ❌ Facebook (`X-Frame-Options: DENY`)
- ❌ Instagram, Twitter, większość social media

### Co może nie działać:
- ❌ Logowanie/Cookies (cross-domain)
- ❌ JavaScript (CORS, różne domeny)
- ❌ WebSockets
- ❌ Media streaming (może być wolne)

### Rozwiązanie:
**Użyj Redirect Mode** lub skonfiguruj target na **własną stronę** (subdomenę youreasysite.com) która wspiera proxy.

---

## Rekomendacje

### Dla większości przypadków:
**Redirect Mode** - szybkie, niezawodne, działa wszędzie

### Dla własnych stron:
**Proxy Mode** - zachowujesz branding domeny

### Do testów:
Jeśli testujesz z YouTube → **Redirect Mode** (YouTube blokuje proxy)

---

## FAQ

**Q: Dlaczego YouTube nie działa w Proxy Mode?**  
A: YouTube ustawia `X-Frame-Options: DENY` co blokuje iframe i proxy. Użyj Redirect Mode.

**Q: Czy Proxy Mode jest wolniejsze?**  
A: Tak, Worker musi pobrać całą zawartość z target. Redirect to tylko HTTP 301.

**Q: Czy mogę zmienić tryb po konfiguracji?**  
A: Tak! Edytuj order w UI, zmień switch Proxy Mode i zapisz. Worker automatycznie użyje nowego trybu.

**Q: Czy Proxy Mode wymaga dodatkowej konfiguracji DNS?**  
A: Nie! Worker obsługuje oba tryby automatycznie na podstawie flagi `proxy_mode`.

---

**Utworzono:** 2025-11-19  
**Status:** ✅ Zaimplementowane i przetestowane
