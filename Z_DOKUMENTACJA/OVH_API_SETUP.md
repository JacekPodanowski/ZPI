# OVH API Configuration Guide

This document explains how to configure OVH API credentials for the domain management system.

## Why OVH API?

The application uses OVHcloud API to:
- Check domain availability across multiple TLDs (`.com`, `.net`, `.org`, `.io`, `.app`, `.online`, `.pl`)
- Get real-time domain pricing
- Purchase domains (when implemented with real payment)
- Configure DNS records automatically

## Step 1: Create OVH API Application

1. Go to: **https://eu.api.ovh.com/createApp/**
2. Fill in the form:
   - **Application name**: `YourEasySite Domain Manager`
   - **Application description**: `Domain management for YourEasySite platform`
3. Click **Create keys**
4. Save the generated credentials:
   - **Application Key** (AK)
   - **Application Secret** (AS)

## Step 2: Generate Consumer Key with Required Permissions

1. Go to: **https://eu.api.ovh.com/createToken/**
2. Fill in your **Application Key** and **Application Secret**
3. Set **Validity**: `Unlimited`
4. Add the following **Access rules**:

```
GET     /me
POST    /order/cart
POST    /order/cart/*/assign
POST    /order/cart/*/domain
POST    /order/cart/*/checkout
GET     /order/cart/*/domain
DELETE  /order/cart/*
GET     /domain/*/redirection
POST    /domain/*/redirection
DELETE  /domain/*/redirection/*
POST    /domain/zone/*/record
POST    /domain/zone/*/refresh
GET     /domain/zone/*/record
DELETE  /domain/zone/*/record/*
```

5. Click **Create keys**
6. **Important**: Copy the generated **Consumer Key** (CK) immediately - it's only shown once!

## Step 3: Configure Backend Environment Variables

Add the following to your `BACKEND/.env` file:

```env
# OVH API Configuration
OVH_ENDPOINT=ovh-eu
OVH_APPLICATION_KEY=your_application_key_here
OVH_APPLICATION_SECRET=your_application_secret_here
OVH_CONSUMER_KEY=your_consumer_key_here

# Domain Configuration
DOMAIN_TARGET_ADDRESS=youreasysite-production.up.railway.app
```

### Environment Variable Explanations:

- **OVH_ENDPOINT**: API endpoint region (`ovh-eu` for Europe, `ovh-ca` for Canada, `ovh-us` for USA)
- **OVH_APPLICATION_KEY**: Your application key from Step 1
- **OVH_APPLICATION_SECRET**: Your application secret from Step 1
- **OVH_CONSUMER_KEY**: Your consumer key from Step 2
- **DOMAIN_TARGET_ADDRESS**: The address where domains should point (your app's hostname)

## Step 4: Restart Backend Services

After updating `.env`, restart your Docker containers:

```bash
docker-compose down
docker-compose up -d --build
```

## Step 5: Configure OVH Payment Webhook (Production Only)

**Note**: This step is only needed in production. OVH webhooks require a publicly accessible URL.

### Webhook Endpoint

The application provides a webhook endpoint to receive payment notifications from OVH:

```
POST https://your-backend-domain.com/api/v1/domains/webhook/ovh/
```

### Webhook Configuration

OVH does not have a built-in webhook configuration interface. Instead, you have two options:

#### Option A: Manual Order Status Polling (Recommended for MVP)

The current implementation handles payment confirmation through:
1. User completes payment on OVH
2. User manually returns to the domain management page
3. Application displays order status from database
4. Backend can poll OVH API for order status updates using:
   ```python
   client.get(f'/me/order/{ovh_order_id}/status')
   ```

#### Option B: OVH Webhook Integration (Future Enhancement)

For automated payment notifications:
1. Contact OVH support to enable webhook notifications
2. Provide them with your webhook URL: `https://your-backend.com/api/v1/domains/webhook/ovh/`
3. Configure webhook to send POST requests on order status changes
4. Ensure webhook endpoint is accessible (not behind authentication)

### Testing Webhook Locally

For local development testing:

1. Install ngrok: https://ngrok.com/
2. Start ngrok tunnel:
   ```bash
   ngrok http 8000
   ```
3. Use the ngrok URL for testing:
   ```
   https://abc123.ngrok.io/api/v1/domains/webhook/ovh/
   ```
4. Test webhook with curl:
   ```bash
   curl -X POST https://abc123.ngrok.io/api/v1/domains/webhook/ovh/ \
     -H "Content-Type: application/json" \
     -d '{"orderId": 12345678, "status": "paid"}'
   ```

### Webhook Payload Format

Expected payload from OVH:
```json
{
  "orderId": 12345678,
  "status": "paid"
}
```

Supported status values:
- `paid`: Payment completed, triggers DNS configuration
- `delivered`: Order delivered (also triggers DNS config)
- `complete`: Order fully completed (also triggers DNS config)

## Testing the Configuration

1. Log in to your application
2. Go to any site's domain management page
3. Search for a domain (e.g., "mysite")
4. You should see:
   - List of available/unavailable domains
   - Real-time pricing in EUR
   - "Buy Now" button for available domains

## Troubleshooting

### Error: "This call has not been granted"

**Cause**: Consumer Key doesn't have required permissions

**Solution**: 
1. Go back to Step 2
2. Generate a new Consumer Key with ALL the required access rules
3. Update `OVH_CONSUMER_KEY` in `.env`
4. Restart containers

### Error: "Domain service temporarily unavailable"

**Cause**: Environment variables not configured or missing

**Solution**:
1. Check that all 4 OVH variables are set in `.env`
2. Verify there are no extra spaces or quotes around values
3. Restart containers after changes

### Error: "Invalid credentials"

**Cause**: Application Key or Secret is incorrect

**Solution**:
1. Verify credentials in OVH dashboard: https://eu.api.ovh.com/console/
2. If needed, create new credentials (Step 1-2)
3. Update `.env` and restart

## API Endpoints Reference

### Check Domain Availability
```http
GET /api/v1/domains/check-availability/?domain=mysite
```

Response:
```json
[
  {
    "domain": "mysite.com",
    "tld": "com",
    "available": true,
    "price": 12.99,
    "currency": "EUR"
  },
  {
    "domain": "mysite.io",
    "tld": "io",
    "available": false,
    "price": null,
    "currency": "EUR"
  }
]
```

### Purchase Domain
```http
POST /api/v1/domains/purchase/
Content-Type: application/json

{
  "domain_name": "mysite.com",
  "site_id": 123
}
```

Response:
```json
{
  "order_id": 456,
  "payment_url": "http://frontend/studio/domain-purchase-success?orderId=456",
  "message": "Domain order created successfully"
}
```

### Confirm Payment
```http
POST /api/v1/domains/confirm-payment/
Content-Type: application/json

{
  "order_id": 456
}
```

Response:
```json
{
  "message": "Payment confirmed, DNS configuration started",
  "order_id": 456,
  "status": "configuring_dns"
}
```

## Security Notes

- **Never commit** `.env` file to version control
- Keep your Consumer Key secret - it provides full access to your OVH account
- Use environment-specific credentials (dev vs production)
- Rotate credentials periodically for security

## Additional Resources

- [OVH API Documentation](https://eu.api.ovh.com/)
- [OVH API Console](https://eu.api.ovh.com/console/)
- [Python OVH Wrapper](https://github.com/ovh/python-ovh)

## Support

If you encounter issues not covered here:
1. Check backend logs: `docker logs site777_django_app`
2. Check Celery logs: `docker logs site777_celery_worker`
3. Verify OVH API status: https://web-cloud.status-ovhcloud.com/
