# Subdomain System - Deployment Checklist

## 🎯 Quick Deployment Guide for Google Cloud

### ✅ Completed (Already Done)
- [x] Database migration (added `subdomain`, `is_published`, `published_at` fields)
- [x] Wildcard DNS in Cloudflare (`*.youreasysite.pl` → `youreasysite.pl`)
- [x] Nginx configuration (wildcard subdomain handler)
- [x] Docker Compose environment variables
- [x] Frontend routing logic (subdomain mode)
- [x] Under Construction page component
- [x] Publish API endpoint
- [x] Fixed .com → .pl domain references

### 🔧 Deploy to Google Cloud (Do This Now)

#### 1. SSL Wildcard Certificate (CRITICAL!)

```bash
# SSH into your Google Cloud VM
gcloud compute ssh your-vm-name

# Install Certbot with Cloudflare plugin
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-dns-cloudflare

# Create Cloudflare credentials file
sudo cat > /root/cloudflare.ini <<EOF
dns_cloudflare_api_token = YOUR_CLOUDFLARE_API_TOKEN
EOF

sudo chmod 600 /root/cloudflare.ini

# Obtain wildcard certificate
sudo certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 60 \
  -d youreasysite.pl \
  -d *.youreasysite.pl \
  -d www.youreasysite.pl \
  -d api.youreasysite.pl \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Verify certificate includes wildcard
sudo openssl x509 -in /etc/letsencrypt/live/youreasysite.pl/fullchain.pem -text -noout | grep DNS:
# Should show: DNS:youreasysite.pl, DNS:*.youreasysite.pl, ...
```

**Get Cloudflare API Token:**
1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Create Token → Use template "Edit zone DNS"
3. Select zone: `youreasysite.pl`
4. Copy token

#### 2. Update Code on Server

```bash
# Navigate to project directory
cd /path/to/ZPI

# Pull latest changes
git pull origin main

# Verify files updated
cat nginx.conf | grep "server_name ~"
# Should show: server_name ~^(?<subdomain>.+)\.youreasysite\.pl$;
```

#### 3. Rebuild and Restart Services

```bash
# Stop all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Rebuild with new configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Check all services running
docker-compose ps

# Check logs for errors
docker-compose logs -f --tail=50
```

#### 4. Verify Deployment

```bash
# Test main domain
curl -I https://youreasysite.pl
# Should return 200 OK

# Test API subdomain
curl -I https://api.youreasysite.pl
# Should return 200 OK

# Test user subdomain (use actual site)
curl -I https://101-test.youreasysite.pl
# Should return 200 OK (shows Under Construction or published site)

# Check SSL certificate covers wildcard
echo | openssl s_client -servername 101-test.youreasysite.pl -connect youreasysite.pl:443 2>/dev/null | openssl x509 -noout -text | grep DNS:
# Should show *.youreasysite.pl
```

#### 5. Setup Auto-Renewal for SSL

```bash
# Add cron job for certificate renewal
sudo crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * certbot renew --quiet --post-hook "cd /path/to/ZPI && docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx"

# Test renewal process (dry run)
sudo certbot renew --dry-run
```

### 🧪 Testing Checklist

#### Test 1: New Site Creation
```bash
# Create new site via API or Studio
# Check subdomain auto-generated in database
docker-compose exec backend python manage.py shell
>>> from api.models import Site
>>> site = Site.objects.latest('id')
>>> print(site.subdomain)
# Should print: "XXX-slug.youreasysite.pl"
```

#### Test 2: Under Construction Page
1. Visit subdomain of unpublished site
2. Should see animated "Under Construction" page
3. Site name should appear in title
4. Animations should work (particles, rotating logo)

#### Test 3: Publish Site
1. Open site in editor
2. Click "Publish" button
3. Backend should set `is_published = True`
4. Visit subdomain → should show actual site content (not Under Construction)

#### Test 4: Different Subdomains
```bash
# Test multiple sites work simultaneously
curl -I https://101-test.youreasysite.pl
curl -I https://102-another.youreasysite.pl
curl -I https://999-demo.youreasysite.pl

# Each should load correct site
```

#### Test 5: SSL Certificate
```bash
# Test wildcard SSL works
for subdomain in 101-test 102-another 999-demo; do
  echo "Testing $subdomain.youreasysite.pl"
  curl -I https://$subdomain.youreasysite.pl 2>&1 | grep "200 OK"
done
```

### 🐛 Troubleshooting

#### Problem: Subdomain doesn't resolve
**Check:**
```bash
# Verify wildcard DNS exists
nslookup 101-test.youreasysite.pl
# Should resolve to youreasysite.pl IP

# Check Cloudflare DNS records
# Should have: *.youreasysite.pl CNAME youreasysite.pl (Proxied)
```

**Fix:**
```bash
# Re-run DNS setup
docker-compose exec backend python setup_wildcard_dns.py
```

#### Problem: SSL certificate error
**Check:**
```bash
# Verify certificate includes wildcard
sudo openssl x509 -in /etc/letsencrypt/live/youreasysite.pl/fullchain.pem -text -noout | grep DNS:

# Check Nginx can read certificate
sudo ls -la /etc/letsencrypt/live/youreasysite.pl/
```

**Fix:**
```bash
# Re-issue certificate with wildcard
sudo certbot delete --cert-name youreasysite.pl
sudo certbot certonly --dns-cloudflare --dns-cloudflare-credentials /root/cloudflare.ini -d youreasysite.pl -d *.youreasysite.pl -d www.youreasysite.pl -d api.youreasysite.pl
docker-compose restart nginx
```

#### Problem: Shows 404 or wrong site
**Check:**
```bash
# Verify frontend environment
docker-compose exec studio-frontend env | grep VITE
# Should show: VITE_APP_ROUTING_MODE=subdomain

# Check Nginx logs
docker-compose logs nginx | tail -50

# Check frontend logs
docker-compose logs studio-frontend | tail -50
```

**Fix:**
```bash
# Rebuild frontend with correct env
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build studio-frontend
```

#### Problem: Under Construction page not showing
**Check:**
```bash
# Verify site is unpublished
docker-compose exec backend python manage.py shell
>>> from api.models import Site
>>> site = Site.objects.get(id=101)
>>> print(site.is_published)
# Should print: False
```

**Fix:**
```bash
# Unpublish site
>>> site.is_published = False
>>> site.save()
```

### 📊 Monitoring

```bash
# Watch logs in real-time
docker-compose logs -f

# Check Nginx access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log

# Check backend logs
docker-compose logs backend | grep ERROR

# Monitor SSL certificate expiry
sudo certbot certificates
```

### 🔄 Rollback (If Needed)

```bash
# Stop services
docker-compose down

# Checkout previous version
git checkout HEAD~1

# Rebuild
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 📝 Documentation References

- **Full System:** `/Z_DOKUMENTACJA/SUBDOMAIN_SYSTEM.md`
- **SSL Setup:** `/Z_DOKUMENTACJA/SSL_WILDCARD_SETUP.md`
- **DNS Setup:** `/BACKEND/setup_wildcard_dns.py`
- **Under Construction:** `/FRONTEND/src/SITES/pages/UnderConstructionPage.jsx`

---

## ⏱️ Estimated Time

- SSL Certificate Setup: **10 minutes**
- Code Deployment: **5 minutes**
- Testing: **10 minutes**
- **Total: ~25 minutes**

## 🎉 Success Criteria

- [ ] SSL wildcard certificate obtained
- [ ] All services running (docker-compose ps shows "Up")
- [ ] Main domain works: `https://youreasysite.pl`
- [ ] API works: `https://api.youreasysite.pl`
- [ ] Test subdomain loads: `https://101-test.youreasysite.pl`
- [ ] Under Construction page shows for unpublished sites
- [ ] Published sites show actual content
- [ ] SSL certificate valid for all subdomains
- [ ] Auto-renewal configured

---

**Status:** 🚀 Ready to Deploy
**Last Updated:** November 25, 2025
