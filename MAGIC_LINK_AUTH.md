# Magic Link Passwordless Authentication

## Overview
Passwordless authentication via magic links allows users to log in by clicking a link sent to their email, without needing to remember or enter a password. This provides a seamless and secure authentication experience.

## How It Works

### User Flow
1. User clicks "Zaloguj się bez hasła (magiczny link)" on the login page
2. User enters their email address
3. System sends an email with a one-time login link
4. User clicks the link in the email
5. User is automatically logged in and redirected to the dashboard

### Security Features
- **Time-limited**: Links expire after 15 minutes
- **Single-use**: Each link can only be used once
- **Cryptographically secure**: 64-character random tokens
- **Account verification required**: Only verified accounts can request magic links
- **No password exposure**: Eliminates password-related vulnerabilities

## Architecture

### Backend Components

#### 1. Database Model (`api/models.py`)
```python
class MagicLink(models.Model):
    email = models.EmailField(max_length=254)
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
```

**Key Methods:**
- `is_valid()`: Check if link is still valid (not used, not expired)
- `mark_as_used()`: Mark link as used and set `used_at` timestamp
- `create_for_email(email, expiry_minutes=15)`: Class method to create new magic link
- `cleanup_expired()`: Class method to delete expired links

#### 2. API Endpoints (`api/views.py`)

**Request Magic Link**
- **Endpoint**: `POST /api/v1/auth/magic-link/request/`
- **Payload**: `{ "email": "user@example.com" }`
- **Response**: Success message (doesn't reveal if email exists)
- **Behavior**:
  - Validates email format
  - Checks if user exists and is active
  - Creates magic link token
  - Sends email with link
  - Returns generic success message for security

**Verify Magic Link**
- **Endpoint**: `POST /api/v1/auth/magic-link/verify/`
- **Payload**: `{ "token": "abc123..." }`
- **Response**: JWT tokens + user email
- **Behavior**:
  - Validates token exists
  - Checks if token is valid (not used, not expired)
  - Marks token as used
  - Generates JWT tokens
  - Returns access and refresh tokens

#### 3. Email Template (`templates/emails/magic_link_login.html`)
Professional HTML email with:
- Clear call-to-action button
- Expiry time prominently displayed (15 minutes)
- Fallback link for copy-paste
- Security notice about ignoring if not requested
- Branded styling matching the app's design system

#### 4. Cleanup Task (`api/tasks.py`)
```python
@shared_task
def cleanup_expired_magic_links(self):
    """Delete expired magic link tokens daily."""
```

### Frontend Components

#### 1. Login Page Enhancement (`STUDIO/pages/Auth/LoginPage.jsx`)
**New Mode**: `'magic'` alongside `'login'` and `'register'`

**UI Changes:**
- "Zaloguj się bez hasła (magiczny link)" button on login screen
- Magic link mode shows only email input field
- Success message after link is sent
- Link to return to password login

**State Management:**
- `mode`: Tracks current mode ('login', 'register', 'magic')
- `magicLinkSent`: Boolean flag for success message
- Form validation for email-only submission

#### 2. Magic Login Page (`STUDIO/pages/Auth/MagicLoginPage.jsx`)
Dedicated page for processing magic link clicks.

**States:**
- **Loading**: Verifying token with spinner
- **Success**: Green checkmark, auto-redirect after 2 seconds
- **Error**: Different messages based on error type:
  - `already_used`: Link was already used
  - `expired`: Link has expired (>15 min)
  - `invalid`: Invalid token
  - `other`: Generic error

**Features:**
- Extracts token from URL params
- Calls verify API
- Refreshes user data on success
- Auto-redirects to `/studio/sites`
- Provides "Request New Link" button on expiry/use errors

#### 3. Auth Service (`services/authService.js`)
```javascript
export const requestMagicLink = async (email) => {
    const response = await apiClient.post('/auth/magic-link/request/', { email });
    return response.data;
};

export const verifyMagicLink = async (token) => {
    const response = await apiClient.post('/auth/magic-link/verify/', { token });
    const { access, refresh } = response.data;
    persistTokens(access, refresh);
    return response.data;
};
```

#### 4. Routes (`STUDIO/routes.jsx`)
```jsx
{/* Magic link login - PUBLIC route, no auth required */}
<Route path="magic-login/:token" element={<MagicLoginPage />} />
```

## API Reference

### POST /api/v1/auth/magic-link/request/

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 - Success):**
```json
{
  "detail": "Magic link sent! Please check your email.",
  "email": "user@example.com"
}
```

**Response (400 - Unverified Account):**
```json
{
  "detail": "Your account is not verified. Please check your email for the verification link.",
  "error": "account_not_verified"
}
```

**Response (500 - Email Failed):**
```json
{
  "detail": "Failed to send magic link. Please try again later.",
  "error": "email_failed"
}
```

### POST /api/v1/auth/magic-link/verify/

**Request:**
```json
{
  "token": "abc123def456..."
}
```

**Response (200 - Success):**
```json
{
  "detail": "Login successful!",
  "email": "user@example.com",
  "access": "eyJ0eXAiOiJKV1QiLCJhbG...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

**Response (400 - Already Used):**
```json
{
  "detail": "This magic link has already been used.",
  "error": "already_used"
}
```

**Response (400 - Expired):**
```json
{
  "detail": "This magic link has expired. Please request a new one.",
  "error": "expired"
}
```

**Response (404 - Invalid Token):**
```json
{
  "detail": "Invalid magic link.",
  "error": "invalid_token"
}
```

## Configuration

### Settings (`site_project/settings.py`)
```python
# Email configuration
DEFAULT_FROM_EMAIL = 'noreply@youreasySite.com'
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'  # Production
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # Development

# Frontend URL for magic links
FRONTEND_URL = 'http://localhost:3000'  # Development
# FRONTEND_URL = 'https://app.youreasySite.com'  # Production
```

### Environment Variables
- `FRONTEND_URL`: Base URL of the React frontend
- Email SMTP settings (if using SMTP backend)

## Admin Panel

Magic links are manageable in Django admin:
- **URL**: `/admin/api/magiclink/`
- **List View**: email, token preview, created, expires, used status
- **Filters**: used status, creation date, expiry date
- **Search**: email, token
- **Read-only**: token, created_at, used_at

## Security Considerations

### Protection Against Abuse
1. **Rate Limiting**: Frontend prevents rapid requests
2. **Generic Responses**: Doesn't reveal if email exists
3. **Short Expiry**: 15-minute window reduces exposure
4. **Single Use**: Prevents token reuse
5. **Secure Tokens**: Cryptographically random 64-char strings

### Email Security
1. **HTTPS Links**: All magic links use HTTPS in production
2. **Clear Warnings**: Email warns to ignore if not requested
3. **No Sensitive Data**: Token is only identifier in email

### Account Security
1. **Verification Required**: Only verified accounts can request links
2. **Active Check**: Inactive accounts cannot use magic links
3. **JWT Tokens**: Standard JWT authentication after verification

## Maintenance

### Automatic Cleanup
Celery task `cleanup_expired_magic_links` should run daily:

```python
# In celery beat schedule
from celery.schedules import crontab

app.conf.beat_schedule = {
    'cleanup-expired-magic-links': {
        'task': 'api.tasks.cleanup_expired_magic_links',
        'schedule': crontab(hour=3, minute=0),  # 3 AM daily
    },
}
```

### Manual Cleanup
Django management command:
```bash
python manage.py shell
>>> from api.models import MagicLink
>>> MagicLink.cleanup_expired()
```

## User Experience Best Practices

### Email Subject Lines
- Clear and concise: "Your Magic Login Link"
- No spam triggers, professional tone

### Email Content
- Prominent CTA button
- Clear expiry time (15 minutes)
- Security reassurance
- Fallback copy-paste link
- Professional branding

### Frontend Feedback
- Immediate confirmation after request
- Loading states during verification
- Clear error messages
- Auto-redirect on success
- Easy path to request new link

## Testing Checklist

- [ ] Request magic link for existing verified user
- [ ] Request magic link for unverified user (should fail)
- [ ] Request magic link for non-existent email
- [ ] Click magic link within 15 minutes
- [ ] Try to use same magic link twice
- [ ] Try to use magic link after 15 minutes
- [ ] Try to use invalid/malformed token
- [ ] Verify JWT tokens are generated correctly
- [ ] Verify auto-redirect to dashboard works
- [ ] Verify email content renders correctly
- [ ] Verify admin panel shows magic links
- [ ] Verify cleanup task removes expired links

## Files Modified/Created

### Backend
- `api/models.py`: Added `MagicLink` model
- `api/views.py`: Added `RequestMagicLinkView` and `VerifyMagicLinkView`
- `api/urls.py`: Added magic link routes
- `api/admin.py`: Registered `MagicLink` in admin
- `api/tasks.py`: Added `cleanup_expired_magic_links` task
- `templates/emails/magic_link_login.html`: New email template (created)
- `api/migrations/0005_magiclink.py`: Database migration (created)

### Frontend
- `services/authService.js`: Added `requestMagicLink()` and `verifyMagicLink()`
- `STUDIO/pages/Auth/LoginPage.jsx`: Added magic link mode
- `STUDIO/pages/Auth/MagicLoginPage.jsx`: New magic login page (created)
- `STUDIO/routes.jsx`: Added `/magic-login/:token` route

## Future Enhancements

1. **Configurable Expiry**: Allow admins to set custom expiry times
2. **Rate Limiting**: Backend rate limiting per email
3. **Usage Analytics**: Track magic link usage vs password login
4. **Remember Device**: Option to stay logged in longer
5. **Multi-language**: Localized email templates
6. **Custom Branding**: Per-site email customization
7. **Magic Link Registration**: Allow new user registration via magic link
