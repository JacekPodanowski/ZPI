# Domain Checking System - NameSilo Integration

## Overview
The domain checking system allows users to search for available domains and purchase them directly through NameSilo. The system checks multiple TLDs (Top-Level Domains) simultaneously and displays pricing information.

## Setup Instructions

### 1. Register for NameSilo API

1. Go to [namesilo.com](https://www.namesilo.com) and create an account
2. Navigate to **Account → API Manager**
3. Click **Generate New API Key**
4. Copy the generated API key

### 2. Configure Environment Variables

Add the following to your backend `.env` file:

```bash
# NameSilo API Configuration
NAMESILO_API_KEY=your_api_key_here
```

**Important:** The API key should be kept secret and never committed to version control.

### 3. Restart Backend Server

After adding the environment variable, restart your Django backend:

```bash
# If using Docker
docker-compose restart backend

# If running locally
python manage.py runserver
```

## How It Works

### User Flow

1. **User navigates to Domain page** (`/studio/domain/{siteId}`)
2. **User enters domain name** (e.g., "mybusiness")
3. **System checks availability** across multiple TLDs:
   - .com
   - .net
   - .org
   - .io
   - .dev
   - .app
   - .tech
   - .store
   - .online
4. **Results displayed** with:
   - Domain name
   - Availability status
   - Registration price
   - Renewal price
   - "Buy Now" button linking to NameSilo
5. **User purchases** directly on NameSilo (opens in new tab)

### Technical Flow

```
Frontend (DomainPage.jsx)
    ↓
    → calls checkDomainAvailability(domain)
    ↓
domainService.js
    ↓
    → GET /api/v1/domains/check-availability/?domain=mybusiness
    ↓
Backend (check_domain_availability view)
    ↓
    → Validates domain name
    → Loops through TLDs
    → Calls NameSilo API for each TLD
    → Parses XML response
    → Filters available domains
    → Sorts by price
    ↓
Returns JSON array of available domains
    ↓
Frontend displays results in cards
```

## API Endpoints

### Check Domain Availability

**Endpoint:** `GET /api/v1/domains/check-availability/`

**Authentication:** Required (JWT)

**Query Parameters:**
- `domain` (required): Domain name without TLD (e.g., "mybusiness")

**Response:**
```json
[
  {
    "domain": "mybusiness.com",
    "tld": "com",
    "available": true,
    "price": "12.95",
    "renewalPrice": "12.95",
    "purchaseUrl": "https://www.namesilo.com/domain/search-domains?query=mybusiness.com"
  },
  {
    "domain": "mybusiness.io",
    "tld": "io",
    "available": true,
    "price": "34.99",
    "renewalPrice": "34.99",
    "purchaseUrl": "https://www.namesilo.com/domain/search-domains?query=mybusiness.io"
  }
]
```

### Get Domain Pricing

**Endpoint:** `GET /api/v1/domains/pricing/`

**Authentication:** Required (JWT)

**Query Parameters:**
- `tld` (required): Top-level domain (e.g., "com", "io")

**Response:**
```json
{
  "tld": "com",
  "registration": "12.95",
  "renewal": "12.95"
}
```

## Features

### Frontend Features
- ✅ Clean, modern UI using new REAL_DefaultLayout
- ✅ Gradient title with animations
- ✅ Real-time domain search
- ✅ Loading states during search
- ✅ Error handling with user-friendly messages
- ✅ Domain cards with hover effects
- ✅ Responsive grid layout
- ✅ Direct purchase links to NameSilo
- ✅ Current site URL display
- ✅ Sorted results (cheapest first)

### Backend Features
- ✅ NameSilo API integration
- ✅ XML parsing (built-in Python library)
- ✅ Domain name validation
- ✅ Multiple TLD checking
- ✅ Error handling and logging
- ✅ Timeout protection
- ✅ Authentication required
- ✅ Price sorting

## Security Considerations

1. **API Key Protection:** Never expose the NameSilo API key in frontend code
2. **Authentication:** All endpoints require user authentication
3. **Input Validation:** Domain names are validated for security
4. **Rate Limiting:** Consider adding rate limiting for production
5. **Timeout Protection:** API calls have 10-second timeout

## Pricing Information

- Prices are in **USD ($)**
- NameSilo API is **free** with no rate limits
- Prices vary by TLD (typically $8-40/year)
- Registration and renewal prices may differ for some TLDs

## Purchase Process

1. User clicks "Buy Now" button
2. Opens NameSilo in new tab with pre-filled domain
3. User completes purchase on NameSilo:
   - Creates account (if new user)
   - Enters payment information
   - Completes checkout
4. User receives domain confirmation from NameSilo
5. User can configure domain settings on NameSilo

**Note:** We do NOT handle payments or store user payment information. All transactions are completed securely on NameSilo's platform.

## Optional Enhancements

### Caching (Recommended for Production)
Add Redis caching to avoid duplicate API calls:

```python
from django.core.cache import cache

# In check_domain_availability view
cache_key = f'domain_check_{domain}'
cached_result = cache.get(cache_key)

if cached_result:
    return Response(cached_result)

# ... perform API calls ...

cache.set(cache_key, results, timeout=300)  # Cache for 5 minutes
```

### Additional TLDs
Add more TLDs to check:
```python
tlds = ['com', 'net', 'org', 'io', 'dev', 'app', 'tech', 'store', 'online', 
        'co', 'me', 'ai', 'xyz', 'info', 'biz']
```

### Search History
Save user's domain searches:
```python
class DomainSearch(models.Model):
    user = models.ForeignKey(PlatformUser, on_delete=models.CASCADE)
    domain = models.CharField(max_length=255)
    searched_at = models.DateTimeField(auto_now_add=True)
```

### Multi-Registrar Comparison
Add support for other registrars (GoDaddy, Namecheap) to compare prices.

## Troubleshooting

### "Domain service not configured" Error
- Check that `NAMESILO_API_KEY` is set in `.env`
- Restart the backend server after adding the key

### No Results Returned
- Check NameSilo API status
- Verify API key is valid
- Check backend logs for errors

### Timeout Errors
- NameSilo API may be slow during peak times
- Timeout is set to 10 seconds per domain
- Consider implementing retry logic

## Testing

Test the system with these domain names:

- **Common names:** test, demo, example (likely taken)
- **Unique names:** myuniquebusiness2024, customsitename123 (likely available)
- **Invalid names:** -test, test-, test..com (should show validation error)

## Support

For NameSilo API documentation, visit:
https://www.namesilo.com/Support/API-Documentation

For issues with this implementation, check:
- Backend logs: `/var/log/django.log` or Docker logs
- Frontend console: Browser developer tools
- Network tab: Check API requests/responses
