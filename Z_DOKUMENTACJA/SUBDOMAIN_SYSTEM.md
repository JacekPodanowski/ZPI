# Subdomain System Documentation

## Overview
Every Site in the system automatically gets a subdomain in format: `{site_id}-{slug}.youreasysite.pl`

Example: Site with ID 101 and slug "test" → `101-test.youreasysite.pl`

## Architecture

### 1. Database (Site Model)
```python
class Site(models.Model):
    identifier = models.CharField(max_length=255, unique=True)  # Auto-generated: "101-test"
    subdomain = models.CharField(max_length=255, unique=True, blank=True)  # "101-test.youreasysite.pl"
    is_published = models.BooleanField(default=False)  # Publication status
    published_at = models.DateTimeField(null=True, blank=True)  # Publication timestamp
```

**Automatic Generation:**
- When a Site is saved, `subdomain` is auto-generated from `identifier`
- Format: `{identifier}.youreasysite.pl`
- Example: `101-test` → `101-test.youreasysite.pl`

### 2. DNS (Cloudflare)
**Wildcard DNS Record:**
```
Type: CNAME
Name: *.youreasysite.pl
Target: youreasysite.pl
Proxied: Yes (SSL + DDoS protection)
TTL: Auto
```

**Created by:** `BACKEND/setup_wildcard_dns.py`

**What it does:**
- All subdomains (`*.youreasysite.pl`) automatically resolve to main domain
- Cloudflare provides SSL certificate for wildcard
- No need to create individual DNS records per site

### 3. Nginx (Reverse Proxy)
**Configuration:** `nginx.conf`

**Subdomain Handler:**
```nginx
server {
    listen 443 ssl http2;
    server_name ~^(?<subdomain>.+)\.youreasysite\.pl$;
    
    ssl_certificate /etc/letsencrypt/live/youreasysite.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/youreasysite.pl/privkey.pem;
    
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        # ... other proxy headers
    }
}
```

**What it does:**
- Matches any subdomain: `*.youreasysite.pl` (except `api` and `www`)
- Proxies all requests to frontend container
- Passes `Host` header so frontend knows which subdomain was requested

### 4. Frontend (React)
**Configuration:** `docker-compose.yml`
```yaml
environment:
  - VITE_APP_ROUTING_MODE=subdomain
  - VITE_BUILD_TARGET=STUDIO
```

**Routing Logic:** `FRONTEND/src/main.jsx`
```javascript
const hostname = window.location.hostname;
const isStudioDomain = hostname === 'youreasysite.pl' || 
                       hostname === 'www.youreasysite.pl' ||
                       hostname.startsWith('studio.');

const renderSiteDirectly = routingMode === 'subdomain' && !isStudioDomain;

if (renderSiteDirectly) {
  // Render SiteApp for user sites
  root.render(<SiteApp />);
} else {
  // Render Studio for main domain
  root.render(<App />);
}
```

**Site Loading:** `FRONTEND/src/SITES/SiteApp.jsx`
```javascript
// Extract subdomain from hostname
const hostname = window.location.hostname;
const parts = hostname.split('.');
const identifier = parts[0];  // "101-test"

// Fetch site config from API
const siteData = await fetchPublicSiteConfig(identifier);

// Check publication status
if (!siteData.is_published) {
  return <UnderConstructionPage />;
}

// Render site
return <SiteContent config={siteData.template_config} />;
```

## Publication Workflow

### Before Publication (Default State)
1. Site created with `is_published = False`
2. Subdomain generated automatically
3. User visits subdomain → sees "Under Construction" page
4. Beautiful animated page with site name

### After Publication
1. User clicks "Publish" in editor
2. API endpoint: `POST /api/v1/sites/{id}/publish/`
3. Backend updates:
   - `is_published = True`
   - `published_at = now()`
4. User visits subdomain → sees actual site content

### Under Construction Page
**Component:** `FRONTEND/src/SITES/pages/UnderConstructionPage.jsx`

**Features:**
- Animated particles background
- Rotating logo with glow effect
- Gradient title with site name
- Loading dots animation
- Dark theme (matches YourEasySite branding)
- Crimson Red accent color (#920020)

## SSL Certificate

### Wildcard Certificate Required
The SSL certificate MUST cover wildcard subdomains:

```bash
# Using Certbot with Cloudflare DNS plugin
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /path/to/cloudflare.ini \
  -d youreasysite.pl \
  -d *.youreasysite.pl \
  -d www.youreasysite.pl \
  -d api.youreasysite.pl
```

**Certificate locations:**
- Fullchain: `/etc/letsencrypt/live/youreasysite.pl/fullchain.pem`
- Private key: `/etc/letsencrypt/live/youreasysite.pl/privkey.pem`

**Auto-renewal:**
```bash
# Add to crontab
0 0 * * * certbot renew --quiet
```

## API Endpoints

### Get Site Config (Public)
```
GET /api/v1/public-sites/{identifier}/

Response:
{
  "id": 101,
  "name": "Test Site",
  "identifier": "101-test",
  "subdomain": "101-test.youreasysite.pl",
  "is_published": false,
  "published_at": null,
  "template_config": { ... }
}
```

### Publish Site
```
POST /api/v1/sites/{id}/publish/

Response:
{
  "success": true,
  "message": "Site published successfully",
  "subdomain": "101-test.youreasysite.pl",
  "is_published": true,
  "published_at": "2025-11-25T10:30:00Z"
}
```

## Deployment Instructions

### 1. Setup Wildcard DNS (One-time)
```bash
docker-compose exec backend python setup_wildcard_dns.py
```

**Verifies:**
- ✅ Cloudflare API token valid
- ✅ Zone ID found for youreasysite.pl
- ✅ Wildcard CNAME record created

### 2. Configure SSL Certificate
```bash
# Install Certbot Cloudflare plugin
pip install certbot-dns-cloudflare

# Create Cloudflare credentials file
cat > /root/cloudflare.ini <<EOF
dns_cloudflare_api_token = YOUR_CLOUDFLARE_API_TOKEN
EOF

chmod 600 /root/cloudflare.ini

# Obtain wildcard certificate
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/cloudflare.ini \
  -d youreasysite.pl \
  -d *.youreasysite.pl \
  -d www.youreasysite.pl \
  -d api.youreasysite.pl
```

### 3. Update Nginx Config
Already configured in `nginx.conf` with wildcard server block.

### 4. Deploy with Docker Compose
```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Restart Nginx to apply changes
docker-compose restart nginx
```

### 5. Verify DNS Resolution
```bash
# Test subdomain resolves
nslookup 101-test.youreasysite.pl

# Test HTTPS works
curl -I https://101-test.youreasysite.pl
```

## Testing

### Test Under Construction Page
1. Create new site (auto-creates subdomain)
2. Visit subdomain → should see "Under Construction"
3. Verify site name appears correctly
4. Check animations work

### Test Publication
1. Open site in editor
2. Make changes, click "Publish"
3. Visit subdomain → should see actual site
4. Verify `is_published = true` in database

### Test Unpublish (if needed)
```python
# In Django shell
site = Site.objects.get(id=101)
site.is_published = False
site.save()
```
Visit subdomain → should return to "Under Construction"

## Troubleshooting

### Subdomain doesn't resolve
**Check:**
1. Wildcard DNS exists in Cloudflare: `*.youreasysite.pl`
2. DNS propagation (can take 5 minutes)
3. Cloudflare proxy enabled (orange cloud)

**Fix:**
```bash
# Re-run DNS setup
docker-compose exec backend python setup_wildcard_dns.py
```

### SSL certificate error
**Check:**
1. Certificate includes wildcard: `*.youreasysite.pl`
2. Certificate not expired
3. Nginx has correct cert paths

**Fix:**
```bash
# Renew certificate
certbot renew --force-renewal
docker-compose restart nginx
```

### Shows 404 or wrong site
**Check:**
1. Frontend environment: `VITE_APP_ROUTING_MODE=subdomain`
2. Nginx proxy_set_header includes `Host`
3. Site identifier matches subdomain

**Debug:**
```bash
# Check frontend logs
docker-compose logs studio-frontend

# Check Nginx logs
docker-compose logs nginx

# Check what hostname frontend sees
curl -H "Host: 101-test.youreasysite.pl" http://localhost:3000
```

### Under Construction page not showing
**Check:**
1. `is_published = False` in database
2. Frontend not in preview mode
3. SiteApp.jsx checks `isPublished`

**Fix:**
```bash
# Check database
docker-compose exec backend python manage.py shell
>>> Site.objects.get(id=101).is_published
False
```

## Performance Notes

- **DNS propagation:** Instant (Cloudflare proxy mode)
- **SSL termination:** Nginx (hardware accelerated)
- **Static caching:** Aggressive (1 year for assets)
- **HTML caching:** Disabled (dynamic content)

## Security

- **HTTPS:** Enforced (HTTP redirects to HTTPS)
- **SSL:** Wildcard certificate from Let's Encrypt
- **Headers:** X-Frame-Options, X-XSS-Protection, etc.
- **Rate limiting:** Applied on API subdomain
- **DDoS protection:** Cloudflare proxy enabled

## Future Enhancements

- [ ] Custom domain per site (CNAME to subdomain)
- [ ] Preview mode with temporary URLs
- [ ] Site analytics per subdomain
- [ ] Subdomain history/audit log
- [ ] A/B testing with different subdomains

---

**Last Updated:** November 25, 2025
**Status:** ✅ Implemented and deployed
