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
    Notification,
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
    NotificationSerializer,
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

        removed = False
        if deleted_count == 0:
            # Attempt to cleanup the underlying asset if no usages remain.
            try:
                removed = cleanup_asset_if_unused(asset)
            except Exception:  # pragma: no cover - storage backend dependent
                logger.exception('Error while attempting to cleanup asset %s', asset.id)

        # Return JSON describing what happened so frontend can react accordingly.
        payload = {
            'asset_id': asset.id,
            'detached_usages': deleted_count,
            'removed': bool(removed),
        }
        status_code = status.HTTP_200_OK if (deleted_count > 0 or removed) else status.HTTP_204_NO_CONTENT
        return Response(payload, status=status_code)


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


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
