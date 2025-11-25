# System Subdomen i Publikacji

## Przegląd

System automatycznego tworzenia subdomen i zarządzania publikacją stron użytkowników. Każda strona otrzymuje automatycznie wygenerowaną subdomenę i pokazuje stronę "Under Construction" dopóki użytkownik nie kliknie "Publikuj".

## Architektura

### Model Site - Nowe pola

```python
class Site(models.Model):
    # ... istniejące pola ...
    
    subdomain = models.CharField(
        max_length=255,
        unique=True,
        editable=False,
        blank=True,
        null=True,
        help_text='Auto-generated subdomain (e.g., 1234-nazwa.youreasysite.com)'
    )
    
    is_published = models.BooleanField(
        default=False,
        help_text='Whether this site is published and publicly accessible'
    )
    
    published_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text='When the site was first published'
    )
```

### Automatyczne generowanie subdomen

Subdomeny są automatycznie generowane w metodzie `save()` modelu Site:

```python
def save(self, *args, **kwargs):
    super().save(*args, **kwargs)
    # ... generowanie identifier ...
    
    # Auto-generate subdomain based on identifier
    desired_subdomain = f"{desired_identifier}.youreasysite.com" if desired_identifier else None
    
    if self.subdomain != desired_subdomain:
        Site.objects.filter(pk=self.pk).update(subdomain=desired_subdomain)
        self.subdomain = desired_subdomain
```

**Format subdomeny:** `{id}-{slug}.youreasysite.com`

**Przykład:** 
- Site ID: 1234
- Nazwa: "Pracownia Jogi" 
- Subdomena: `1234-pracownia_jogi.youreasysite.com`

## Proces publikacji

### 1. Stan początkowy

Po utworzeniu strony:
- `is_published = False`
- `published_at = None`
- `subdomain` jest automatycznie wygenerowana
- Strona pokazuje **Under Construction**

### 2. Kliknięcie "Publikuj"

Wywołanie: `POST /api/v1/sites/{site_id}/publish/`

Backend:
```python
# Mark site as published
is_first_publish = not site.is_published
site.is_published = True
if is_first_publish and not site.published_at:
    site.published_at = timezone.now()
site.save()

# Trigger Vercel build
response = requests.post(hook_url)
```

Response:
```json
{
  "message": "Site published successfully",
  "site_identifier": "1234-pracownia_jogi",
  "subdomain": "1234-pracownia_jogi.youreasysite.com",
  "is_published": true,
  "published_at": "2025-11-25T10:30:00Z"
}
```

### 3. Stan po publikacji

- `is_published = True`
- `published_at = <timestamp pierwszej publikacji>`
- Strona pokazuje właściwą zawartość
- Subdomena jest aktywna

## Frontend - SiteApp.jsx

### Logika wyświetlania

```jsx
const SiteApp = ({ siteIdentifierFromPath, previewConfig, isPreview = false }) => {
  const [isPublished, setIsPublished] = useState(true);
  const [siteName, setSiteName] = useState('Ta strona');
  
  // Fetch site data
  const siteData = await fetchPublicSiteConfig(identifier);
  setIsPublished(siteData.is_published !== false);
  setSiteName(siteData.name || 'Ta strona');
  
  // Show Under Construction if not published (except in preview mode)
  if (!isPreview && !isPublished) {
    return <UnderConstructionPage siteName={siteName} />;
  }
  
  // Show actual site
  return <ActualSiteContent />;
}
```

## Under Construction Page

Elegancka strona z animacjami wyświetlana gdy `is_published=False`:

### Funkcje:
- ✨ Gradient title z animacjami
- 🎨 Animated background particles (20 floating dots)
- 🔄 Rotating logo with pulsing glow effect
- 💫 Loading dots animation
- 📱 Fully responsive design
- 🌙 Dark mode theme zgodny z "Ethereal Minimalism"

### Lokalizacja:
`FRONTEND/src/SITES/pages/UnderConstructionPage.jsx`

## API Endpoints

### Get Site Configuration (Public)

```http
GET /api/v1/public-sites/{identifier}/
```

Response includes:
```json
{
  "id": 1234,
  "identifier": "1234-pracownia_jogi",
  "name": "Pracownia Jogi",
  "subdomain": "1234-pracownia_jogi.youreasysite.com",
  "is_published": false,
  "template_config": { ... }
}
```

### Publish Site (Protected)

```http
POST /api/v1/sites/{site_id}/publish/
Authorization: Bearer {jwt_token}
```

Response:
```json
{
  "message": "Site published successfully",
  "site_identifier": "1234-pracownia_jogi",
  "subdomain": "1234-pracownia_jogi.youreasysite.com",
  "is_published": true,
  "published_at": "2025-11-25T10:30:00Z"
}
```

## Migracja

### Utworzenie migracji:

```bash
docker-compose exec backend python manage.py makemigrations
```

### Zastosowanie migracji:

```bash
docker-compose exec backend python manage.py migrate
```

### Generowanie subdomen dla istniejących stron:

```bash
docker-compose exec backend python manage.py shell -c "
from api.models import Site; 
sites = Site.objects.all(); 
[site.save() for site in sites]; 
print(f'Updated {len(sites)} sites with subdomains')
"
```

## Przykładowe scenariusze

### Scenariusz 1: Nowa strona

1. Użytkownik tworzy stronę "Moja Pracownia"
2. System automatycznie:
   - Generuje identifier: `1234-moja_pracownia`
   - Generuje subdomenę: `1234-moja_pracownia.youreasysite.com`
   - Ustawia `is_published = False`
3. Odwiedzający `1234-moja_pracownia.youreasysite.com` widzą "Under Construction"
4. Właściciel pracuje w edytorze (widzi podgląd)
5. Właściciel klika "Publikuj"
6. System:
   - Ustawia `is_published = True`
   - Zapisuje `published_at`
   - Wywołuje Vercel build hook
7. Strona jest teraz publicznie dostępna

### Scenariusz 2: Re-publikacja

1. Strona już opublikowana (`is_published = True`)
2. Właściciel wprowadza zmiany
3. Właściciel klika "Publikuj" ponownie
4. System:
   - `is_published` pozostaje `True`
   - `published_at` NIE jest zmieniane (zachowuje pierwotną datę)
   - Wywołuje Vercel build hook
5. Zaktualizowana strona jest wdrożona

### Scenariusz 3: Cofnięcie publikacji (future feature)

Obecnie nie ma funkcji "unpublish", ale można dodać:

```python
@api_view(['POST'])
def unpublish_site(request, site_id):
    site = Site.objects.get(id=site_id, owner=request.user)
    site.is_published = False
    site.save()
    return Response({'message': 'Site unpublished'})
```

## Routing w różnych trybach

### Tryb subdomain (produkcja):
- URL: `https://1234-nazwa.youreasysite.com`
- SiteApp wykrywa subdomenę z `window.location.hostname`
- Pobiera konfigurację dla tej subdomeny

### Tryb path (development):
- URL: `http://localhost:3000/viewer/1234-nazwa`
- SiteApp pobiera identifier z routing params
- Używane lokalnie dla testowania

### Tryb SITE (Vercel deploy):
- URL: `https://1234-nazwa.vercel.app`
- Identifier z `VITE_SITE_ID` env variable
- Używane dla oddzielnych deploymentów Vercel

## Integracja z Vercel

Po kliknięciu "Publikuj", Vercel:

1. Otrzymuje webhook z `siteId` w query params
2. Uruchamia build z `VITE_SITE_ID={siteId}`
3. `SiteApp.jsx` w build time:
   - Pobiera `template_config` dla `siteId`
   - Sprawdza `is_published`
   - Generuje statyczny site

## Bezpieczeństwo

### Publiczne endpointy:
- `GET /api/v1/public-sites/{identifier}/` - **AllowAny**
  - Zawsze zwraca dane (nawet jeśli `is_published=False`)
  - Frontend decyduje co pokazać

### Chronione endpointy:
- `POST /api/v1/sites/{site_id}/publish/` - **IsAuthenticated + IsOwner**
  - Tylko właściciel może opublikować stronę

## Monitoring i Logi

### Backend logs:

```python
logger.info("Successfully published site ID %s (%s) - subdomain: %s", 
           site.id, site.identifier, site.subdomain)
```

### Kluczowe metryki do monitorowania:

- Liczba publikacji na dzień
- Czas między utworzeniem a pierwszą publikacją
- Strony niepublikowane >7 dni (abandoned)
- Błędy Vercel webhook

## Przyszłe ulepszenia

### 1. Własne domeny
Obecnie: `1234-nazwa.youreasysite.com`
Future: `www.mojadomena.pl` → wskazuje na tę samą stronę

### 2. Wersjonowanie publikacji
- Historia publikacji
- Rollback do poprzedniej wersji
- Preview URL dla każdej wersji

### 3. Zaplanowana publikacja
- `scheduled_publish_at` field
- Celery task publikuje automatycznie o zadanej godzinie

### 4. Draft mode
- Możliwość cofnięcia publikacji (`unpublish`)
- Strona wraca do "Under Construction"

### 5. Analytics
- Tracking kiedy strona po raz pierwszy otrzymała ruch
- Liczba odwiedzin strony "Under Construction" vs published

## Testowanie

### Test 1: Nowa strona pokazuje Under Construction

```bash
# 1. Utwórz nową stronę przez API
# 2. Sprawdź is_published = False
# 3. Otwórz subdomenę
# 4. Potwierź że widać UnderConstructionPage
```

### Test 2: Publikacja pokazuje prawdziwą stronę

```bash
# 1. Użyj strony z Test 1
# 2. POST /sites/{id}/publish/
# 3. Sprawdź is_published = True
# 4. Odśwież subdomenę
# 5. Potwierź że widać prawdziwą stronę
```

### Test 3: Re-publikacja nie zmienia published_at

```bash
# 1. Opublikuj stronę (zapisz published_at)
# 2. Zmodyfikuj template_config
# 3. Publikuj ponownie
# 4. Sprawdź że published_at się nie zmienił
```

### Test 4: Preview mode ignoruje is_published

```bash
# 1. Strona niepublikowana
# 2. Otwórz w edytorze (isPreview=true)
# 3. Potwierź że widać prawdziwą zawartość (nie Under Construction)
```

## FAQ

**Q: Co jeśli subdomena już istnieje?**  
A: Pole `subdomain` ma `unique=True`, więc Django rzuci `IntegrityError`. Funkcja `generate_site_identifier()` już generuje unikalne identifiers bazując na ID.

**Q: Czy mogę zmienić subdomenę ręcznie?**  
A: Nie, pole ma `editable=False`. Subdomena jest automatycznie generowana z identifier.

**Q: Co się stanie jeśli zmienię nazwę strony?**  
A: Subdomena zostanie zaktualizowana przy następnym `save()`. Stara subdomena przestanie działać.

**Q: Jak działa system z custom domains?**  
A: Obecnie system używa tylko subdomen `.youreasysite.com`. Custom domains są osobnym feature (DomainOrder model).

**Q: Czy strona Under Construction jest SEO-friendly?**  
A: Nie, ponieważ nie ma treści. Rozważ dodanie:
- Meta robots "noindex, nofollow"
- Schema.org WebSite markup z status "coming soon"

## Powiązane pliki

### Backend:
- `BACKEND/api/models.py` - Model Site z nowymi polami
- `BACKEND/api/serializers.py` - Serializers (Site, PublicSite)
- `BACKEND/api/views.py` - Endpoint `publish_site()`
- `BACKEND/api/migrations/0014_add_site_publication_fields.py` - Migracja

### Frontend:
- `FRONTEND/src/SITES/SiteApp.jsx` - Główna logika routingu
- `FRONTEND/src/SITES/pages/UnderConstructionPage.jsx` - Strona Under Construction
- `FRONTEND/src/services/apiClient.js` - API client

### Dokumentacja:
- `Z_DOKUMENTACJA/SUBDOMAIN_PUBLICATION_SYSTEM.md` - Ten plik
- `Z_DOKUMENTACJA/HOSTING_MECHANISM.md` - Hosting overview
- `Z_DOKUMENTACJA/DOMAIN_SYSTEM.md` - Custom domains
