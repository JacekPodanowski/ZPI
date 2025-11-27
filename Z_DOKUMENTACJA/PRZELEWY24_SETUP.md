# Przelewy24 Payment Gateway Configuration

## Required Environment Variables

Add these variables to your `.env` file in the BACKEND directory:

```env
# Przelewy24 Sandbox Credentials (for testing)
PRZELEWY24_MERCHANT_ID=your_merchant_id
PRZELEWY24_POS_ID=your_pos_id
PRZELEWY24_CRC_KEY=your_crc_key
PRZELEWY24_API_URL=https://sandbox.przelewy24.pl

# URLs for payment callbacks
PRZELEWY24_RETURN_URL=http://localhost:3000/studio/payment/success
PRZELEWY24_STATUS_URL=https://your-ngrok-url.ngrok-free.app/api/v1/payments/webhook/
```

## Getting Started

### 1. Register for Przelewy24 Sandbox Account

1. Go to https://sandbox.przelewy24.pl/
2. Create a test account
3. Note down your credentials:
   - Merchant ID
   - POS ID
   - CRC Key

### 2. Configure Webhooks for Local Development

Since Przelewy24 needs to send webhooks to your backend, you'll need to expose your local server:

1. Install ngrok: https://ngrok.com/
2. Run: `ngrok http 8000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
4. Set `PRZELEWY24_STATUS_URL` in your `.env` to: `https://abc123.ngrok-free.app/api/v1/payments/webhook/`

### 3. Testing Payments

1. Start your backend: `docker-compose up`
2. Start ngrok: `ngrok http 8000`
3. Go to: http://localhost:3000/studio/account/billing
4. Use the "Test Payment" section to create a test payment
5. You'll be redirected to Przelewy24 sandbox
6. Use test card: `4111 1111 1111 1111`, CVV: `123`, any future date

### 4. Production Configuration

For production, change:
```env
PRZELEWY24_API_URL=https://secure.przelewy24.pl
PRZELEWY24_RETURN_URL=https://yourdomain.com/studio/payment/success
PRZELEWY24_STATUS_URL=https://yourdomain.com/api/v1/payments/webhook/
```

## API Endpoints

### Create Payment
```
POST /api/v1/payments/create/
Authorization: Bearer <token>

{
  "amount": 10000,  // in grosz (100 PLN)
  "description": "Plan PRO - monthly subscription",
  "plan_id": "pro"
}

Response:
{
  "session_id": "YES-ABC123",
  "payment_url": "https://sandbox.przelewy24.pl/trnRequest/TOKEN",
  "status": "pending"
}
```

### Payment Webhook (called by Przelewy24)
```
POST /api/v1/payments/webhook/

{
  "sessionId": "YES-ABC123",
  "orderId": 12345,
  "amount": 10000,
  "currency": "PLN",
  "sign": "..."
}
```

### Check Payment Status
```
GET /api/v1/payments/status/<session_id>/
Authorization: Bearer <token>

Response:
{
  "session_id": "YES-ABC123",
  "status": "completed",
  "amount": 10000,
  "plan_id": "pro"
}
```

### Payment History
```
GET /api/v1/payments/history/
Authorization: Bearer <token>

Response: [
  {
    "id": 1,
    "session_id": "YES-ABC123",
    "amount": 10000,
    "status": "completed",
    "plan_id": "pro",
    "created_at": "2025-11-20T10:00:00Z"
  }
]
```

## Security Notes

- **NEVER** expose CRC_KEY in frontend code
- Always verify webhook signatures
- Use HTTPS in production
- Amounts are always in grosz (1 PLN = 100 grosz)
- Log all transactions for audit purposes
