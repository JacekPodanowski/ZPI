# SSL Wildcard Certificate Setup for Subdomains

## Quick Setup Guide

### Prerequisites
- Cloudflare API Token with DNS edit permissions
- Root access to server
- Domain: `youreasysite.pl`

### Step 1: Install Certbot with Cloudflare Plugin

```bash
# Install Certbot and Cloudflare DNS plugin
pip install certbot certbot-dns-cloudflare

# Or using apt (Ubuntu/Debian)
apt-get update
apt-get install -y certbot python3-certbot-dns-cloudflare
```

### Step 2: Create Cloudflare Credentials File

```bash
# Create credentials file
cat > /root/cloudflare.ini <<EOF
# Cloudflare API token (NOT API key)
dns_cloudflare_api_token = YOUR_CLOUDFLARE_API_TOKEN_HERE
EOF

# Secure the file (important!)
chmod 600 /root/cloudflare.ini
```

**Get your API token:**
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use template: "Edit zone DNS"
4. Select zone: `youreasysite.pl`
5. Copy the token

### Step 3: Obtain Wildcard Certificate

```bash
# Request wildcard certificate
certbot certonly \
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
```

**What this does:**
- Creates SSL certificate for:
  - `youreasysite.pl` (main domain)
  - `*.youreasysite.pl` (ALL subdomains)
  - `www.youreasysite.pl` (www)
  - `api.youreasysite.pl` (API subdomain)
- Uses Cloudflare DNS-01 challenge (works even if ports 80/443 blocked)
- Waits 60 seconds for DNS propagation
- Stores certificate in `/etc/letsencrypt/live/youreasysite.pl/`

### Step 4: Verify Certificate

```bash
# Check certificate files exist
ls -la /etc/letsencrypt/live/youreasysite.pl/

# Should show:
# - cert.pem        (certificate only)
# - chain.pem       (intermediate certificates)
# - fullchain.pem   (cert + chain) ← USE THIS
# - privkey.pem     (private key)  ← USE THIS

# Check certificate details
openssl x509 -in /etc/letsencrypt/live/youreasysite.pl/fullchain.pem -text -noout

# Verify wildcard is included
openssl x509 -in /etc/letsencrypt/live/youreasysite.pl/fullchain.pem -text -noout | grep DNS:
# Should show:
# DNS:youreasysite.pl, DNS:*.youreasysite.pl, DNS:www.youreasysite.pl, DNS:api.youreasysite.pl
```

### Step 5: Configure Nginx

Your `nginx.conf` should already have:

```nginx
server {
    listen 443 ssl http2;
    server_name ~^(?<subdomain>.+)\.youreasysite\.pl$;
    
    ssl_certificate /etc/letsencrypt/live/youreasysite.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/youreasysite.pl/privkey.pem;
    
    # ... rest of config
}
```

**Restart Nginx:**
```bash
docker-compose restart nginx

# Or if Nginx is standalone
nginx -t && nginx -s reload
```

### Step 6: Setup Auto-Renewal

Certbot certificates expire every 90 days. Set up automatic renewal:

```bash
# Test renewal process (dry run)
certbot renew --dry-run

# Add to crontab for automatic renewal
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * certbot renew --quiet --post-hook "docker-compose -f /path/to/docker-compose.yml restart nginx"
```

**Or use systemd timer:**
```bash
# Enable certbot timer (if using system package)
systemctl enable certbot.timer
systemctl start certbot.timer

# Check status
systemctl status certbot.timer
```

### Step 7: Test Subdomains

```bash
# Test main domain
curl -I https://youreasysite.pl

# Test subdomain (should work!)
curl -I https://101-test.youreasysite.pl

# Test SSL certificate
echo | openssl s_client -servername 101-test.youreasysite.pl -connect youreasysite.pl:443 2>/dev/null | openssl x509 -noout -text | grep DNS:
```

## Troubleshooting

### Error: "Wildcard domain not in certificate"
**Problem:** Certificate doesn't include `*.youreasysite.pl`

**Fix:**
```bash
# Delete old certificate
certbot delete --cert-name youreasysite.pl

# Re-issue with wildcard
certbot certonly --dns-cloudflare --dns-cloudflare-credentials /root/cloudflare.ini -d youreasysite.pl -d *.youreasysite.pl -d www.youreasysite.pl -d api.youreasysite.pl
```

### Error: "DNS propagation timeout"
**Problem:** Cloudflare DNS update too slow

**Fix:**
```bash
# Increase propagation wait time
certbot certonly \
  --dns-cloudflare \
  --dns-cloudflare-credentials /root/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 120 \
  -d youreasysite.pl -d *.youreasysite.pl
```

### Error: "Permission denied"
**Problem:** Nginx can't read certificate files

**Fix:**
```bash
# Check permissions
ls -la /etc/letsencrypt/live/youreasysite.pl/
ls -la /etc/letsencrypt/archive/youreasysite.pl/

# Fix permissions
chmod 644 /etc/letsencrypt/archive/youreasysite.pl/*.pem
chmod 755 /etc/letsencrypt/live/
chmod 755 /etc/letsencrypt/archive/
```

### Error: "Nginx can't find certificate"
**Problem:** Certificate path wrong in docker-compose

**Fix:** Mount certificate directory in `docker-compose.prod.yml`:
```yaml
nginx:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

## Google Cloud Specific Notes

### If using Google Cloud VM:

1. **Firewall rules:**
```bash
# Allow HTTPS
gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --source-ranges 0.0.0.0/0

# Allow HTTP (for redirect)
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --source-ranges 0.0.0.0/0
```

2. **Install Certbot:**
```bash
# On Google Cloud VM
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-dns-cloudflare
```

3. **Persistent storage:**
```bash
# Ensure /etc/letsencrypt is on persistent disk
# NOT in container volume (will be lost on restart)
```

4. **Automatic renewal with systemd:**
```bash
# Check if certbot timer is enabled
systemctl list-timers | grep certbot

# If not, enable it
systemctl enable certbot.timer
systemctl start certbot.timer
```

## Certificate Renewal

### Manual Renewal
```bash
# Renew all certificates
certbot renew

# Renew specific certificate
certbot renew --cert-name youreasysite.pl

# Force renewal (even if not expiring soon)
certbot renew --force-renewal
```

### Check Certificate Expiry
```bash
# Check when certificate expires
certbot certificates

# Check specific certificate
openssl x509 -in /etc/letsencrypt/live/youreasysite.pl/fullchain.pem -noout -dates
```

### Post-Renewal Hook
```bash
# Create renewal hook script
cat > /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh <<EOF
#!/bin/bash
docker-compose -f /root/ZPI/docker-compose.yml restart nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
```

## Security Best Practices

1. **Keep credentials secure:**
```bash
chmod 600 /root/cloudflare.ini
```

2. **Use strong SSL configuration** (already in nginx.conf):
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
```

3. **Enable HSTS:**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

4. **Monitor certificate expiry:**
```bash
# Get expiry date
certbot certificates | grep Expiry
```

## Quick Command Reference

```bash
# Obtain wildcard cert
certbot certonly --dns-cloudflare --dns-cloudflare-credentials /root/cloudflare.ini -d youreasysite.pl -d *.youreasysite.pl

# Renew all certs
certbot renew

# List certificates
certbot certificates

# Delete certificate
certbot delete --cert-name youreasysite.pl

# Test Nginx config
nginx -t

# Reload Nginx
docker-compose restart nginx

# Check certificate details
openssl x509 -in /etc/letsencrypt/live/youreasysite.pl/fullchain.pem -text -noout

# Test HTTPS
curl -I https://101-test.youreasysite.pl
```

---

**Status:** ✅ Ready for deployment
**Last Updated:** November 25, 2025
