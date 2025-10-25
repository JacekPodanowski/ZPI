# site_project/settings.py

import os
from pathlib import Path
from datetime import timedelta
import dj_database_url
from dotenv import load_dotenv

# --- Konfiguracja podstawowa ---
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False').lower() in ['true', '1', 't', 'yes']

# --- Zmienne specyficzne dla aplikacji ---
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
DISCORD_SERVER_URL = os.environ.get("DISCORD_SERVER_URL")

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
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '192.168.0.104', '136.115.41.232']
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
AUTH_USER_MODEL = 'api.PlatformUser'
SITE_ID = 1
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

INSTALLED_APPS = [
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
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
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
frontend_env = os.environ.get('FRONTEND_URL')
if frontend_env:
    cors_origins.add(frontend_env)
if DEBUG:
    cors_origins.update({
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.0.104:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.0.104:3001",
        "http://localhost:3001",
        "http://136.115.41.232:3001",
        "http://136.115.41.232:3000",
    })

CORS_ALLOWED_ORIGINS = sorted(cors_origins)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
    r"^http://192\.168\.0\.104:\d+$",
    r"^http://136\.115\.41\.232:\d+$",
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
}
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# --- Autentykacja (dj-rest-auth & allauth) ---
AUTHENTICATION_BACKENDS = [ 'django.contrib.auth.backends.ModelBackend', 'allauth.account.auth_backends.AuthenticationBackend', ]
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_HTTPONLY': False,
    'REGISTER_SERIALIZER': 'api.serializers.CustomRegisterSerializer',
    'TOKEN_MODEL': None,
}
SOCIALACCOUNT_ADAPTER = 'api.adapters.CustomSocialAccountAdapter'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# --- Finalna, poprawna konfiguracja allauth ---
ACCOUNT_AUTHENTICATION_METHOD = 'email'  # Logowanie za pomocą adresu e-mail
ACCOUNT_EMAIL_REQUIRED = True            # E-mail jest wymagany przy rejestracji
ACCOUNT_UNIQUE_EMAIL = True              # E-maile muszą być unikalne
ACCOUNT_USERNAME_REQUIRED = False        # Nazwa użytkownika nie jest wymagana w formularzu
ACCOUNT_EMAIL_VERIFICATION = 'mandatory' # Wymagaj weryfikacji e-maila
ACCOUNT_LOGOUT_ON_GET = True

# Wskazuje allauth, których pól ma używać z Twojego niestandardowego modelu User
ACCOUNT_USER_MODEL_USERNAME_FIELD = 'username'
ACCOUNT_USER_MODEL_EMAIL_FIELD = 'email'

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
if not DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.environ.get('EMAIL_HOST')
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
    DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL')
else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

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


print(f"DEBUG IN SETTINGS: Service Key Loaded: {SUPABASE_SERVICE_ROLE_KEY}")
