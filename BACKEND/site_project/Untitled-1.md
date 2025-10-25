File Hierarchy (from BACKEND):
BACKEND
├─ api
|  ├─ management
|  |  ├─ commands
|  |  |  ├─ __init__.py
|  |  |  ├─ create_initial_superuser.py
|  |  |  └─ create_mock_sites.py
|  |  └─ __init__.py
|  ├─ migrations
|  |  ├─ __init__.py
|  |  ├─ 0001_initial.py
|  |  ├─ 0002_site_color.py
|  |  ├─ 0003_availabilityblock.py
|  |  ├─ 0004_platformuser_avatar.py
|  |  ├─ 0005_customreactcomponent.py
|  |  ├─ 0006_mediaasset_mediausage.py
|  |  ├─ 0007_mediaasset_file_size.py
|  |  └─ 0008_mediaasset_storage_bucket.py
|  ├─ __init__.py
|  ├─ adapters.py
|  ├─ admin.py
|  ├─ apps.py
|  ├─ media_helpers.py
|  ├─ media_processing.py
|  ├─ media_storage.py
|  ├─ models.py
|  ├─ serializers.py
|  ├─ signals.py
|  ├─ tests.py
|  ├─ urls.py
|  ├─ utils.py
|  └─ views.py
├─ site_project
|  ├─ __init__.py
|  ├─ asgi.py
|  ├─ settings.py
|  ├─ urls.py
|  └─ wsgi.py
├─ templates
|  ├─ account
|  |  └─ email
|  |     └─ email_confirmation_message.html
|  └─ emails
|     ├─ admin_session_cancellation_notification.html
|     ├─ admin_session_new_reservation_notification.html
|     ├─ session_canceled_by_admin.html
|     ├─ session_confirmed_discord.html
|     ├─ session_confirmed_google_meet.html
|     └─ session_new_reservation.html
├─ .dockerignore
├─ .env.example
├─ .gitignore
├─ Dockerfile
├─ entrypoint.sh
├─ manage.py
├─ readme.md
└─ requirements.txt

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\__init__.py
(empty file)

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\adapters.py
```py
# api/adapters.py

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.utils.text import slugify
from urllib.parse import urlencode
from rest_framework_simplejwt.tokens import RefreshToken
import logging

from .models import PlatformUser

logger = logging.getLogger(__name__)

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def get_connect_redirect_url(self, request, socialaccount):
        """
        Zastępuje domyślne zachowanie allauth po zalogowaniu przez konto społecznościowe.
        Zamiast przekierowywać na profil w backendzie, generuje tokeny JWT
        i przekierowuje na dedykowaną ścieżkę w aplikacji frontendowej,
        przekazując tokeny jako parametry URL.
        """
        assert request.user.is_authenticated
        logger.info(f"CustomSocialAccountAdapter: Użytkownik {request.user.email} pomyślnie zalogowany przez Google.")

        frontend_url = settings.FRONTEND_URL

        callback_path = "/google-auth-callback"

        user = socialaccount.user
        refresh = RefreshToken.for_user(user)
        
        tokens = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
        
        logger.info(f"CustomSocialAccountAdapter: Wygenerowano tokeny JWT dla {user.email}.")

        redirect_url = f"{frontend_url.rstrip('/')}{callback_path}?{urlencode(tokens)}"
        
        logger.debug(f"CustomSocialAccountAdapter: Przekierowuję na adres: {redirect_url}")
        
        return redirect_url

    def pre_social_login(self, request, sociallogin):
        """
        Interweniuje tuż po udanym zalogowaniu w Google, ale przed utworzeniem
        lub połączeniem konta w systemie. Tutaj możemy np. automatycznie
        wygenerować `username`, jeśli go brakuje.
        """
        user = sociallogin.user
        if not user.username:
            base_username = slugify(user.email.split('@')[0])
            username = base_username
            counter = 1
            existing_usernames = set(
                PlatformUser.objects.filter(username__startswith=base_username).values_list('username', flat=True)
            )

            while username in existing_usernames:
                username = f"{base_username}{counter}"
                counter += 1

            user.username = username
            logger.info(
                "CustomSocialAccountAdapter (pre_social_login): Ustawiono wygenerowany username '%s' dla użytkownika %s.",
                username,
                user.email,
            )

        return
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\admin.py
```py
from django.contrib import admin

from .models import PlatformUser, Site, Client, Event, Booking, Template, MediaAsset, MediaUsage, CustomReactComponent


@admin.register(PlatformUser)
class PlatformUserAdmin(admin.ModelAdmin):
	list_display = ('email', 'first_name', 'account_type', 'source_tag', 'is_staff', 'created_at')
	search_fields = ('email', 'first_name', 'last_name')
	list_filter = ('account_type', 'source_tag', 'is_staff')


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
	list_display = ('name', 'identifier', 'owner', 'created_at')
	search_fields = ('name', 'identifier')
	autocomplete_fields = ('owner',)


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
	list_display = ('email', 'name', 'site', 'google_id', 'created_at')
	search_fields = ('email', 'name', 'google_id')
	autocomplete_fields = ('site',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
	list_display = ('title', 'site', 'admin', 'start_time', 'end_time', 'event_type', 'capacity')
	list_filter = ('event_type', 'site')
	search_fields = ('title', 'description')
	autocomplete_fields = ('site', 'admin', 'attendees')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
	list_display = ('event', 'site', 'client', 'guest_email', 'created_at')
	search_fields = ('guest_email', 'guest_name', 'notes')
	autocomplete_fields = ('site', 'event', 'client')


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
	list_display = ('name', 'is_public')
	search_fields = ('name',)
	list_filter = ('is_public',)


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
	list_display = ('file_name', 'media_type', 'storage_bucket', 'file_size', 'uploaded_by', 'uploaded_at')
	search_fields = ('file_name', 'file_hash')
	list_filter = ('media_type',)
	autocomplete_fields = ('uploaded_by',)


@admin.register(MediaUsage)
class MediaUsageAdmin(admin.ModelAdmin):
	list_display = ('asset', 'usage_type', 'site', 'user', 'created_at')
	search_fields = ('asset__file_name', 'site__name', 'user__email')
	list_filter = ('usage_type',)
	autocomplete_fields = ('asset', 'site', 'user')


@admin.register(CustomReactComponent)
class CustomReactComponentAdmin(admin.ModelAdmin):
	list_display = ('name', 'created_at', 'updated_at')
	search_fields = ('name',)

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\apps.py
```py
from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        import api.signals
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\management\__init__.py
(empty file)

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\management\commands\__init__.py
(empty file)

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\management\commands\create_initial_superuser.py
```py
# api/management/commands/create_initial_superuser.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import os

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates a superuser if none exist, using environment variables for credentials.'

    def handle(self, *args, **options):
        superuser_email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        superuser_username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        superuser_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        superuser_first_name = os.environ.get('DJANGO_SUPERUSER_FIRST_NAME', '')
        superuser_last_name = os.environ.get('DJANGO_SUPERUSER_LAST_NAME', '')

        if not all([superuser_email, superuser_username, superuser_password]):
            self.stdout.write(self.style.ERROR('Missing superuser environment variables (EMAIL, USERNAME, PASSWORD). Superuser not created.'))
            return

        defaults = {
            'username': superuser_username,
            'first_name': superuser_first_name,
            'last_name': superuser_last_name,
            'is_staff': True,
            'is_superuser': True,
        }


        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=superuser_email,
                defaults={**defaults, 'password': superuser_password}
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Creating superuser {superuser_username} ({superuser_email})'))
                user.set_password(superuser_password)
                user.save()
            else:
                updated_fields = []
                for field, value in defaults.items():
                    if getattr(user, field) != value and value is not None:
                        setattr(user, field, value)
                        updated_fields.append(field)

                if not user.check_password(superuser_password):
                    user.set_password(superuser_password)
                    updated_fields.append('password')

                if updated_fields:
                    user.save(update_fields=list(set(updated_fields)))
                    self.stdout.write(self.style.WARNING('Updated existing superuser credentials to match environment variables.'))
                else:
                    self.stdout.write(self.style.WARNING('Superuser already exists with matching credentials.'))
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\management\commands\create_mock_sites.py
```py
# api/management/commands/create_mock_sites.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import json
import os

from api.models import Site, Template

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates mock sites and templates for the superuser defined in environment variables.'

    def handle(self, *args, **options):
        user_email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        if not user_email:
            self.stdout.write(self.style.ERROR('DJANGO_SUPERUSER_EMAIL environment variable not set. Cannot create mock sites.'))
            return

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Superuser with email {user_email} not found.'))
            return

        self.stdout.write(self.style.SUCCESS(f'Creating mock sites for user: {user.username} ({user.email})'))

        demo_sites = [
            {
                'name': 'Pracownia Jogi',
                'template_config': {
                    'name': 'Pracownia Jogi',
                    'themeId': 'modernWellness',
                    'pageOrder': [
                        'home',
                        'about',
                        'services',
                        'calendar',
                        'pricing',
                        'contact'
                    ],
                    'pages': {
                        'home': {
                            'id': 'home',
                            'name': 'Strona główna',
                            'path': '/',
                            'modules': [
                                {
                                    'id': 'hero',
                                    'name': 'Strona Główna',
                                    'type': 'hero',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Pracownia Jogi Jacek',
                                        'subtitle': 'Znajdź balans ciała i umysłu',
                                        'bgColor': 'rgb(228, 229, 218)',
                                        'textColor': 'rgb(30, 30, 30)',
                                        'backgroundImage': ''
                                    }
                                }
                            ]
                        },
                        'about': {
                            'id': 'about',
                            'name': 'O Mnie',
                            'path': '/o-mnie',
                            'modules': [
                                {
                                    'id': 'about',
                                    'name': 'O Mnie',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Poznaj mnie',
                                        'description': 'Instruktor jogi z 10-letnim doświadczeniem w pracy z ciałem i oddechem.',
                                        'imageUrl': '',
                                        'avatar': '',
                                        'bgColor': 'rgb(255, 255, 255)'
                                    }
                                }
                            ]
                        },
                        'services': {
                            'id': 'services',
                            'name': 'Usługi',
                            'path': '/uslugi',
                            'modules': [
                                {
                                    'id': 'services_cards',
                                    'type': 'services',
                                    'name': 'Oferta usług',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Usługi dopasowane do Ciebie',
                                        'subtitle': 'Wybierz formę pracy, która najlepiej wspiera Twoją praktykę',
                                        'bgColor': '#FFFFFF',
                                        'textColor': 'rgb(30, 30, 30)',
                                        'accentColor': 'rgb(146, 0, 32)',
                                        'items': [
                                            {
                                                'id': 'service-1',
                                                'name': 'Sesje indywidualne',
                                                'category': '1:1',
                                                'description': '<p>Spotkanie dostosowane do Twoich celów i potrzeb ciała.</p>',
                                                'image': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=900&q=60'
                                            },
                                            {
                                                'id': 'service-2',
                                                'name': 'Warsztaty weekendowe',
                                                'category': 'Grupowe',
                                                'description': '<p>Dwudniowe zanurzenie w praktyce jogi, oddechu i relaksacji.</p>',
                                                'image': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=60'
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        'calendar': {
                            'id': 'calendar',
                            'name': 'Kalendarz',
                            'path': '/kalendarz',
                            'modules': [
                                {
                                    'id': 'calendar',
                                    'name': 'Kalendarz',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Zarezerwuj zajęcia',
                                        'color': 'rgb(146, 0, 32)',
                                        'bgColor': 'rgb(255, 255, 255)',
                                        'minInterval': 15,
                                        'allowIndividual': True,
                                        'allowGroup': True
                                    }
                                }
                            ]
                        },
                        'pricing': {
                            'id': 'pricing',
                            'name': 'Cennik',
                            'path': '/cennik',
                             'modules': [
                                {
                                    'id': 'pricing_cards',
                                    'type': 'pricing',
                                    'name': 'Pakiety cenowe',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Przejrzyste pakiety',
                                        'subtitle': 'Wybierz plan, który najlepiej współgra z Twoim rytmem',
                                        'bgColor': '#FFFFFF',
                                        'textColor': 'rgb(30, 30, 30)',
                                        'accentColor': 'rgb(146, 0, 32)',
                                        'currency': 'PLN',
                                        'items': [
                                            {
                                                'id': 'pricing-1',
                                                'name': 'Sesja indywidualna',
                                                'price': '180',
                                                'description': '<ul><li>60 minut pracy 1:1</li></ul>',
                                                'image': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=60'
                                            },
                                            {
                                                'id': 'pricing-2',
                                                'name': 'Karnet miesięczny',
                                                'price': '520',
                                                'description': '<ul><li>8 spotkań grupowych</li></ul>',
                                                'image': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=900&q=60'
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        'contact': {
                            'id': 'contact',
                            'name': 'Kontakt',
                            'path': '/kontakt',
                            'modules': [
                                {
                                    'id': 'contact',
                                    'name': 'Kontakt',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'email': 'kontakt@pracowniajogi.pl',
                                        'phone': '+48 600 000 001',
                                        'bgColor': 'rgb(228, 229, 218)'
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            {
                'name': 'Studio Oddechu',
                'template_config': {
                    'name': 'Studio Oddechu',
                    'themeId': 'modernWellness',
                    'pages': {
                        'home': {
                            'id': 'home',
                            'name': 'Strona główna',
                            'path': '/',
                            'modules': [
                                {
                                    'id': 'hero',
                                    'name': 'Strona Główna',
                                    'type': 'hero',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Studio Oddechu',
                                        'subtitle': 'Sesje uważności i oddechu online',
                                        'bgColor': 'rgb(228, 229, 218)',
                                        'textColor': 'rgb(30, 30, 30)',
                                        'backgroundImage': ''
                                    }
                                }
                            ]
                        },
                        'calendar': {
                            'id': 'calendar',
                            'name': 'Kalendarz',
                            'path': '/kalendarz',
                            'modules': [
                                {
                                    'id': 'calendar',
                                    'name': 'Kalendarz',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Zaplanuj sesję',
                                        'color': 'rgb(146, 0, 32)',
                                        'bgColor': 'rgb(255, 255, 255)',
                                        'minInterval': 30,
                                        'allowIndividual': True,
                                        'allowGroup': False
                                    }
                                }
                            ]
                        },
                        'contact': {
                            'id': 'contact',
                            'name': 'Kontakt',
                            'path': '/kontakt',
                            'modules': [
                                {
                                    'id': 'contact',
                                    'name': 'Kontakt',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'email': 'hello@studiooddechu.pl',
                                        'phone': '+48 600 000 002',
                                        'bgColor': 'rgb(255, 255, 255)'
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ]

        with transaction.atomic():
            for idx, site_data in enumerate(demo_sites):
                # Set color_index: 0 for first site (red), 1 for second site (blue)
                color_index = idx % 12  # Cycle through 12 available colors
                
                site, created = Site.objects.get_or_create(
                    owner=user,
                    name=site_data['name'],
                    defaults={
                        'template_config': site_data['template_config'],
                        'color_index': color_index
                    }
                )
                if not created:
                    Site.objects.filter(pk=site.pk).update(
                        template_config=site_data['template_config'],
                        color_index=color_index
                    )
                    self.stdout.write(self.style.WARNING(f'Updated demo site "{site.name}" for {user.email} with color_index={color_index}.'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Created demo site "{site.name}" for {user.email} with color_index={color_index}.'))

        template_catalog = [
            {
                'name': 'Wellness Starter',
                'description': 'Elegancki szablon dla instruktorów wellness i studiów jogi.',
                'template_config': demo_sites[0]['template_config'],
                'thumbnail_url': None
            },
            {
                'name': 'Mindfulness Studio',
                'description': 'Delikatny motyw dla studiów oddechu i pracy z uważnością.',
                'template_config': demo_sites[1]['template_config'],
                'thumbnail_url': None
            }
        ]

        self.stdout.write(self.style.SUCCESS('Creating or updating global templates...'))
        for template_data in template_catalog:
            config_copy = json.loads(json.dumps(template_data['template_config']))
            config_copy['name'] = template_data['name']
            
            template, created = Template.objects.update_or_create(
                name=template_data['name'],
                defaults={
                    'description': template_data['description'],
                    'template_config': config_copy,
                    'thumbnail_url': template_data['thumbnail_url']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created template "{template.name}".'))
            else:
                self.stdout.write(self.style.WARNING(f'Updated template "{template.name}".'))
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\media_helpers.py
```py
"""Helpers for managing uploaded media assets."""

from __future__ import annotations

import logging
import os
from typing import Optional
from urllib.parse import urlparse

from django.conf import settings

from .media_storage import get_media_storage
from .models import MediaAsset

logger = logging.getLogger(__name__)


def normalize_media_path(file_url: str) -> Optional[str]:
    """Translate a user-provided media URL into a storage-relative path."""
    trimmed = (file_url or '').strip()
    if not trimmed:
        return None

    parsed = urlparse(trimmed)
    candidate = parsed.path if parsed.scheme or parsed.netloc else trimmed
    candidate = candidate.replace('\\', '/').lstrip()

    prefixes = []
    media_url = getattr(settings, 'MEDIA_URL', None)
    if media_url:
        prefixes.append(media_url.rstrip('/') + '/')

    supabase_public_urls = getattr(settings, 'SUPABASE_STORAGE_PUBLIC_URLS', {}) or {}
    prefixes.extend(url.rstrip('/') + '/' for url in supabase_public_urls.values() if url)

    supabase_public_default = getattr(settings, 'SUPABASE_STORAGE_PUBLIC_URL', None)
    if supabase_public_default:
        prefixes.append(str(supabase_public_default).rstrip('/') + '/')

    for prefix in prefixes:
        if candidate.startswith(prefix):
            candidate = candidate[len(prefix):]
            break

    relative_path = candidate.lstrip('/')

    if '..' in relative_path or relative_path.startswith('/'):
        return None

    return relative_path or None


def get_asset_by_path_or_url(value: str) -> Optional[MediaAsset]:
    """Return the MediaAsset matching the provided URL or storage path."""
    if not value:
        return None

    relative_path = normalize_media_path(value)
    if relative_path:
        asset = MediaAsset.objects.filter(storage_path=relative_path).first()
        if asset:
            return asset

        basename = os.path.basename(relative_path)
        candidate_names = [basename]

        if '_' in basename:
            try:
                _, remainder = basename.split('_', 1)
                candidate_names.append(remainder)
            except ValueError:
                pass

        for candidate in candidate_names:
            normalized_name = candidate.strip()
            if not normalized_name:
                continue
            asset = (
                MediaAsset.objects.filter(file_name=normalized_name)
                .order_by('-uploaded_at')
                .first()
            )
            if asset:
                return asset

    return MediaAsset.objects.filter(file_url=value).first()


def is_media_asset_in_use(asset: Optional[MediaAsset]) -> bool:
    """Check whether a media asset still has any usage references."""
    if asset is None:
        return False
    return asset.usages.exists()


def cleanup_asset_if_unused(asset: Optional[MediaAsset]) -> bool:
    """Delete the physical file and record if the asset has no remaining usages."""
    if asset is None:
        return False

    if is_media_asset_in_use(asset):
        return False

    storage = get_media_storage()
    bucket = asset.storage_bucket or getattr(settings, 'SUPABASE_STORAGE_BUCKET_MAP', {}).get('other', '')

    try:
        storage.delete(bucket, asset.storage_path)
    except Exception:  # pragma: no cover - storage backend dependent
        logger.exception("Failed to delete media file %s", asset.storage_path)
        return False

    asset.delete()
    logger.info("Removed orphaned media asset %s", asset.id)
    return True

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\media_processing.py
```py
"""Utilities for processing uploaded media files."""

from __future__ import annotations

import io
import logging
from typing import Tuple

from PIL import Image, ImageOps, UnidentifiedImageError

logger = logging.getLogger(__name__)


class ImageProcessingError(RuntimeError):
    """Raised when an uploaded asset cannot be processed as an image."""


def _resample_filter() -> int:
    resampling = getattr(Image, 'Resampling', None)
    if resampling is not None:
        return resampling.LANCZOS
    return Image.LANCZOS  # type: ignore[attr-defined]


def convert_to_webp(
    source_bytes: bytes,
    *,
    max_dimensions: Tuple[int, int],
    quality: int,
) -> Tuple[bytes, str]:
    """Convert image bytes to WebP respecting target dimensions and quality."""
    try:
        with Image.open(io.BytesIO(source_bytes)) as original:
            image = ImageOps.exif_transpose(original)
            if image.mode not in ('RGB', 'RGBA'):
                image = image.convert('RGB')
            else:
                image = image.convert('RGB')

            image.thumbnail(max_dimensions, _resample_filter())
            buffer = io.BytesIO()
            image.save(buffer, format='WEBP', quality=quality, method=6)
            buffer.seek(0)
            return buffer.read(), 'image/webp'
    except UnidentifiedImageError as exc:  # pragma: no cover - pillow specific
        logger.exception("Failed to identify uploaded image")
        raise ImageProcessingError("Uploaded file is not a valid image") from exc
    except OSError as exc:  # pragma: no cover - pillow specific
        logger.exception("Failed to process uploaded image")
        raise ImageProcessingError("Unable to process the provided image") from exc

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\media_storage.py
```py
"""Storage abstraction for media assets with optional Supabase support."""

from __future__ import annotations

import logging
from dataclasses import dataclass
import os
from functools import lru_cache
from threading import Lock
from typing import Any, Optional

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage, default_storage

try:  # pragma: no cover - optional dependency imported at runtime
    from supabase import Client as SupabaseClient, create_client
except Exception:  # pragma: no cover - supabase is optional
    SupabaseClient = None  # type: ignore[assignment]
    create_client = None  # type: ignore[assignment]

logger = logging.getLogger(__name__)


class StorageError(RuntimeError):
    """Raised when a storage backend operation fails."""


@dataclass(frozen=True)
class StorageSaveResult:
    bucket: str
    path: str
    url: str


class BaseStorageProvider:
    """Minimal interface for storage backends."""

    def save(self, bucket: str, path: str, data: bytes, content_type: str) -> StorageSaveResult:
        raise NotImplementedError

    def delete(self, bucket: str, path: str) -> None:
        raise NotImplementedError

    def build_url(self, bucket: str, path: str) -> str:
        raise NotImplementedError


class DjangoStorageProvider(BaseStorageProvider):
    """Fallback storage provider backed by Django's default storage."""

    def __init__(self, storage: Storage) -> None:
        self._storage = storage

    def save(self, bucket: str, path: str, data: bytes, content_type: str) -> StorageSaveResult:
        relative_path = path.lstrip('/')
        combined_path = os.path.join(bucket, relative_path) if bucket else relative_path
        content = ContentFile(data)
        saved_path = self._storage.save(combined_path, content)
        return StorageSaveResult(bucket=bucket or '', path=saved_path, url=self._storage.url(saved_path))

    def delete(self, bucket: str, path: str) -> None:
        stored_path = path
        if bucket and not path.startswith(bucket):
            stored_path = os.path.join(bucket, path)
        if self._storage.exists(stored_path):
            self._storage.delete(stored_path)

    def build_url(self, bucket: str, path: str) -> str:
        stored_path = path
        if bucket and not path.startswith(bucket):
            stored_path = os.path.join(bucket, path)
        return self._storage.url(stored_path)


class SupabaseStorageProvider(BaseStorageProvider):
    """Storage provider that persists files in Supabase Storage."""

    def __init__(
        self,
        *,
        base_url: str,
        service_key: str,
        timeout: int,
        public_urls: dict[str, str],
    ) -> None:
        if SupabaseClient is None or create_client is None:
            raise StorageError('Supabase client library is not installed')

        self._client = create_client(base_url, service_key)
        self._timeout = timeout  # Reserved for future per-request overrides
        self._public_urls = {bucket: url.rstrip('/') + '/' for bucket, url in public_urls.items()}
        self._known_buckets: set[str] = set()
        self._bucket_lock = Lock()

    @staticmethod
    def _response_error(response: Any) -> Optional[str]:
        error = getattr(response, 'error', None)
        if error:
            message = getattr(error, 'message', None)
            return str(message or error)
        if isinstance(response, dict):
            raw_error = response.get('error')
            if raw_error:
                return str(raw_error)
        return None

    @staticmethod
    def _response_data(response: Any) -> Any:
        if hasattr(response, 'data'):
            return getattr(response, 'data')
        if isinstance(response, dict):
            return response.get('data')
        return None

    def _ensure_bucket(self, bucket: str) -> None:
        if not bucket or bucket in self._known_buckets:
            return

        with self._bucket_lock:
            if bucket in self._known_buckets:
                return

            try:
                existing_resp = self._client.storage.list_buckets()
            except Exception as exc:  # pragma: no cover - external dependency
                logger.warning("Unable to list Supabase buckets: %s", exc)
                existing_resp = None

            if existing_resp is not None:
                data = self._response_data(existing_resp) or []
                names = {item.get('name') for item in data if isinstance(item, dict)}
                if bucket in names:
                    self._known_buckets.update(names)
                    return

            try:
                create_resp = self._client.storage.create_bucket(bucket, {'public': True})
            except Exception as exc:  # pragma: no cover - external dependency
                raise StorageError(f'Failed to ensure Supabase bucket `{bucket}`: {exc}') from exc

            error = self._response_error(create_resp)
            if error and 'already exists' not in error.lower():
                raise StorageError(f'Failed to create Supabase bucket `{bucket}`: {error}')

            self._known_buckets.add(bucket)

    def save(self, bucket: str, path: str, data: bytes, content_type: str) -> StorageSaveResult:
        if not bucket:
            raise StorageError('Supabase bucket must be provided')
        self._ensure_bucket(bucket)

        normalized_path = path.lstrip('/')
        file_bytes = data if isinstance(data, (bytes, bytearray)) else bytes(data)
        options = {
            'content-type': content_type or 'application/octet-stream',
            'cacheControl': '31536000',
        }

        try:
            upload_resp = self._client.storage.from_(bucket).upload(
                normalized_path,
                file_bytes,
                file_options=options,
            )
        except Exception as exc:  # pragma: no cover - external dependency
            raise StorageError(f'Failed to upload file to Supabase: {exc}') from exc

        error = self._response_error(upload_resp)
        if error:
            raise StorageError(f'Supabase upload failed: {error}')

        data_payload = self._response_data(upload_resp) or {}
        stored_path = data_payload.get('path', normalized_path)

        url = self.build_url(bucket, stored_path)
        return StorageSaveResult(bucket=bucket, path=stored_path, url=url)

    def delete(self, bucket: str, path: str) -> None:
        if not bucket:
            return
        self._ensure_bucket(bucket)
        normalized_path = path.lstrip('/')

        try:
            delete_resp = self._client.storage.from_(bucket).remove([normalized_path])
        except Exception as exc:  # pragma: no cover - external dependency
            logger.warning("Failed to delete Supabase object %s/%s: %s", bucket, normalized_path, exc)
            return

        error = self._response_error(delete_resp)
        if error:
            logger.warning("Supabase delete reported error for %s/%s: %s", bucket, normalized_path, error)

    def build_url(self, bucket: str, path: str) -> str:
        normalized_path = path.lstrip('/')
        self._ensure_bucket(bucket)

        public_url: Optional[str] = None
        try:
            public_resp = self._client.storage.from_(bucket).get_public_url(normalized_path)
            error = self._response_error(public_resp)
            if not error:
                data_payload = self._response_data(public_resp) or {}
                public_url = data_payload.get('publicUrl') or data_payload.get('publicURL')
        except Exception as exc:  # pragma: no cover - external dependency
            logger.debug("Supabase get_public_url failed for %s/%s: %s", bucket, normalized_path, exc)

        if not public_url:
            public_base = self._public_urls.get(bucket)
            if not public_base:
                raise StorageError(f"No public URL configured for bucket '{bucket}'")
            public_url = f"{public_base}{normalized_path}"
        return public_url


@lru_cache(maxsize=1)
def get_media_storage() -> BaseStorageProvider:
    """Return the configured storage provider, defaulting to Django storage."""
    if (
        settings.SUPABASE_URL
        and settings.SUPABASE_SERVICE_ROLE_KEY
        and settings.SUPABASE_STORAGE_PUBLIC_URLS
    ):
        logger.info("Using Supabase storage backend for media assets")
        return SupabaseStorageProvider(
            base_url=settings.SUPABASE_URL,
            service_key=settings.SUPABASE_SERVICE_ROLE_KEY,
            public_urls=settings.SUPABASE_STORAGE_PUBLIC_URLS,
            timeout=settings.MEDIA_STORAGE_TIMEOUT,
        )

    logger.info("Falling back to Django default storage backend for media assets")
    return DjangoStorageProvider(default_storage)
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\migrations\__init__.py
(empty file)

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\migrations\0001_initial.py
```py
# Generated by Django 5.2.1 on 2025-10-15 17:07

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(max_length=254)),
                ('name', models.CharField(max_length=255)),
                ('google_id', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name='Template',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('template_config', models.JSONField(default=dict)),
                ('thumbnail_url', models.URLField(blank=True, null=True)),
                ('is_public', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='PlatformUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(blank=True, help_text='Optional unique username used for legacy flows.', max_length=150, null=True, unique=True)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('first_name', models.CharField(max_length=150)),
                ('last_name', models.CharField(blank=True, max_length=150, null=True)),
                ('account_type', models.CharField(choices=[('free', 'Free'), ('pro', 'Pro')], default='free', max_length=10)),
                ('source_tag', models.CharField(choices=[('JACEK', 'Jacek Campaign'), ('WEB', 'Organic Web')], default='WEB', max_length=10)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'Platform user',
                'verbose_name_plural': 'Platform users',
            },
        ),
        migrations.CreateModel(
            name='Site',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('identifier', models.SlugField(blank=True, editable=False, max_length=255, null=True, unique=True)),
                ('template_config', models.JSONField(blank=True, default=dict)),
                ('version_history', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sites', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('capacity', models.PositiveIntegerField(default=1)),
                ('event_type', models.CharField(choices=[('individual', 'Individual'), ('group', 'Group')], default='individual', max_length=32)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('admin', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='managed_events', to=settings.AUTH_USER_MODEL)),
                ('attendees', models.ManyToManyField(blank=True, related_name='events', to='api.client')),
                ('site', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='api.site')),
            ],
            options={
                'ordering': ['start_time'],
            },
        ),
        migrations.AddField(
            model_name='client',
            name='site',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='clients', to='api.site'),
        ),
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('guest_email', models.EmailField(blank=True, max_length=254, null=True)),
                ('guest_name', models.CharField(blank=True, max_length=255)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('client', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='bookings', to='api.client')),
                ('event', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='api.event')),
                ('site', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookings', to='api.site')),
            ],
        ),
        migrations.AddConstraint(
            model_name='event',
            constraint=models.CheckConstraint(condition=models.Q(('end_time__gt', models.F('start_time'))), name='event_end_after_start'),
        ),
        migrations.AddConstraint(
            model_name='event',
            constraint=models.CheckConstraint(condition=models.Q(('capacity__gte', 1)), name='event_capacity_positive'),
        ),
        migrations.AddIndex(
            model_name='client',
            index=models.Index(fields=['site', 'email'], name='api_client_site_id_093739_idx'),
        ),
        migrations.AddIndex(
            model_name='client',
            index=models.Index(fields=['site', 'google_id'], name='api_client_site_id_3ff701_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='client',
            unique_together={('site', 'email')},
        ),
        migrations.AddIndex(
            model_name='booking',
            index=models.Index(fields=['site'], name='api_booking_site_id_26abc3_idx'),
        ),
        migrations.AddIndex(
            model_name='booking',
            index=models.Index(fields=['event'], name='api_booking_event_i_6d6f2d_idx'),
        ),
    ]

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\migrations\0002_site_color.py
```py
# Generated migration for adding color index field to Site model

from django.db import migrations, models


def set_default_color_indices(apps, schema_editor):
    """Set default color indices for existing sites based on their creation order."""
    Site = apps.get_model('api', 'Site')
    
    sites = Site.objects.all().order_by('created_at')
    for index, site in enumerate(sites):
        # Assign color index cyclically (0-11 for 12 colors)
        site.color_index = index % 12
        site.save(update_fields=['color_index'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='site',
            name='color_index',
            field=models.IntegerField(
                default=0,
                help_text='Index of the site color in the palette (0-11)'
            ),
        ),
        migrations.RunPython(set_default_color_indices, reverse_code=migrations.RunPython.noop),
    ]

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\migrations\0003_availabilityblock.py
```py
# Generated by Django 5.2.1 on 2025-10-20 13:22

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_site_color'),
    ]

    operations = [
        migrations.CreateModel(
            name='AvailabilityBlock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(default='Dostępny', max_length=255)),
                ('date', models.DateField()),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('meeting_lengths', models.JSONField(default=list, help_text='List of allowed meeting durations in minutes, e.g., [30, 45, 60]')),
                ('time_snapping', models.IntegerField(default=30, help_text='Interval in minutes for when meetings can start (e.g., 15, 30, 60)')),
                ('buffer_time', models.IntegerField(default=0, help_text='Minimum time between meetings in minutes')),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('admin', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='availability_blocks', to=settings.AUTH_USER_MODEL)),
                ('site', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='availability_blocks', to='api.site')),
            ],
            options={
                'ordering': ['date', 'start_time'],
                'constraints': [models.CheckConstraint(condition=models.Q(('end_time__gt', models.F('start_time'))), name='availability_end_after_start')],
            },
        ),
    ]

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\migrations\0004_platformuser_avatar.py
```py
# Generated by Django 5.2.1 on 2025-10-20 13:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_availabilityblock'),
    ]

    operations = [
        migrations.AddField(
            model_name='platformuser',
            name='avatar',
            field=models.CharField(blank=True, help_text='URL to user avatar image', max_length=500, null=True),
        ),
    ]

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\migrations\0005_customreactcomponent.py
```py
from django.db import migrations, models
import api.models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_platformuser_avatar'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomReactComponent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('source_code', models.TextField(blank=True, help_text='Oryginalny kod JSX dla celów edycji')),
                ('compiled_js', models.FileField(blank=True, null=True, upload_to=api.models.custom_component_path)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
    ]

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\migrations\0006_mediaasset_mediausage.py
```py
# Generated manually to introduce media asset tracking models.
from django.db import migrations, models
import django.utils.timezone
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_customreactcomponent'),
    ]

    operations = [
        migrations.CreateModel(
            name='MediaAsset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_name', models.CharField(max_length=255)),
                ('storage_path', models.CharField(max_length=500, unique=True)),
                ('file_url', models.CharField(max_length=500, unique=True)),
                ('file_hash', models.CharField(max_length=64, unique=True)),
                ('media_type', models.CharField(choices=[('image', 'Image'), ('video', 'Video'), ('other', 'Other')], default='other', max_length=16)),
                ('uploaded_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('uploaded_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='uploaded_media', to='api.platformuser')),
            ],
        ),
        migrations.AddIndex(
            model_name='mediaasset',
            index=models.Index(fields=['media_type'], name='api_mediaas_media_t_e252e3_idx'),
        ),
        migrations.AddIndex(
            model_name='mediaasset',
            index=models.Index(fields=['uploaded_at'], name='api_mediaas_upload_0ebc36_idx'),
        ),
        migrations.CreateModel(
            name='MediaUsage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('usage_type', models.CharField(choices=[('avatar', 'Avatar'), ('site_content', 'Site content')], max_length=32)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('asset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='usages', to='api.mediaasset')),
                ('site', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='media_usages', to='api.site')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='media_usages', to='api.platformuser')),
            ],
        ),
        migrations.AddConstraint(
            model_name='mediausage',
            constraint=models.CheckConstraint(
                check=(
                    (models.Q(site__isnull=False) & models.Q(user__isnull=True)) |
                    (models.Q(site__isnull=True) & models.Q(user__isnull=False))
                ),
                name='mediausage_single_context',
            ),
        ),
        migrations.AddConstraint(
            model_name='mediausage',
            constraint=models.UniqueConstraint(
                fields=['asset', 'site', 'usage_type'],
                condition=models.Q(site__isnull=False),
                name='mediausage_unique_site_usage',
            ),
        ),
        migrations.AddConstraint(
            model_name='mediausage',
            constraint=models.UniqueConstraint(
                fields=['asset', 'user', 'usage_type'],
                condition=models.Q(user__isnull=False),
                name='mediausage_unique_user_usage',
            ),
        ),
    ]

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\migrations\0007_mediaasset_file_size.py
```py
# Generated by Django 5.2.1 on 2025-10-25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_mediaasset_mediausage'),
    ]

    operations = [
        migrations.AddField(
            model_name='mediaasset',
            name='file_size',
            field=models.BigIntegerField(default=0, help_text='Size in bytes of the stored media file'),
        ),
    ]

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\migrations\0008_mediaasset_storage_bucket.py
```py
# Generated by Django 5.2.1 on 2025-10-25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_mediaasset_file_size'),
    ]

    operations = [
        migrations.AddField(
            model_name='mediaasset',
            name='storage_bucket',
            field=models.CharField(blank=True, default='', help_text='Supabase bucket name (if applicable)', max_length=100),
        ),
    ]

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\models.py
```py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from .utils import generate_site_identifier


class PlatformUserManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('account_type', PlatformUser.AccountType.FREE)
        extra_fields.setdefault('source_tag', PlatformUser.SourceTag.WEB)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('account_type', PlatformUser.AccountType.PRO)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)


class PlatformUser(AbstractBaseUser, PermissionsMixin):
    class AccountType(models.TextChoices):
        FREE = 'free', 'Free'
        PRO = 'pro', 'Pro'

    class SourceTag(models.TextChoices):
        JACEK = 'JACEK', 'Jacek Campaign'
        WEB = 'WEB', 'Organic Web'

    username = models.CharField(
        max_length=150,
        unique=True,
        blank=True,
        null=True,
        help_text='Optional unique username used for legacy flows.'
    )
    email = models.EmailField(max_length=254, unique=True)
    first_name = models.CharField(max_length=150, blank=False)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    avatar = models.CharField(max_length=500, blank=True, null=True, help_text='URL to user avatar image')
    account_type = models.CharField(max_length=10, choices=AccountType.choices, default=AccountType.FREE)
    source_tag = models.CharField(max_length=10, choices=SourceTag.choices, default=SourceTag.WEB)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = PlatformUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    def __str__(self):
        return f"{self.email} ({self.get_account_type_display()})"

    class Meta:
        verbose_name = 'Platform user'
        verbose_name_plural = 'Platform users'


class Site(models.Model):
    owner = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='sites')
    name = models.CharField(max_length=255)
    identifier = models.SlugField(max_length=255, unique=True, editable=False, blank=True, null=True)
    color_index = models.IntegerField(default=0, help_text='Index of the site color in the palette (0-11)')
    template_config = models.JSONField(default=dict, blank=True)
    version_history = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        owner = getattr(self, 'owner', None)
        owner_first = getattr(owner, 'first_name', '') if owner else ''
        owner_last = getattr(owner, 'last_name', '') if owner else ''
        desired_identifier = generate_site_identifier(self.pk, self.name, owner_first, owner_last)
        if self.identifier != desired_identifier:
            Site.objects.filter(pk=self.pk).update(identifier=desired_identifier)
            self.identifier = desired_identifier

    def __str__(self):
        return f"{self.name} ({self.identifier})"


class Template(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    template_config = models.JSONField(default=dict)
    thumbnail_url = models.URLField(blank=True, null=True)
    is_public = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Client(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='clients')
    email = models.EmailField()
    name = models.CharField(max_length=255)
    google_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('site', 'email')]
        indexes = [
            models.Index(fields=['site', 'email']),
            models.Index(fields=['site', 'google_id']),
        ]

    def __str__(self):
        return f"{self.email} ({self.site.identifier})"


class Event(models.Model):
    class EventType(models.TextChoices):
        INDIVIDUAL = 'individual', 'Individual'
        GROUP = 'group', 'Group'

    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='events')
    admin = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='managed_events')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    capacity = models.PositiveIntegerField(default=1)
    event_type = models.CharField(max_length=32, choices=EventType.choices, default=EventType.INDIVIDUAL)
    attendees = models.ManyToManyField(Client, related_name='events', blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_time']
        constraints = [
            models.CheckConstraint(check=models.Q(end_time__gt=models.F('start_time')), name='event_end_after_start'),
            models.CheckConstraint(check=models.Q(capacity__gte=1), name='event_capacity_positive'),
        ]

    def __str__(self):
        return f"{self.title} ({self.start_time.isoformat()} - {self.end_time.isoformat()})"


class AvailabilityBlock(models.Model):
    """
    Represents a time window where clients can book appointments.
    The creator defines meeting lengths, time snapping, and buffer time.
    """
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='availability_blocks')
    admin = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='availability_blocks')
    title = models.CharField(max_length=255, default='Dostępny')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    meeting_lengths = models.JSONField(
        default=list,
        help_text='List of allowed meeting durations in minutes, e.g., [30, 45, 60]'
    )
    time_snapping = models.IntegerField(
        default=30,
        help_text='Interval in minutes for when meetings can start (e.g., 15, 30, 60)'
    )
    buffer_time = models.IntegerField(
        default=0,
        help_text='Minimum time between meetings in minutes'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'start_time']
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_time__gt=models.F('start_time')),
                name='availability_end_after_start'
            ),
        ]

    def __str__(self):
        return f"{self.title} on {self.date} ({self.start_time} - {self.end_time})"


class Booking(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='bookings')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, related_name='bookings', null=True, blank=True)
    guest_email = models.EmailField(blank=True, null=True)
    guest_name = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['site']),
            models.Index(fields=['event']),
        ]

    def __str__(self):
        subject = self.client.email if self.client else self.guest_email or 'Guest'
        return f"Booking for {subject} on event {self.event_id}"


class MediaAsset(models.Model):
    class MediaType(models.TextChoices):
        IMAGE = 'image', 'Image'
        VIDEO = 'video', 'Video'
        OTHER = 'other', 'Other'

    file_name = models.CharField(max_length=255)
    storage_path = models.CharField(max_length=500, unique=True)
    file_url = models.CharField(max_length=500, unique=True)
    file_hash = models.CharField(max_length=64, unique=True)
    media_type = models.CharField(max_length=16, choices=MediaType.choices, default=MediaType.OTHER)
    file_size = models.BigIntegerField(default=0, help_text='Size in bytes of the stored media file')
    storage_bucket = models.CharField(max_length=100, blank=True, default='', help_text='Supabase bucket name (if applicable)')
    uploaded_by = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='uploaded_media')
    uploaded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=['media_type']),
            models.Index(fields=['uploaded_at']),
        ]

    def __str__(self):
        return f"{self.file_name} ({self.media_type})"


class MediaUsage(models.Model):
    class UsageType(models.TextChoices):
        AVATAR = 'avatar', 'Avatar'
        SITE_CONTENT = 'site_content', 'Site content'

    asset = models.ForeignKey(MediaAsset, on_delete=models.CASCADE, related_name='usages')
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='media_usages', blank=True, null=True)
    user = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='media_usages', blank=True, null=True)
    usage_type = models.CharField(max_length=32, choices=UsageType.choices)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    (models.Q(site__isnull=False) & models.Q(user__isnull=True)) |
                    (models.Q(site__isnull=True) & models.Q(user__isnull=False))
                ),
                name='mediausage_single_context'
            ),
            models.UniqueConstraint(
                fields=['asset', 'site', 'usage_type'],
                condition=models.Q(site__isnull=False),
                name='mediausage_unique_site_usage'
            ),
            models.UniqueConstraint(
                fields=['asset', 'user', 'usage_type'],
                condition=models.Q(user__isnull=False),
                name='mediausage_unique_user_usage'
            ),
        ]

    def __str__(self):
        target = self.site.identifier if self.site else (self.user.email if self.user else 'unknown')
        return f"{self.usage_type} -> {target}"


def custom_component_path(instance, filename):
    return f'komponenty/{filename}'


class CustomReactComponent(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    source_code = models.TextField(blank=True, help_text='Oryginalny kod JSX dla celów edycji')
    compiled_js = models.FileField(upload_to=custom_component_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\serializers.py
```py
"""Serializers for the multi-tenant Personal Site Generator backend."""

import logging
from django.utils.text import slugify
from rest_framework import serializers

from .models import (
    PlatformUser,
    Site,
    Client,
    Event,
    Booking,
    Template,
    CustomReactComponent,
    MediaUsage,
)
from .media_helpers import cleanup_asset_if_unused, get_asset_by_path_or_url

logger = logging.getLogger(__name__)


class CustomRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = PlatformUser
        fields = ['first_name', 'last_name', 'email', 'password', 'password2', 'account_type', 'source_tag']
        extra_kwargs = {
            'password': {'write_only': True},
            'account_type': {'required': False},
            'source_tag': {'required': False},
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'detail': 'Passwords must match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2', None)
        email = validated_data['email']
        base_username = slugify(email.split('@')[0])
        username = base_username
        counter = 1
        existing_usernames = set(
            PlatformUser.objects.filter(username__startswith=base_username).values_list('username', flat=True)
        )
        while username in existing_usernames:
            username = f"{base_username}{counter}"
            counter += 1

        logger.info("Creating platform user %s with generated username %s", email, username)
        return PlatformUser.objects.create_user(username=username, **validated_data)


class PlatformUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'avatar',
            'account_type', 'source_tag', 'is_staff', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_staff', 'is_active']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        old_avatar_url = instance.avatar
        new_avatar_url = validated_data.get('avatar', old_avatar_url)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        if 'avatar' in validated_data:
            self._sync_avatar_usage(user, old_avatar_url, new_avatar_url)
        return user

    def _sync_avatar_usage(self, user: PlatformUser, old_url: str | None, new_url: str | None) -> None:
        if old_url == new_url:
            return

        if new_url:
            asset = get_asset_by_path_or_url(new_url)
            if asset:
                MediaUsage.objects.get_or_create(
                    asset=asset,
                    user=user,
                    usage_type=MediaUsage.UsageType.AVATAR,
                )
                MediaUsage.objects.filter(
                    user=user,
                    usage_type=MediaUsage.UsageType.AVATAR,
                ).exclude(asset=asset).delete()
            else:
                logger.warning("Avatar URL %s is not managed media", new_url)
                MediaUsage.objects.filter(
                    user=user,
                    usage_type=MediaUsage.UsageType.AVATAR,
                ).delete()
        else:
            MediaUsage.objects.filter(
                user=user,
                usage_type=MediaUsage.UsageType.AVATAR,
            ).delete()

        if old_url and old_url != new_url:
            old_asset = get_asset_by_path_or_url(old_url)
            if old_asset:
                MediaUsage.objects.filter(
                    asset=old_asset,
                    user=user,
                    usage_type=MediaUsage.UsageType.AVATAR,
                ).delete()
                cleanup_asset_if_unused(old_asset)


class SiteSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Site
        fields = [
            'id', 'owner', 'name', 'identifier', 'color_index',
            'template_config', 'version_history',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['identifier', 'created_at', 'updated_at', 'owner']
        extra_kwargs = {
            'color_index': {'required': False}
        }


class PublicSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ['id', 'identifier', 'name', 'template_config', 'updated_at']
        read_only_fields = ['id', 'identifier', 'name', 'template_config', 'updated_at']


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'site', 'email', 'name', 'google_id', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        site = attrs.get('site') or (self.instance.site if self.instance else None)
        if site is None:
            raise serializers.ValidationError({'site': 'Site reference is required.'})
        google_id = attrs.get('google_id')
        if google_id and Client.objects.filter(site=site, google_id=google_id).exclude(
            pk=self.instance.pk if self.instance else None
        ).exists():
            raise serializers.ValidationError({'google_id': 'This Google account is already linked to the site.'})
        return attrs


class EventSerializer(serializers.ModelSerializer):
    attendees = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'site', 'admin', 'title', 'description',
            'start_time', 'end_time', 'capacity', 'event_type',
            'attendees', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'attendees']

    def validate(self, attrs):
        site = attrs.get('site') or (self.instance.site if self.instance else None)
        admin = attrs.get('admin') or (self.instance.admin if self.instance else None)
        if site and admin and not (admin.is_staff or admin.sites.filter(pk=site.pk).exists()):
            raise serializers.ValidationError({'admin': 'Admin must own or have access to the site.'})
        return attrs


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'id', 'site', 'event', 'client', 'guest_email', 'guest_name',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        site = attrs.get('site') or (self.instance.site if self.instance else None)
        event = attrs.get('event') or (self.instance.event if self.instance else None)
        client = attrs.get('client') or (self.instance.client if self.instance else None)

        if event and site and event.site_id != site.id:
            raise serializers.ValidationError({'event': 'Event must belong to the provided site.'})

        if client and site and client.site_id != site.id:
            raise serializers.ValidationError({'client': 'Client must belong to the provided site.'})

        if not client and not (attrs.get('guest_email') or (self.instance.guest_email if self.instance else None)):
            raise serializers.ValidationError({'guest_email': 'Provide a client or guest contact details.'})

        return attrs


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'name', 'description', 'template_config', 'thumbnail_url']


class CustomReactComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomReactComponent
        fields = [
            'id', 'name', 'description', 'source_code', 'compiled_js',
            'created_at', 'updated_at'
        ]
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\signals.py
```py
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .media_helpers import cleanup_asset_if_unused
from .models import Booking, MediaUsage


@receiver(post_save, sender=Booking)
def ensure_attendee_on_booking_save(sender, instance: Booking, created: bool, **kwargs):
    """Ensure the client is attached to the event attendee list whenever a booking exists."""
    if instance.client:
        instance.event.attendees.add(instance.client)


@receiver(post_delete, sender=Booking)
def cleanup_attendee_on_booking_delete(sender, instance: Booking, **kwargs):
    """Remove the attendee when their last booking for the event is deleted."""
    if instance.client:
        remaining = instance.event.bookings.filter(client=instance.client).exists()
        if not remaining:
            instance.event.attendees.remove(instance.client)


@receiver(post_delete, sender=MediaUsage)
def cleanup_media_on_usage_delete(sender, instance: MediaUsage, **kwargs):
    """Remove media files that are no longer referenced anywhere."""
    cleanup_asset_if_unused(instance.asset)
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\tests.py
```py
from django.test import TestCase

# Create your tests here.
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\urls.py
```py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlatformUserViewSet,
    SiteViewSet,
    ClientViewSet,
    EventViewSet,
    BookingViewSet,
    CustomRegisterView,
    GoogleLogin,
    TemplateViewSet,
    PublicSiteView,
    PublicSiteByIdView,
    publish_site,
    FileUploadView,
    CustomReactComponentViewSet,
)

router = DefaultRouter()
router.register(r'users', PlatformUserViewSet, basename='user')
router.register(r'sites', SiteViewSet, basename='site')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'events', EventViewSet, basename='event')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'custom-components', CustomReactComponentViewSet, basename='customcomponent')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', CustomRegisterView.as_view(), name='custom_register'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('public-sites/by-id/<int:site_id>/', PublicSiteByIdView.as_view(), name='public_site_detail_by_id'),
    path('public-sites/<slug:identifier>/', PublicSiteView.as_view(), name='public_site_detail'),
    path('sites/<int:site_id>/publish/', publish_site, name='publish-site'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
]
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\utils.py
```py
"""Utility helpers for the multi-tenant backend."""

from django.utils.text import slugify


def _normalize_owner_segment(first_name: str | None, last_name: str | None) -> str:
    """Create a CamelCase owner segment limited to alphanumeric characters."""
    first = (first_name or '').strip().title()
    last = (last_name or '').strip().title()
    combined = f"{first}{last}"
    alphanumeric = ''.join(ch for ch in combined if ch.isalnum())
    return alphanumeric or 'Owner'


def generate_site_identifier(site_id: int, name: str, owner_first_name: str | None, owner_last_name: str | None) -> str:
    """Return identifier in format `<id>-<site-slug>-<OwnerName>`."""
    slug = slugify(name or '') or 'site'
    owner_segment = _normalize_owner_segment(owner_first_name, owner_last_name)
    identifier = f"{site_id}-{slug}-{owner_segment}"
    # Ensure identifier fits within field limit
    return identifier[:255]
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\api\views.py
```py
"""REST API views for the multi-tenant Personal Site Generator backend."""

import hashlib
import logging
import os
import re

import requests
from django.conf import settings
from django.db.models import Sum
from django.http import Http404, HttpResponseRedirect
from django.views.decorators.cache import never_cache
from django.views.decorators.http import require_http_methods
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

from .models import (
    PlatformUser,
    Site,
    Client,
    Event,
    Booking,
    Template,
    CustomReactComponent,
    MediaAsset,
    MediaUsage,
)
from .media_helpers import (
    cleanup_asset_if_unused,
    get_asset_by_path_or_url,
    normalize_media_path,
)
from .media_processing import ImageProcessingError, convert_to_webp
from .media_storage import StorageError, get_media_storage
from .serializers import (
    PlatformUserSerializer,
    SiteSerializer,
    ClientSerializer,
    EventSerializer,
    BookingSerializer,
    CustomRegisterSerializer,
    TemplateSerializer,
    PublicSiteSerializer,
    CustomReactComponentSerializer,
)

logger = logging.getLogger(__name__)


SAFE_FILENAME_RE = re.compile(r'[^A-Za-z0-9._-]+')
ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'webm', 'mov'}

MEDIA_KIND_IMAGE = 'image'
MEDIA_KIND_VIDEO = 'video'
MEDIA_KIND_OTHER = 'other'

FOLDER_BY_KIND = {
    MEDIA_KIND_IMAGE: 'images',
    MEDIA_KIND_VIDEO: 'videos',
    MEDIA_KIND_OTHER: 'uploads',
}

MEDIA_TYPE_BY_KIND = {
    MEDIA_KIND_IMAGE: MediaAsset.MediaType.IMAGE,
    MEDIA_KIND_VIDEO: MediaAsset.MediaType.VIDEO,
    MEDIA_KIND_OTHER: MediaAsset.MediaType.OTHER,
}


def sanitize_filename(name: str) -> str:
    base = os.path.basename(name or '')
    base = base.strip() or 'asset'
    sanitized = SAFE_FILENAME_RE.sub('_', base)
    return sanitized[:255]


def classify_media(content_type: str | None, extension: str | None) -> str:
    normalized_ext = (extension or '').lstrip('.').lower()
    normalized_type = (content_type or '').lower()
    if normalized_type in settings.MEDIA_ALLOWED_IMAGE_MIME_TYPES or normalized_ext in ALLOWED_IMAGE_EXTENSIONS:
        return MEDIA_KIND_IMAGE
    if normalized_type in settings.MEDIA_ALLOWED_VIDEO_MIME_TYPES or normalized_ext in ALLOWED_VIDEO_EXTENSIONS:
        return MEDIA_KIND_VIDEO
    return MEDIA_KIND_OTHER


def process_media(
    kind: str,
    raw_bytes: bytes,
    *,
    usage: str,
    content_type: str | None,
    extension: str | None,
) -> tuple[bytes, str, str]:
    if kind == MEDIA_KIND_IMAGE:
        if len(raw_bytes) > settings.MEDIA_IMAGE_MAX_UPLOAD_BYTES:
            raise ValueError('Image exceeds allowed upload size')
        quality = (
            settings.MEDIA_WEBP_QUALITY_AVATAR
            if usage == MediaUsage.UsageType.AVATAR
            else settings.MEDIA_WEBP_QUALITY_DEFAULT
        )
        converted, converted_mime = convert_to_webp(
            raw_bytes,
            max_dimensions=settings.MEDIA_IMAGE_MAX_DIMENSIONS,
            quality=quality,
        )
        if len(converted) > settings.MEDIA_IMAGE_MAX_FINAL_BYTES:
            raise ValueError('Optimised image exceeds size limit')
        return converted, converted_mime, '.webp'

    if kind == MEDIA_KIND_VIDEO:
        if len(raw_bytes) > settings.MEDIA_VIDEO_MAX_UPLOAD_BYTES:
            raise ValueError('Video exceeds allowed upload size')
        fallback_ext = (extension or '.mp4')
        if not fallback_ext.startswith('.'):
            fallback_ext = f'.{fallback_ext}'
        mime = content_type or 'video/mp4'
        return raw_bytes, mime, fallback_ext.lower()

    fallback_ext = (extension or '.bin')
    if not fallback_ext.startswith('.'):
        fallback_ext = f'.{fallback_ext}'
    mime = content_type or 'application/octet-stream'
    return raw_bytes, mime, fallback_ext.lower()


def ensure_storage_capacity(user, additional_bytes: int) -> None:
    usage = MediaAsset.objects.filter(uploaded_by=user).aggregate(total=Sum('file_size'))
    current_total = usage.get('total') or 0
    if current_total + additional_bytes > settings.MEDIA_TOTAL_STORAGE_PER_USER:
        raise ValueError('Storage quota exceeded for this account')


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.FRONTEND_URL
    client_class = OAuth2Client


class CustomRegisterView(generics.CreateAPIView):
    queryset = PlatformUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = CustomRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        logger.info("Created new platform user %s", user.email)
        refresh = RefreshToken.for_user(user)
        tokens = {'refresh': str(refresh), 'access': str(refresh.access_token)}
        return Response(tokens, status=status.HTTP_201_CREATED)


class IsOwnerOrStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.is_staff:
            return True
        if isinstance(obj, PlatformUser):
            return obj == request.user
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'site'):
            return obj.site.owner == request.user
        return False


class PlatformUserViewSet(viewsets.ModelViewSet):
    queryset = PlatformUser.objects.all().order_by('-created_at')
    serializer_class = PlatformUserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_permissions(self):
        if self.action == 'me':
            return [IsAuthenticated()]
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return [IsOwnerOrStaff()]
        return super().get_permissions()

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request, *args, **kwargs):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class SiteViewSet(viewsets.ModelViewSet):
    serializer_class = SiteSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        qs = Site.objects.select_related('owner').all()
        if self.request.user.is_staff:
            return qs
        return qs.filter(owner=self.request.user)

    def perform_create(self, serializer):
        """
        Auto-assign the next available color index when creating a new site.
        
        The system supports up to 12 different colors (0-11). This method finds
        the first unused color index for the current user's sites and assigns it
        to the new site. If all colors are in use or color_index is explicitly
        provided in the request, it uses that value instead.
        
        Color assignment order:
        - Site 1 gets color 0 (Crimson Red)
        - Site 2 gets color 1 (Sky Blue)
        - Site 3 gets color 2 (Emerald Green)
        - And so on up to 12 sites
        """
        user_sites = Site.objects.filter(owner=self.request.user).order_by('color_index')
        
        # Find the next available color index
        used_colors = set(site.color_index for site in user_sites if site.color_index is not None)
        next_color_index = 0
        
        # Find the first available color slot (0-11)
        for i in range(12):
            if i not in used_colors:
                next_color_index = i
                break
        
        # If color_index is not provided in request, use the auto-assigned one
        if 'color_index' not in serializer.validated_data or serializer.validated_data['color_index'] is None:
            serializer.save(owner=self.request.user, color_index=next_color_index)
        else:
            serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied('You cannot modify a site you do not own.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied('You cannot delete a site you do not own.')
        instance.delete()

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsOwnerOrStaff])
    def update_color(self, request, pk=None):
        """Update the color index of a specific site."""
        site = self.get_object()
        color_index = request.data.get('color_index')
        
        if color_index is None:
            return Response(
                {'error': 'color_index is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate color index is in valid range (0-11)
        try:
            color_index = int(color_index)
            if color_index < 0 or color_index > 11:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {'error': 'color_index must be an integer between 0 and 11'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        site.color_index = color_index
        site.save(update_fields=['color_index'])
        serializer = self.get_serializer(site)
        return Response(serializer.data)


class SiteScopedMixin:
    def _ensure_site_access(self, site: Site):
        user = self.request.user
        if user.is_staff:
            return
        if site.owner_id != user.id:
            raise PermissionDenied('You do not have access to this site.')

    def _filter_by_site_param(self, queryset):
        site_param = self.request.query_params.get('site')
        if site_param:
            queryset = queryset.filter(site_id=site_param)
        return queryset


class ClientViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Client.objects.select_related('site', 'site__owner')
        if not self.request.user.is_staff:
            qs = qs.filter(site__owner=self.request.user)
        return self._filter_by_site_param(qs)

    def perform_create(self, serializer):
        site = serializer.validated_data['site']
        self._ensure_site_access(site)
        serializer.save()

    def perform_update(self, serializer):
        site = serializer.validated_data.get('site', serializer.instance.site)
        self._ensure_site_access(site)
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_site_access(instance.site)
        instance.delete()


class EventViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Event.objects.select_related('site', 'site__owner', 'admin')
        if not self.request.user.is_staff:
            qs = qs.filter(site__owner=self.request.user)
        return self._filter_by_site_param(qs)

    def perform_create(self, serializer):
        site = serializer.validated_data['site']
        admin = serializer.validated_data.get('admin', self.request.user)
        if not self.request.user.is_staff and admin != self.request.user:
            raise PermissionDenied('You can only create events as yourself.')
        self._ensure_site_access(site)
        serializer.save(admin=admin)

    def perform_update(self, serializer):
        site = serializer.validated_data.get('site', serializer.instance.site)
        admin = serializer.validated_data.get('admin', serializer.instance.admin)
        if not self.request.user.is_staff and admin != self.request.user:
            raise PermissionDenied('You can only manage your own events.')
        self._ensure_site_access(site)
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_site_access(instance.site)
        if not self.request.user.is_staff and instance.admin != self.request.user:
            raise PermissionDenied('You can only delete your own events.')
        instance.delete()


class BookingViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Booking.objects.select_related('site', 'site__owner', 'event', 'client')
        if not self.request.user.is_staff:
            qs = qs.filter(site__owner=self.request.user)
        return self._filter_by_site_param(qs)

    def perform_create(self, serializer):
        site = serializer.validated_data['site']
        self._ensure_site_access(site)
        booking = serializer.save()
        self._sync_attendance(booking)

    def perform_update(self, serializer):
        site = serializer.validated_data.get('site', serializer.instance.site)
        self._ensure_site_access(site)
        booking = serializer.save()
        self._sync_attendance(booking)

    def perform_destroy(self, instance):
        self._ensure_site_access(instance.site)
        instance.delete()

    def _sync_attendance(self, booking: Booking):
        if booking.client:
            booking.event.attendees.add(booking.client)


class TemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Template.objects.filter(is_public=True)
    serializer_class = TemplateSerializer
    permission_classes = [AllowAny]


class PublicSiteView(generics.RetrieveAPIView):
    queryset = Site.objects.select_related('owner')
    serializer_class = PublicSiteSerializer
    permission_classes = [AllowAny]
    lookup_field = 'identifier'


class PublicSiteByIdView(generics.RetrieveAPIView):
    queryset = Site.objects.select_related('owner')
    serializer_class = PublicSiteSerializer
    permission_classes = [AllowAny]
    lookup_field = 'pk'
    lookup_url_kwarg = 'site_id'


class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        file_obj = request.data.get('file')
        usage = request.data.get('usage') or MediaUsage.UsageType.SITE_CONTENT
        site_id = request.data.get('site_id')

        if not file_obj:
            return Response({'error': 'No file was submitted'}, status=status.HTTP_400_BAD_REQUEST)

        if usage not in MediaUsage.UsageType.values:
            return Response({'error': 'Invalid usage value provided'}, status=status.HTTP_400_BAD_REQUEST)

        site = None
        if usage == MediaUsage.UsageType.SITE_CONTENT:
            if not site_id:
                return Response({'error': 'site_id is required for site uploads'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                site = Site.objects.get(pk=site_id, owner=request.user)
            except Site.DoesNotExist as exc:
                raise PermissionDenied('Site not found or access denied') from exc

        storage = get_media_storage()
        safe_name = sanitize_filename(getattr(file_obj, 'name', ''))

        try:
            file_bytes = file_obj.read()
        except Exception as exc:  # pragma: no cover - depends on storage backend
            logger.exception("Failed to read uploaded file")
            return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not file_bytes:
            return Response({'error': 'Uploaded file is empty'}, status=status.HTTP_400_BAD_REQUEST)

        file_hash = hashlib.sha256(file_bytes).hexdigest()
        extension = os.path.splitext(safe_name)[1].lower()
        media_kind = classify_media(file_obj.content_type, extension)
        bucket_name = (
            settings.SUPABASE_STORAGE_BUCKET_MAP.get(media_kind)
            or settings.SUPABASE_STORAGE_BUCKET_MAP.get('other')
            or ''
        )

        try:
            processed_bytes, processed_mime, final_extension = process_media(
                media_kind,
                file_bytes,
                usage=usage,
                content_type=file_obj.content_type,
                extension=extension,
            )
        except ValueError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except ImageProcessingError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        final_size = len(processed_bytes)
        asset = MediaAsset.objects.filter(file_hash=file_hash).first()
        if asset and asset.storage_bucket:
            bucket_name = asset.storage_bucket
        created = asset is None
        storage_result = None

        if created:
            try:
                ensure_storage_capacity(request.user, final_size)
            except ValueError as exc:
                return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

            storage_key = f"{FOLDER_BY_KIND[media_kind]}/{file_hash}{final_extension}"
            try:
                storage_result = storage.save(bucket_name, storage_key, processed_bytes, processed_mime)
                bucket_name = storage_result.bucket or bucket_name
            except StorageError as exc:  # pragma: no cover - storage backend dependent
                logger.exception("Storage backend rejected file upload")
                return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as exc:  # pragma: no cover - storage backend dependent
                logger.exception("Unexpected error while saving media asset")
                return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            asset = MediaAsset.objects.create(
                file_name=safe_name,
                storage_path=storage_result.path,
                file_url=storage_result.url,
                file_hash=file_hash,
                media_type=MEDIA_TYPE_BY_KIND[media_kind],
                file_size=final_size,
                storage_bucket=bucket_name,
                uploaded_by=request.user,
            )
        else:
            if asset.file_size == 0 and final_size:
                MediaAsset.objects.filter(pk=asset.pk, file_size=0).update(file_size=final_size)
                asset.file_size = final_size
            if not asset.storage_bucket and bucket_name:
                MediaAsset.objects.filter(pk=asset.pk, storage_bucket='').update(storage_bucket=bucket_name)
                asset.storage_bucket = bucket_name

        asset_url = asset.file_url or (storage_result.url if storage_result else None)
        if not asset_url and bucket_name:
            public_map = getattr(settings, 'SUPABASE_STORAGE_PUBLIC_URLS', {})
            public_base = public_map.get(bucket_name)
            if public_base:
                asset_url = f"{public_base.rstrip('/')}/{asset.storage_path.lstrip('/')}"
        if not asset_url:
            built_url = None
            try:
                built_url = storage.build_url(bucket_name, asset.storage_path)
            except Exception:  # pragma: no cover - storage backend dependent
                built_url = None
            asset_url = built_url or asset.file_url

        if not asset.file_url and asset_url:
            MediaAsset.objects.filter(pk=asset.pk, file_url='').update(file_url=asset_url)
            asset.file_url = asset_url

        usage_filters = {'asset': asset, 'usage_type': usage}
        if usage == MediaUsage.UsageType.AVATAR:
            usage_filters['user'] = request.user
        else:
            usage_filters['site'] = site

        MediaUsage.objects.get_or_create(**usage_filters)

        if usage == MediaUsage.UsageType.AVATAR:
            MediaUsage.objects.filter(user=request.user, usage_type=MediaUsage.UsageType.AVATAR).exclude(asset=asset).delete()

        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(
            {
                'url': asset_url,
                'hash': asset.file_hash,
                'asset_id': asset.id,
                'bucket': asset.storage_bucket,
                'deduplicated': not created,
            },
            status=response_status,
        )

    def delete(self, request, *args, **kwargs):
        raw_url = request.data.get('url') or request.query_params.get('url')
        if not raw_url:
            return Response({'error': 'No file URL provided'}, status=status.HTTP_400_BAD_REQUEST)
        usage = request.data.get('usage') or request.query_params.get('usage') or MediaUsage.UsageType.SITE_CONTENT
        site_id = request.data.get('site_id') or request.query_params.get('site_id')

        if usage not in MediaUsage.UsageType.values:
            return Response({'error': 'Invalid usage value provided'}, status=status.HTTP_400_BAD_REQUEST)

        relative_path = normalize_media_path(raw_url)
        allowed_prefixes = ('images/', 'videos/', 'uploads/')
        if not relative_path or not relative_path.startswith(allowed_prefixes):
            return Response({'error': 'Invalid media path'}, status=status.HTTP_400_BAD_REQUEST)

        asset = get_asset_by_path_or_url(raw_url)
        if not asset:
            logger.info("No media asset registered for %s", raw_url)
            return Response(status=status.HTTP_204_NO_CONTENT)

        if usage == MediaUsage.UsageType.AVATAR:
            deleted_count, _ = MediaUsage.objects.filter(
                asset=asset,
                user=request.user,
                usage_type=MediaUsage.UsageType.AVATAR,
            ).delete()
            if request.user.avatar == asset.file_url:
                request.user.avatar = None
                request.user.save(update_fields=['avatar'])
        else:
            if not site_id:
                return Response({'error': 'site_id is required to detach site media'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                site = Site.objects.get(pk=site_id, owner=request.user)
            except Site.DoesNotExist as exc:
                raise PermissionDenied('Site not found or access denied') from exc

            deleted_count, _ = MediaUsage.objects.filter(
                asset=asset,
                site=site,
                usage_type=MediaUsage.UsageType.SITE_CONTENT,
            ).delete()

        if deleted_count == 0:
            cleanup_asset_if_unused(asset)

        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_site(request, site_id):
    try:
        site = Site.objects.get(id=site_id, owner=request.user)
    except Site.DoesNotExist:
        return Response({'error': 'Site not found'}, status=404)

    base_hook_url = getattr(settings, 'VERCEL_BUILD_HOOK_URL', None)
    if not base_hook_url:
        logger.error("VERCEL_BUILD_HOOK_URL is not configured in the environment.")
        return Response({'error': 'Vercel Build Hook URL is not configured on the server.'}, status=500)

    hook_url = f"{base_hook_url}?siteId={site.id}"

    try:
        response = requests.post(hook_url)
        response.raise_for_status()
        logger.info("Successfully triggered Vercel build for site ID %s (%s)", site.id, site.identifier)
        return Response({'message': 'Site publish initiated successfully', 'site_identifier': site.identifier})
    except requests.RequestException as exc:
        logger.error("Failed to trigger Vercel build for site ID %s: %s", site.id, exc)
        return Response({'error': 'Failed to trigger Vercel build', 'details': str(exc)}, status=500)


@require_http_methods(['GET'])
@never_cache
def supabase_media_redirect(request, media_path: str):
    """Redirect `/media/...` requests to the Supabase public URL."""
    if not getattr(settings, 'SUPABASE_STORAGE_PUBLIC_URLS', None):
        raise Http404()

    normalized = normalize_media_path(media_path)
    if not normalized:
        raise Http404()

    asset = (
        MediaAsset.objects.filter(storage_path=normalized).first()
        or get_asset_by_path_or_url(media_path)
    )
    if asset is None:
        raise Http404()

    target_url = asset.file_url
    if not target_url:
        bucket_name = asset.storage_bucket or settings.SUPABASE_STORAGE_BUCKET_MAP.get('other')
        public_base = settings.SUPABASE_STORAGE_PUBLIC_URLS.get(bucket_name)
        if public_base:
            target_url = f"{public_base.rstrip('/')}/{normalized}"

    if not target_url or not target_url.startswith(('http://', 'https://')):
        raise Http404()

    return HttpResponseRedirect(target_url)


class CustomReactComponentViewSet(viewsets.ModelViewSet):
    queryset = CustomReactComponent.objects.all()
    serializer_class = CustomReactComponentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_compiled(self, request, pk=None):
        component = self.get_object()
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        source_code = request.data.get('source_code')
        if source_code is not None:
            component.source_code = source_code

        safe_name = component.name.lower().replace(' ', '_')
        filename = f"{safe_name}_{component.id}.js"
        component.compiled_js.save(filename, file_obj, save=False)
        component.save()
        serializer = self.get_serializer(component)
        return Response(serializer.data)

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\manage.py
```py
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'site_project.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\site_project\__init__.py
(empty file)

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\site_project\asgi.py
```py
"""
ASGI config for site_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'site_project.settings')

application = get_asgi_application()

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\site_project\settings.py
```py
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

```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\site_project\urls.py
```py
# site_project/urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from api import views as api_views
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('api.urls')),
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/schema/', SpectacularAPIView.as_view(), name='api-schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='api-schema'), name='api-docs'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='api-schema'), name='api-redoc'),
]

if settings.SUPABASE_STORAGE_PUBLIC_URLS:
    urlpatterns = [
        path('media/<path:media_path>', api_views.supabase_media_redirect, name='media-redirect'),
    ] + urlpatterns

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

File: c:\Users\Bogdan\New folder (4)\ZPI\BACKEND\site_project\wsgi.py
```py
"""
WSGI config for site_project project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'site_project.settings')

application = get_wsgi_application()

```