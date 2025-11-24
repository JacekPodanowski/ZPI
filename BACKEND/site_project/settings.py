# site_project/settings.py

import os
import warnings
from pathlib import Path
from datetime import timedelta
import dj_database_url
from dotenv import load_dotenv

# --- Konfiguracja podstawowa ---
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Suppress deprecation warnings from dj-rest-auth library (internal code we can't fix)
warnings.filterwarnings('ignore', message='.*app_settings.USERNAME_REQUIRED is deprecated.*')
warnings.filterwarnings('ignore', message='.*app_settings.EMAIL_REQUIRED is deprecated.*')

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False').lower() in ['true', '1', 't', 'yes']

# --- Zmienne specyficzne dla aplikacji ---
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8000")
DISCORD_SERVER_URL = os.environ.get("DISCORD_SERVER_URL")

# --- OVHcloud API (for domain management) ---
OVH_ENDPOINT = os.environ.get('OVH_ENDPOINT', 'ovh-eu')
OVH_APPLICATION_KEY = os.environ.get('OVH_APPLICATION_KEY')
OVH_APPLICATION_SECRET = os.environ.get('OVH_APPLICATION_SECRET')
OVH_CONSUMER_KEY = os.environ.get('OVH_CONSUMER_KEY')
DOMAIN_TARGET_ADDRESS = os.environ.get('DOMAIN_TARGET_ADDRESS')  # Deprecated, kept for backwards compatibility

# --- Cloudflare API (for DNS management) ---
CLOUDFLARE_API_TOKEN = os.environ.get('CLOUDFLARE_API_TOKEN')
CLOUDFLARE_ACCOUNT_ID = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
CLOUDFLARE_ZONE_ID = os.environ.get('CLOUDFLARE_ZONE_ID')  # Zone ID for cache purging
CLOUDFLARE_WORKER_NAME = os.environ.get('CLOUDFLARE_WORKER_NAME', 'youreasysite-domain-proxy')

# --- Google Cloud Target (where domains should point) ---
GOOGLE_CLOUD_IP = os.environ.get('GOOGLE_CLOUD_IP')  # Static IP from Load Balancer
GOOGLE_CLOUD_DOMAIN = os.environ.get('GOOGLE_CLOUD_DOMAIN')  # Cloud Run / App Engine domain

# --- AI Models API Keys ---
FLASH_API_KEY = os.environ.get('FLASH_API_KEY')

# --- Przelewy24 Payment Gateway ---
PRZELEWY24_MERCHANT_ID = os.environ.get('PRZELEWY24_MERCHANT_ID')
PRZELEWY24_POS_ID = os.environ.get('PRZELEWY24_POS_ID')
PRZELEWY24_CRC_KEY = os.environ.get('PRZELEWY24_CRC_KEY')
PRZELEWY24_API_URL = os.environ.get('PRZELEWY24_API_URL', 'https://sandbox.przelewy24.pl')
PRZELEWY24_RETURN_URL = os.environ.get('PRZELEWY24_RETURN_URL', f'{FRONTEND_URL}/studio/payment/success')
PRZELEWY24_STATUS_URL = os.environ.get('PRZELEWY24_STATUS_URL', 'https://yourdomain.com/api/v1/payments/webhook/')

SUPABASE_URL = os.environ.get('supabase_url')
SUPABASE_ANON_KEY = os.environ.get('supabase_api_key')
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
SUPABASE_STORAGE_BUCKET_DEFAULT = os.environ.get('SUPABASE_STORAGE_BUCKET')
SUPABASE_STORAGE_BUCKET_IMAGE = (
    os.environ.get('SUPABASE_STORAGE_BUCKET_IMAGE')
    or os.environ.get('SUPABASE_STORAGE_BUCKET_1')
)
SUPABASE_STORAGE_BUCKET_VIDEO = (
    os.environ.get('SUPABASE_STORAGE_BUCKET_VIDEO')
    or os.environ.get('SUPABASE_STORAGE_BUCKET_2')
)
if not SUPABASE_STORAGE_BUCKET_DEFAULT:
    SUPABASE_STORAGE_BUCKET_DEFAULT = SUPABASE_STORAGE_BUCKET_IMAGE or SUPABASE_STORAGE_BUCKET_VIDEO

SUPABASE_STORAGE_BUCKET_MAP = {
    'image': SUPABASE_STORAGE_BUCKET_IMAGE or SUPABASE_STORAGE_BUCKET_DEFAULT,
    'video': SUPABASE_STORAGE_BUCKET_VIDEO or SUPABASE_STORAGE_BUCKET_DEFAULT,
    'other': SUPABASE_STORAGE_BUCKET_DEFAULT or SUPABASE_STORAGE_BUCKET_IMAGE or SUPABASE_STORAGE_BUCKET_VIDEO,
}

SUPABASE_STORAGE_PUBLIC_URL = None
SUPABASE_STORAGE_PUBLIC_URLS = {}
if SUPABASE_URL:
    buckets = {bucket for bucket in SUPABASE_STORAGE_BUCKET_MAP.values() if bucket}
    for bucket in buckets:
        SUPABASE_STORAGE_PUBLIC_URLS[bucket] = f"{SUPABASE_URL.rstrip('/')}/storage/v1/object/public/{bucket}/"
    default_bucket = SUPABASE_STORAGE_BUCKET_MAP.get('other')
    if default_bucket:
        SUPABASE_STORAGE_PUBLIC_URL = SUPABASE_STORAGE_PUBLIC_URLS.get(default_bucket)

# --- Konfiguracja sieci i bezpieczeństwa ---
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '192.168.0.104', '136.115.41.232', '.trycloudflare.com']
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# --- Konfiguracja aplikacji Django ---
ROOT_URLCONF = 'site_project.urls'
WSGI_APPLICATION = 'site_project.wsgi.application'
ASGI_APPLICATION = 'site_project.asgi.application'
AUTH_USER_MODEL = 'api.PlatformUser'
SITE_ID = 1
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

INSTALLED_APPS = [
    'channels',
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    'api.apps.ApiConfig',
    'rest_framework',
    'drf_spectacular',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'django_extensions',
    'axes',  # DDoS & brute-force protection
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'api.middleware.TemporaryPasswordMiddleware',  # Custom middleware for temporary password check
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'api.ddos_middleware.DDoSProtectionMiddleware',  # DDoS protection
    'axes.middleware.AxesMiddleware',  # Brute-force protection (must be last)
]

# --- Baza Danych ---
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=not DEBUG
    )
}

# --- Pliki statyczne (WhiteNoise) ---
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# --- Szablony, Język, Czas ---
TEMPLATES = [ { 'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [BASE_DIR / 'templates'], 'APP_DIRS': True, 'OPTIONS': { 'context_processors': [ 'django.template.context_processors.debug', 'django.template.context_processors.request', 'django.contrib.auth.context_processors.auth', 'django.contrib.messages.context_processors.messages', ], }, }, ]
LANGUAGE_CODE = 'pl-pl'
TIME_ZONE = 'Europe/Warsaw'
USE_I18N = True
USE_TZ = True
AUTH_PASSWORD_VALIDATORS = [ {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'}, {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'}, {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'}, {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'}, ]

# --- Logowanie ---
LOGGING = { "version": 1, "disable_existing_loggers": False, "formatters": { "verbose": { "format": "%(levelname)s %(asctime)s %(name)s %(module)s %(process)d %(thread)d %(message)s" }, "simple": {"format": "%(levelname)s %(name)s %(message)s"}, "json": { "()": "pythonjsonlogger.jsonlogger.JsonFormatter", "format": "%(levelname)s %(asctime)s %(name)s %(module)s %(message)s", }, }, "handlers": { "console": { "class": "logging.StreamHandler", "formatter": "json" if not DEBUG else "simple", }, }, "root": { "handlers": ["console"], "level": "INFO", }, "loggers": { "django": { "handlers": ["console"], "level": "INFO", "propagate": False, }, "django.db.backends": { "handlers": ["console"], "level": "WARNING", "propagate": False, }, "api": { "handlers": ["console"], "level": "INFO", "propagate": False, }, }, }

# --- CORS ---
cors_origins = set()

# Updated ports: frontend on 80, backend on 443
cors_origins.update({
    "http://localhost:80",
    "http://localhost",  # Port 80 is default for HTTP
    "http://127.0.0.1:80",
    "http://127.0.0.1",
    "http://192.168.0.104:80",
    "http://192.168.0.104",
    "http://136.115.41.232:80",
    "http://136.115.41.232",
    # Keep some old ports for backward compatibility during transition
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
})

frontend_env = os.environ.get('FRONTEND_URL')
if frontend_env:
    cors_origins.add(frontend_env)

CORS_ALLOWED_ORIGINS = sorted(cors_origins)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
    r"^http://192\.168\.0\.104:\d+$",
    r"^http://136\.115\.41\.232:\d+$",
    r"^https://.*\.trycloudflare\.com$",  # Allow Cloudflare Tunnel
    r"^null$",  # Allow local HTML files for testing
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    origin for origin in CORS_ALLOWED_ORIGINS
    if origin.startswith("http://") or origin.startswith("https://")
]

# --- REST Framework & JWT ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
    'DEFAULT_PERMISSION_CLASSES': ('rest_framework.permissions.IsAuthenticated',),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# --- Autentykacja (dj-rest-auth & allauth) ---
AUTHENTICATION_BACKENDS = [ 
    'axes.backends.AxesStandaloneBackend',  # AxesStandaloneBackend should be first
    'django.contrib.auth.backends.ModelBackend', 
    'allauth.account.auth_backends.AuthenticationBackend', 
]
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_HTTPONLY': False,
    'REGISTER_SERIALIZER': 'api.serializers.CustomRegisterSerializer',
    'TOKEN_MODEL': None,
}
ACCOUNT_ADAPTER = 'api.adapters.CustomAccountAdapter'
SOCIALACCOUNT_ADAPTER = 'api.adapters.CustomSocialAccountAdapter'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# --- Updated allauth configuration (new format, no deprecation warnings) ---
# Authentication method
ACCOUNT_LOGIN_METHODS = {'email'}  # Use email for authentication (replaces ACCOUNT_AUTHENTICATION_METHOD)

# Signup fields configuration
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']  # * means required

# Email settings
ACCOUNT_UNIQUE_EMAIL = True              # E-maile muszą być unikalne
ACCOUNT_EMAIL_VERIFICATION = 'mandatory' # Wymagaj weryfikacji e-maila
ACCOUNT_LOGOUT_ON_GET = True

# User model fields
ACCOUNT_USER_MODEL_USERNAME_FIELD = 'username'
ACCOUNT_USER_MODEL_EMAIL_FIELD = 'email'

# Social account settings
SOCIALACCOUNT_LOGIN_ON_GET = True
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'

SPECTACULAR_SETTINGS = {
    'TITLE': 'YourEasySite API',
    'DESCRIPTION': (
        'REST API for the multi-tenant personal site generator. '
        'Core resources cover platform users, sites, clients, events and bookings.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# --- Logowanie przez Google ---
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
SOCIALACCOUNT_PROVIDERS = {}

# Dodajemy konfigurację Google, jeśli klucze są dostępne
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    SOCIALACCOUNT_PROVIDERS = {
        'google': {
            'APP': {
                'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
                'secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
            },
            'SCOPE': ['profile', 'email'],
            'AUTH_PARAMS': {'access_type': 'online'},
            'OAUTH_PKCE_ENABLED': True,
        }
    }

# --- Konfiguracja Email ---
EMAIL_HOST_CONFIGURED = os.environ.get('EMAIL_HOST')
EMAIL_HOST_USER_CONFIGURED = os.environ.get('EMAIL_HOST_USER')

if EMAIL_HOST_CONFIGURED and EMAIL_HOST_USER_CONFIGURED:
    # Use standard SMTP backend
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    
    EMAIL_HOST = EMAIL_HOST_CONFIGURED
    EMAIL_HOST_USER = EMAIL_HOST_USER_CONFIGURED
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
    EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True').lower() in ['true', '1', 't']
    EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'False').lower() in ['true', '1', 't']
    DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    DEFAULT_FROM_EMAIL = 'console-sender@example.com'
    print("WARNING: Zmienne środowiskowe e-mail nie znalezione. Używam backendu konsolowego.")

VERCEL_BUILD_HOOK_URL = os.environ.get('VERCEL_BUILD_HOOK_URL')

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

MEDIA_TOTAL_STORAGE_PER_USER = int(os.environ.get('MEDIA_MAX_TOTAL_STORAGE_PER_USER', 1024 * 1024 * 1024))
MEDIA_IMAGE_MAX_UPLOAD_BYTES = int(os.environ.get('MEDIA_IMAGE_MAX_UPLOAD_BYTES', 10 * 1024 * 1024))
MEDIA_IMAGE_MAX_FINAL_BYTES = int(os.environ.get('MEDIA_IMAGE_MAX_FINAL_BYTES', 5 * 1024 * 1024))
MEDIA_IMAGE_MAX_DIMENSIONS = (
    int(os.environ.get('MEDIA_IMAGE_MAX_WIDTH', 1920)),
    int(os.environ.get('MEDIA_IMAGE_MAX_HEIGHT', 1080)),
)
MEDIA_VIDEO_MAX_UPLOAD_BYTES = int(os.environ.get('MEDIA_VIDEO_MAX_UPLOAD_BYTES', 100 * 1024 * 1024))
MEDIA_WEBP_QUALITY_DEFAULT = int(os.environ.get('MEDIA_WEBP_QUALITY', 90))
MEDIA_WEBP_QUALITY_AVATAR = int(os.environ.get('MEDIA_WEBP_QUALITY_AVATAR', 90))
MEDIA_TEMP_STORAGE_MAX_PER_USER = int(os.environ.get('MEDIA_MAX_TEMP_STORAGE_PER_USER', 100 * 1024 * 1024))
MEDIA_TEMP_STORAGE_EXPIRE_SECONDS = int(os.environ.get('MEDIA_TEMP_STORAGE_EXPIRE', 24 * 60 * 60))
MEDIA_STORAGE_TIMEOUT = int(os.environ.get('MEDIA_STORAGE_TIMEOUT', 15))
MEDIA_ALLOWED_IMAGE_MIME_TYPES = (
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
)
MEDIA_ALLOWED_VIDEO_MIME_TYPES = (
    'video/mp4',
    'video/webm',
    'video/quicktime',
)

# --- Konfiguracja Celery ---
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_ACCEPT_CONTENT = ['application/json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60  # 25 minutes

# Celery Beat Schedule (periodic tasks)
from celery.schedules import crontab
CELERY_BEAT_SCHEDULE = {
    # Newsletter tasks removed - newsletters are now sent manually via button
}

# --- Konfiguracja Django Cache (Redis) ---
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": f"redis://{os.environ.get('REDIS_HOST', '127.0.0.1')}:{os.environ.get('REDIS_PORT', 6379)}/1",
    }
}

# --- Konfiguracja Django Channels ---
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(os.environ.get('REDIS_HOST', '127.0.0.1'), int(os.environ.get('REDIS_PORT', 6379)))],
        },
    },
}

# --- DDoS Protection Settings ---
DDOS_REQUESTS_PER_MINUTE = int(os.environ.get('DDOS_REQUESTS_PER_MINUTE', 60))
DDOS_REQUESTS_PER_HOUR = int(os.environ.get('DDOS_REQUESTS_PER_HOUR', 1000))
DDOS_BLOCK_DURATION = int(os.environ.get('DDOS_BLOCK_DURATION', 3600))  # 1 hour in seconds
DDOS_SUSPICIOUS_THRESHOLD = int(os.environ.get('DDOS_SUSPICIOUS_THRESHOLD', 100))
DDOS_WHITELIST = [
    '127.0.0.1',
    'localhost',
]

# --- Django Axes (Brute-force protection) Settings ---
AXES_FAILURE_LIMIT = int(os.environ.get('AXES_FAILURE_LIMIT', 5))  # Lock after 5 failed attempts
AXES_COOLOFF_TIME = int(os.environ.get('AXES_COOLOFF_TIME', 1))  # Lock for 1 hour
AXES_LOCKOUT_PARAMETERS = ['username', 'ip_address']
AXES_RESET_ON_SUCCESS = True
AXES_LOCKOUT_TEMPLATE = None  # Use default lockout response
AXES_LOCKOUT_URL = None  # No redirect, return 403
AXES_VERBOSE = True  # Enable detailed logging
AXES_ENABLE_ADMIN = True  # Enable admin interface for axes
AXES_HANDLER = 'axes.handlers.database.AxesDatabaseHandler'  # Store attempts in database
