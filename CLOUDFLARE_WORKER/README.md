# Cloudflare Worker - Domain Proxy System

## Overview

This Cloudflare Worker enables automatic domain redirection for custom domains purchased by YourEasySite users. When a user visits their custom domain (e.g., `dronecomponentsfpv.online`), the worker queries the backend API and redirects them to the configured target URL.

## How It Works

1. **DNS Configuration**: Custom domain points to Cloudflare Worker IP via A record
2. **Worker Intercepts Request**: When someone visits the domain, the worker receives the request
3. **Backend Query**: Worker calls `/api/v1/domains/resolve/{domain}/` to get configuration
4. **Redirect**: Worker redirects user to the configured target URL (301 permanent redirect)

## Architecture

```
User visits: dronecomponentsfpv.online
    ↓
DNS A record → Cloudflare Worker IP
    ↓
Worker queries: https://136.115.41.232:8000/api/v1/domains/resolve/dronecomponentsfpv.online
    ↓
Backend responds: {"target": "youtube.com", "domain": "dronecomponentsfpv.online"}
    ↓
Worker redirects: https://youtube.com
```

## Deployment

### Prerequisites

1. Cloudflare account with Workers enabled
2. Domain configured in Cloudflare
3. Backend API accessible (https://136.115.41.232:8000)

### Deploy to Cloudflare

1. **Install Wrangler CLI** (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Create wrangler.toml** (if not exists):
   ```toml
   name = "youreasysite-domain-proxy"
   main = "worker.js"
   compatibility_date = "2024-01-01"
   
   [env.production]
   route = "*/*"
   ```

4. **Deploy the Worker**:
   ```bash
   cd CLOUDFLARE_WORKER
   wrangler deploy
   ```

5. **Configure Custom Routes**:
   - Go to Cloudflare Dashboard → Workers & Pages
   - Add routes for domains that should use this worker
   - Example: `*dronecomponentsfpv.online/*`

## Testing

### Test the Worker Directly

Visit: `https://youreasysite-domain-proxy.sbddomain.workers.dev/`

Expected response: `YourEasySite Domain Proxy - OK`

### Test with Custom Domain

1. **Configure a test domain** in the backend:
   - Set domain status to `active`
   - Set `target` field to `youtube.com` (for testing)

2. **Visit the domain**:
   ```
   http://your-test-domain.com
   ```

3. **Expected behavior**:
   - Redirects to `https://youtube.com`

## Backend Configuration

### Setting Target URL

Users can configure the target URL through the UI:

1. Navigate to **Settings → Orders**
2. Find the active domain order
3. Click **Edit** icon next to "Docelowy URL"
4. Enter target URL (e.g., `youtube.com` or `1234-mysite.youreasysite.com`)
5. Click **Save**

### API Endpoint

**GET** `/api/v1/domains/resolve/{domain}/`

**Response:**
```json
{
  "target": "youtube.com",
  "domain": "dronecomponentsfpv.online",
  "site_id": 123,
  "site_name": "My Site"
}
```

**Errors:**
- `404`: Domain not found or not active
- `500`: Internal server error

## Default Behavior

If no target URL is configured, the system automatically uses the site's subdomain:

```
domain.com → {site_identifier}.youreasysite.com
```

Example: `1234-mysite.youreasysite.com`

## Caching

The worker caches backend API responses for **5 minutes** to reduce load on the backend.

Cache behavior:
- First request: Queries backend
- Subsequent requests (within 5 min): Uses cached response
- After 5 min: Re-queries backend

## Monitoring

### Cloudflare Dashboard

Monitor worker performance in **Cloudflare Dashboard → Workers & Pages → Metrics**:

- Request count
- Success rate
- Error rate
- CPU time

### Worker Logs

View real-time logs:

```bash
wrangler tail
```

### Backend Logs

Check Django logs for API calls:

```bash
docker logs site777_django_app | grep "Domain Resolve"
```

## Troubleshooting

### Issue: "Domain not configured" (404)

**Possible causes:**
- Domain order doesn't exist in database
- Domain status is not `active`
- Domain name mismatch

**Solution:**
1. Check domain order in admin panel
2. Verify status is `active`
3. Check domain name spelling

### Issue: "Domain target not configured" (500)

**Possible causes:**
- Target field is empty or null
- Backend API error

**Solution:**
1. Set target URL in Settings → Orders
2. Check backend logs for errors

### Issue: Worker not redirecting

**Possible causes:**
- DNS not pointing to worker
- Route not configured in Cloudflare
- Cache issue

**Solution:**
1. Verify DNS A record points to Cloudflare Worker IP
2. Add route in Cloudflare Dashboard
3. Clear cache: `wrangler publish --env production`

## Security

- **Public Endpoint**: `/api/v1/domains/resolve/` is public (no auth required)
- **Read-Only**: Worker only reads data, cannot modify
- **Rate Limiting**: Consider adding rate limiting in production
- **SSL**: All redirects use HTTPS

## Development

### Local Testing

1. **Run worker locally**:
   ```bash
   wrangler dev
   ```

2. **Test with custom domain**:
   - Edit your hosts file to point test domain to localhost
   - Visit `http://test-domain.com:8787`

### Updating Worker

1. Modify `worker.js`
2. Deploy:
   ```bash
   wrangler deploy
   ```

## Configuration

### Change Backend API URL

Edit `worker.js`:

```javascript
const BACKEND_API = 'https://your-backend.com/api/v1/domains/resolve/';
```

### Adjust Cache TTL

Edit cache settings in `worker.js`:

```javascript
cf: {
  cacheTtl: 300,  // 5 minutes (300 seconds)
  cacheEverything: true,
}
```

## Support

For issues or questions:
- Check backend logs: `docker logs site777_django_app`
- Check worker logs: `wrangler tail`
- Review Cloudflare dashboard metrics
