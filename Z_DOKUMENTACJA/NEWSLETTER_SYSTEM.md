# Newsletter System Documentation

## Overview
System automatycznego wysyłania newsletterów z wydarzeniami dla użytkowników stron.

## Features

### Frontend
- **3 różne layouty Events modułu:**
  - **List**: Lista wydarzeń z szczegółami
  - **Timeline**: Oś czasu z wizualizacją dat, strzałkami i naprzemiennym układem
  - **Grid**: Siatka kart z badgami dat i ikonami lokalizacji

- **Automatyczne ukrywanie przeszłych wydarzeń:**
  - Wszystkie layouty filtrują wydarzenia starsze niż dzisiejsza data
  - Funkcja `isEventPast()` porównuje `event.date` z `today`

- **Formularz zapisu na newsletter:**
  - Komponent `NewsletterSubscription.jsx` zintegrowany we wszystkich layoutach
  - Pola: email, frequency (daily/weekly/monthly)
  - Walidacja emaila po stronie klienta
  - Feedback UI (loading, success, error states)

### Backend

#### Model: NewsletterSubscription
```python
class NewsletterSubscription(models.Model):
    site = ForeignKey(Site)
    email = EmailField()
    frequency = CharField(choices=['daily', 'weekly', 'monthly'])
    is_active = BooleanField(default=True)
    unsubscribe_token = CharField(max_length=64, unique=True)
    subscribed_at = DateTimeField(auto_now_add=True)
    last_sent_at = DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['site', 'email']
        indexes = [['site', 'is_active'], ['unsubscribe_token']]
```

#### API Endpoints

**POST /api/v1/newsletter/subscribe/**
- Zapis na newsletter
- Body: `{ site_identifier, email, frequency }`
- Zwraca: success message lub error
- Obsługuje reaktywację nieaktywnych subskrypcji

**GET /api/v1/newsletter/unsubscribe/<token>/**
- Wypisanie się z newslettera za pomocą magic link
- Parametr: `unsubscribe_token` (64 znaki)
- Ustawia `is_active = False`

#### Celery Periodic Task

**Task: `send_event_newsletters`**
- **Schedule**: Codziennie o 9:00 UTC (konfigurowane w `CELERY_BEAT_SCHEDULE`)
- **Logika:**
  1. Pobiera wszystkie aktywne subskrypcje (`is_active=True`)
  2. Dla każdej sprawdza czy czas wysłać na podstawie `frequency` i `last_sent_at`:
     - `daily`: co 24h
     - `weekly`: co 7 dni
     - `monthly`: co 30 dni
  3. Wyciąga wydarzenia z `template_config.site.pages[].modules[]` typu `events`
  4. Filtruje tylko nadchodzące wydarzenia (data >= dziś)
  5. Sortuje po dacie i limituje do 10 najnowszych
  6. Renderuje email template `emails/event_newsletter.html`
  7. Wysyła email przez `EmailMultiAlternatives`
  8. Aktualizuje `last_sent_at = now()`

#### Email Template
- Plik: `BACKEND/templates/emails/event_newsletter.html`
- Zawiera:
  - Header z nazwą strony
  - Badge częstotliwości newslettera
  - Lista wydarzeń (title, date, location, summary, tag)
  - Link do wypisania się (z `unsubscribe_token`)
- Style inline dla kompatybilności z klientami email

## Configuration

### Events Module Descriptor
```javascript
{
  type: 'events',
  fields: {
    title: { t: 'text', d: 'Tytuł sekcji' },
    subtitle: { t: 'text', d: 'Podtytuł' },
    events: { t: 'array', req: true, d: 'Lista wydarzeń' },
    showNewsletter: { t: 'boolean', d: 'Pokaż formularz zapisu na newsletter' },
    bgColor: { t: 'color' },
    accentColor: { t: 'color' },
    textColor: { t: 'color' }
  },
  layouts: ['list', 'grid', 'timeline']
}
```

### Celery Beat Schedule (settings.py)
```python
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'send-event-newsletters': {
        'task': 'api.tasks.send_event_newsletters',
        'schedule': crontab(hour='9', minute='0'),  # Daily at 9:00 AM UTC
    },
}
```

### Docker Services
Dodano serwis `celery-beat` w `docker-compose.yml`:
```yaml
celery-beat:
  build: ./BACKEND
  command: celery -A site_project beat --loglevel=info
  depends_on:
    - backend-setup
    - redis
```

## Usage

### Dla twórców stron (Creators)
1. Dodaj moduł Events do strony
2. W konfiguratorze ustaw `showNewsletter: true`
3. Wybierz layout (list/timeline/grid)
4. Dodaj wydarzenia z datami, lokalizacjami, opisami

### Dla odwiedzających (Clients)
1. Przewiń do sekcji Events
2. Wprowadź email w formularzu newslettera
3. Wybierz częstotliwość (codziennie/co tydzień/co miesiąc)
4. Kliknij "Zapisz się"
5. Otrzymuj emaile z nowymi wydarzeniami
6. Wypisz się klikając link w emailu

## Testing

### Manualne testowanie tasku:
```python
# Django shell
from api.tasks import send_event_newsletters
result = send_event_newsletters()
print(result)
```

### Sprawdzanie logów Celery Beat:
```bash
docker logs site777_celery_beat --tail 50
```

### Sprawdzanie subskrypcji w Admin Panel:
- URL: `/admin/api/newslettersubscription/`
- Widoczne: email, site, frequency, is_active, subscribed_at, last_sent_at

## Data Flow

```
User fills form → POST /api/v1/newsletter/subscribe/
                → NewsletterSubscription created
                → unsubscribe_token generated (64 chars)

Celery Beat (daily 9:00 UTC)
    → send_event_newsletters task
    → Check is_active subscriptions
    → Filter by frequency timing
    → Extract events from template_config
    → Filter upcoming events (date >= today)
    → Render email template
    → Send via SMTP
    → Update last_sent_at

User clicks unsubscribe link
    → GET /api/v1/newsletter/unsubscribe/<token>/
    → Set is_active = False
```

## Future Enhancements
- [x] Email confirmation (double opt-in)
- [x] Analytics (open rate, click rate)
- [ ] Event attachments (calendar .ics files)
- [ ] Customizable email templates per site
- [ ] A/B testing dla subject lines
- [ ] Segmentacja subskrybentów
- [ ] Personalizacja treści emaili

## Double Opt-In Flow

### 1. Subscription Process
1. User enters email and frequency on the site
2. Frontend calls `POST /api/v1/newsletter/subscribe/`
3. Backend creates `NewsletterSubscription` with:
   - `is_confirmed = False`
   - `is_active = False`
   - `confirmation_token` (64 chars, unique)
4. Confirmation email is sent with link to confirm

### 2. Confirmation Email
Template: `emails/newsletter_confirmation.html`
- Contains confirmation button/link
- Link format: `{BACKEND_URL}/api/v1/newsletter/confirm/{confirmation_token}/`
- Valid for 7 days (not enforced yet)

### 3. Confirmation
1. User clicks confirmation link
2. `GET /api/v1/newsletter/confirm/{token}/` endpoint is called
3. Backend updates subscription:
   - `is_confirmed = True`
   - `is_active = True`
   - `confirmed_at = now()`
4. User sees success message

### 4. Newsletter Sending
- Only sends to subscriptions where `is_confirmed = True` AND `is_active = True`
- Celery task filters: `.filter(is_active=True, is_confirmed=True)`

## Analytics System

### Models

#### NewsletterSubscription (updated)
```python
is_confirmed = BooleanField(default=False)
confirmation_token = CharField(max_length=64, unique=True)
confirmed_at = DateTimeField(null=True)
emails_sent = IntegerField(default=0)
emails_opened = IntegerField(default=0)
emails_clicked = IntegerField(default=0)
```

#### NewsletterAnalytics (new)
```python
subscription = ForeignKey(NewsletterSubscription)
sent_at = DateTimeField(auto_now_add=True)
opened_at = DateTimeField(null=True)
clicked_at = DateTimeField(null=True)
tracking_token = CharField(max_length=64, unique=True)
```

### Tracking Mechanisms

#### 1. Open Tracking (Pixel)
- Endpoint: `GET /api/v1/newsletter/track/open/{tracking_token}/`
- Method: Invisible 1x1 GIF pixel embedded in email
- Implementation:
  ```html
  <img src="{BACKEND_URL}/api/v1/newsletter/track/open/{token}/" width="1" height="1" style="display:none;">
  ```
- Updates:
  - `NewsletterAnalytics.opened_at = now()` (first open only)
  - `NewsletterSubscription.emails_opened += 1`

#### 2. Click Tracking (Link Wrapper)
- Endpoint: `GET /api/v1/newsletter/track/click/{tracking_token}/?url={original_url}`
- Method: Wrap all links in newsletter through tracking URL
- Redirects to original URL after recording click
- Updates:
  - `NewsletterAnalytics.clicked_at = now()` (first click only)
  - `NewsletterSubscription.emails_clicked += 1`

### Analytics Dashboard

#### Location
Available at: `/studio/lab/{site_id}` → "Newsletter Analytics" tab

#### Displayed Metrics

**Subscribers Overview:**
- Active subscribers (confirmed + active)
- Pending confirmation
- Frequency breakdown (daily/weekly/monthly)

**All-Time Stats:**
- Total emails sent
- Total emails opened
- Total emails clicked
- Open rate (%)
- Click rate (%)
- Click-to-open rate (%)

**Last 30 Days:**
- Emails sent
- Open rate (%)
- Click rate (%)

**Top Subscribers:**
- 5 most engaged subscribers
- Shows email, sent count, open rate, click rate

#### API Endpoint
`GET /api/v1/newsletter/stats/{site_id}/`
- Requires authentication
- Returns JSON with all stats
- Only accessible by site owner

### Admin Panel

#### NewsletterSubscription Admin
- Displays: email, site, frequency, is_active, is_confirmed, sent/opened/clicked counts, rates
- Calculated fields: `open_rate()`, `click_rate()`
- Read-only: tokens, dates, analytics counters

#### NewsletterAnalytics Admin  
- Displays: subscription email, sent_at, opened_at, clicked_at, is_opened, is_clicked
- Helps track individual email performance
- Useful for debugging tracking issues
