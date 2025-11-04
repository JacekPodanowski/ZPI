"""REST API views for the multi-tenant Personal Site Generator backend."""

import base64
import hashlib
import logging
import os
import re
from typing import Any, Dict

import requests
from django.conf import settings
from django.db.models import Sum
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from allauth.account.models import EmailAddress, EmailConfirmation, EmailConfirmationHMAC
from allauth.account.utils import send_email_confirmation
from rest_framework import viewsets, permissions, status, generics, serializers
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
    AvailabilityBlock,
    TermsOfService,
    MagicLink,
)
from .media_helpers import (
    cleanup_asset_if_unused,
    get_asset_by_path_or_url,
    normalize_media_path,
)
from .media_processing import ImageProcessingError, convert_to_webp
from .media_storage import StorageError, StorageSaveResult, get_media_storage
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
    inline_serializer,
)

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
    AvailabilityBlockSerializer,
    SendEmailSerializer,
    AdminSessionCancellationEmailSerializer,
    AdminSessionNewReservationEmailSerializer,
    SessionCanceledByAdminEmailSerializer,
    SessionConfirmedDiscordEmailSerializer,
    SessionConfirmedGoogleMeetEmailSerializer,
    SessionNewReservationEmailSerializer,
)
from .tasks import send_custom_email_task_async

logger = logging.getLogger(__name__)


def tag_viewset(*tags, operations=None):
    """Decorator to apply tags and common metadata to specified viewset operations."""

    def decorator(cls):
        ops = operations or ['list', 'retrieve', 'create', 'update', 'partial_update', 'destroy']
        
        # Define typed path parameter for detail operations
        # DefaultRouter uses 'id' in the OpenAPI schema even though internally it's 'pk'
        detail_param = OpenApiParameter(
            name='id',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.PATH,
            description=f"A unique integer value identifying this {getattr(cls, '__name__', 'resource').replace('ViewSet', '').lower()}.",
        )
        
        schema_kwargs = {}
        for op in ops:
            kwargs: Dict[str, Any] = {'tags': list(tags)}
            # Add typed parameter for detail operations
            if op in {'retrieve', 'update', 'partial_update', 'destroy'}:
                kwargs['parameters'] = [detail_param]
            schema_kwargs[op] = extend_schema(**kwargs)
        return extend_schema_view(**schema_kwargs)(cls)

    return decorator


EMAIL_ACCEPTED_RESPONSE_SERIALIZER = inline_serializer(
    name='EmailSendAcceptedResponse',
    fields={
        'status': serializers.CharField(),
        'detail': serializers.CharField(),
    },
)

EMAIL_ACCEPTED_RESPONSE = OpenApiResponse(
    response=EMAIL_ACCEPTED_RESPONSE_SERIALIZER,
    description='Email send task accepted for processing.',
)


FILE_UPLOAD_REQUEST_SERIALIZER = inline_serializer(
    name='FileUploadRequest',
    fields={
        'file': serializers.FileField(),
        'usage': serializers.ChoiceField(choices=list(MediaUsage.UsageType.values)),
        'site_id': serializers.IntegerField(required=False),
    },
)

FILE_UPLOAD_RESPONSE_SERIALIZER = inline_serializer(
    name='FileUploadResponse',
    fields={
        'url': serializers.CharField(),
        'hash': serializers.CharField(),
        'asset_id': serializers.IntegerField(),
        'bucket': serializers.CharField(allow_null=True, required=False),
        'deduplicated': serializers.BooleanField(),
    },
)

FILE_DELETE_RESPONSE_SERIALIZER = inline_serializer(
    name='FileDeleteResponse',
    fields={
        'asset_id': serializers.IntegerField(),
        'detached_usages': serializers.IntegerField(),
        'removed': serializers.BooleanField(),
    },
)


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


@extend_schema(tags=['Auth'])
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.FRONTEND_URL
    client_class = OAuth2Client


@extend_schema(tags=['Auth'])
class CustomRegisterView(generics.CreateAPIView):
    """
    Custom registration endpoint that creates inactive users and sends email verification.
    Users cannot login until they click the verification link in their email.
    """
    queryset = PlatformUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = CustomRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        logger.info("Created new platform user %s (inactive, pending email verification)", user.email)
        
        # Create EmailAddress record for allauth
        email_address = EmailAddress.objects.create(
            user=user,
            email=user.email,
            primary=True,
            verified=False
        )
        
        # Send verification email
        try:
            send_email_confirmation(request, user, signup=True)
            logger.info("Verification email sent to %s", user.email)
        except Exception as e:
            logger.error("Failed to send verification email to %s: %s", user.email, str(e))
            # Don't fail the registration, user can request resend
        
        return Response({
            'detail': 'Registration successful. Please check your email to verify your account.',
            'email': user.email,
            'verification_sent': True
        }, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Auth'],
    summary='Resend email verification',
    description='Resend verification email to a user who has not yet verified their email address.',
    request=inline_serializer(
        name='ResendVerificationRequest',
        fields={'email': serializers.EmailField()}
    ),
    responses={
        200: inline_serializer(
            name='ResendVerificationResponse',
            fields={'detail': serializers.CharField()}
        ),
        404: OpenApiResponse(description='User not found or already verified'),
    }
)
class ResendVerificationEmailView(APIView):
    """Resend email verification link to inactive users."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = PlatformUser.objects.get(email=email)
            
            # Check if user is already active
            if user.is_active:
                return Response({
                    'detail': 'This account is already verified. You can log in.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if EmailAddress exists
            email_address = EmailAddress.objects.filter(user=user, email=email).first()
            if email_address and email_address.verified:
                return Response({
                    'detail': 'Email is already verified. You can log in.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Send verification email
            send_email_confirmation(request, user, signup=False)
            logger.info("Resent verification email to %s", user.email)
            
            return Response({
                'detail': 'Verification email has been resent. Please check your inbox.',
                'email': user.email
            }, status=status.HTTP_200_OK)
            
        except PlatformUser.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({
                'detail': 'If an account with this email exists and is not verified, a verification email will be sent.',
                'email': email
            }, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Auth'],
    summary='Confirm email address',
    description='Confirm user email address using the verification key from the email link.',
    request=inline_serializer(
        name='ConfirmEmailRequest',
        fields={'key': serializers.CharField()}
    ),
    responses={
        200: inline_serializer(
            name='ConfirmEmailResponse',
            fields={
                'detail': serializers.CharField(),
                'email': serializers.EmailField(),
            }
        ),
        400: OpenApiResponse(description='Invalid or expired key'),
        404: OpenApiResponse(description='Confirmation not found'),
    }
)
class ConfirmEmailView(APIView):
    """Confirm email address using verification key from email link."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        key = request.data.get('key')
        if not key:
            return Response({'detail': 'Verification key is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Try to get the email confirmation object
            email_confirmation = EmailConfirmation.objects.get(key=key.lower())
            
            # Check if already confirmed
            if email_confirmation.email_address.verified:
                return Response({
                    'detail': 'Email address already verified. You can log in now.',
                    'email': email_confirmation.email_address.email,
                    'already_verified': True
                }, status=status.HTTP_200_OK)
            
            # Confirm the email
            email_confirmation.confirm(request)
            
            # Activate the user account
            user = email_confirmation.email_address.user
            if not user.is_active:
                user.is_active = True
                user.save(update_fields=['is_active'])
            
            logger.info("Email verified and account activated for user %s", user.email)
            
            return Response({
                'detail': 'Email verified successfully! You can now log in.',
                'email': user.email,
                'verified': True
            }, status=status.HTTP_200_OK)
            
        except EmailConfirmation.DoesNotExist:
            # Try HMAC-based confirmation as fallback
            try:
                email_confirmation_hmac = EmailConfirmationHMAC.from_key(key)
                if email_confirmation_hmac:
                    # Check if already confirmed
                    if email_confirmation_hmac.email_address.verified:
                        return Response({
                            'detail': 'Email address already verified. You can log in now.',
                            'email': email_confirmation_hmac.email_address.email,
                            'already_verified': True
                        }, status=status.HTTP_200_OK)
                    
                    # Confirm the email
                    email_confirmation_hmac.confirm(request)
                    
                    # Activate the user account
                    user = email_confirmation_hmac.email_address.user
                    if not user.is_active:
                        user.is_active = True
                        user.save(update_fields=['is_active'])
                    
                    logger.info("Email verified (HMAC) and account activated for user %s", user.email)
                    
                    return Response({
                        'detail': 'Email verified successfully! You can now log in.',
                        'email': user.email,
                        'verified': True
                    }, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error("Email confirmation failed: %s", str(e))
            
            return Response({
                'detail': 'Invalid or expired verification link.',
                'error': 'invalid_key'
            }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Auth'],
    summary='Request magic link login',
    description='Request a passwordless login link to be sent to the specified email address.',
    request=inline_serializer(
        name='RequestMagicLinkRequest',
        fields={'email': serializers.EmailField()}
    ),
    responses={
        200: inline_serializer(
            name='RequestMagicLinkResponse',
            fields={
                'detail': serializers.CharField(),
                'email': serializers.EmailField(),
            }
        ),
        400: OpenApiResponse(description='Invalid email'),
    }
)
class RequestMagicLinkView(APIView):
    """Request a magic link for passwordless login."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user exists and is active
        try:
            user = PlatformUser.objects.get(email=email)
            if not user.is_active:
                return Response({
                    'detail': 'Your account is not verified. Please check your email for the verification link.',
                    'error': 'account_not_verified'
                }, status=status.HTTP_400_BAD_REQUEST)
        except PlatformUser.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({
                'detail': 'If an account with this email exists, a magic link will be sent.',
                'email': email
            }, status=status.HTTP_200_OK)
        
        # Create magic link
        magic_link = MagicLink.create_for_email(email, expiry_minutes=15)
        
        # Send email with magic link
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        magic_link_url = f"{frontend_url}/studio/magic-login/{magic_link.token}"
        
        # Render email
        email_subject = 'Your Magic Login Link'
        email_html = render_to_string('emails/magic_link_login.html', {
            'user': user,
            'magic_link_url': magic_link_url,
            'expiry_minutes': 15,
        })
        email_text = strip_tags(email_html)
        
        # Send email
        from django.core.mail import send_mail
        try:
            send_mail(
                subject=email_subject,
                message=email_text,
                html_message=email_html,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            logger.info("Magic link sent to %s", email)
        except Exception as e:
            logger.error("Failed to send magic link email: %s", str(e))
            return Response({
                'detail': 'Failed to send magic link. Please try again later.',
                'error': 'email_failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'detail': 'Magic link sent! Please check your email.',
            'email': email
        }, status=status.HTTP_200_OK)


@extend_schema(
    tags=['Auth'],
    summary='Verify magic link and login',
    description='Verify magic link token and return JWT tokens for authentication.',
    request=inline_serializer(
        name='VerifyMagicLinkRequest',
        fields={'token': serializers.CharField()}
    ),
    responses={
        200: inline_serializer(
            name='VerifyMagicLinkResponse',
            fields={
                'detail': serializers.CharField(),
                'email': serializers.EmailField(),
                'access': serializers.CharField(),
                'refresh': serializers.CharField(),
            }
        ),
        400: OpenApiResponse(description='Invalid or expired token'),
        404: OpenApiResponse(description='Token not found'),
    }
)
class VerifyMagicLinkView(APIView):
    """Verify magic link token and login user."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        token = request.data.get('token')
        if not token:
            return Response({'detail': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            magic_link = MagicLink.objects.get(token=token)
        except MagicLink.DoesNotExist:
            return Response({
                'detail': 'Invalid magic link.',
                'error': 'invalid_token'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if valid
        if not magic_link.is_valid():
            if magic_link.used:
                return Response({
                    'detail': 'This magic link has already been used.',
                    'error': 'already_used'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({
                    'detail': 'This magic link has expired. Please request a new one.',
                    'error': 'expired'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get user
        try:
            user = PlatformUser.objects.get(email=magic_link.email)
            if not user.is_active:
                return Response({
                    'detail': 'Your account is not active.',
                    'error': 'account_inactive'
                }, status=status.HTTP_400_BAD_REQUEST)
        except PlatformUser.DoesNotExist:
            return Response({
                'detail': 'User account not found.',
                'error': 'user_not_found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Mark magic link as used
        magic_link.mark_as_used()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        logger.info("User %s logged in via magic link", user.email)
        
        return Response({
            'detail': 'Login successful!',
            'email': user.email,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)


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


@tag_viewset('Users')
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


@tag_viewset('Sites')
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


@tag_viewset('Clients')
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


@tag_viewset('Events')
class EventViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Event.objects.select_related('site', 'site__owner', 'creator')
        if not self.request.user.is_staff:
            qs = qs.filter(site__owner=self.request.user)
        return self._filter_by_site_param(qs)

    def perform_create(self, serializer):
        site = serializer.validated_data['site']
        creator = serializer.validated_data.get('creator', self.request.user)
        if not self.request.user.is_staff and creator != self.request.user:
            raise PermissionDenied('You can only create events as yourself.')
        self._ensure_site_access(site)
        serializer.save(creator=creator)

    def perform_update(self, serializer):
        site = serializer.validated_data.get('site', serializer.instance.site)
        creator = serializer.validated_data.get('creator', serializer.instance.creator)
        if not self.request.user.is_staff and creator != self.request.user:
            raise PermissionDenied('You can only manage your own events.')
        self._ensure_site_access(site)
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_site_access(instance.site)
        if not self.request.user.is_staff and instance.creator != self.request.user:
            raise PermissionDenied('You can only delete your own events.')
        instance.delete()


@tag_viewset('Bookings')
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


@tag_viewset('Availability')
class AvailabilityBlockViewSet(SiteScopedMixin, viewsets.ModelViewSet):
    serializer_class = AvailabilityBlockSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = AvailabilityBlock.objects.select_related('site', 'site__owner', 'creator')
        if not self.request.user.is_staff:
            qs = qs.filter(site__owner=self.request.user)
        return self._filter_by_site_param(qs)

    def perform_create(self, serializer):
        site = serializer.validated_data['site']
        creator = serializer.validated_data.get('creator', self.request.user)
        if not self.request.user.is_staff and creator != self.request.user:
            raise PermissionDenied('You can only create availability blocks as yourself.')
        self._ensure_site_access(site)
        serializer.save(creator=creator)

    def perform_update(self, serializer):
        site = serializer.validated_data.get('site', serializer.instance.site)
        creator = serializer.validated_data.get('creator', serializer.instance.creator)
        if not self.request.user.is_staff and creator != self.request.user:
            raise PermissionDenied('You can only manage your own availability blocks.')
        self._ensure_site_access(site)
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_site_access(instance.site)
        if not self.request.user.is_staff and instance.creator != self.request.user:
            raise PermissionDenied('You can only delete your own availability blocks.')
        instance.delete()


@tag_viewset('Templates', operations=['list', 'retrieve'])
class TemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Template.objects.filter(is_public=True)
    serializer_class = TemplateSerializer
    permission_classes = [AllowAny]


@extend_schema(tags=['Public Sites'])
class PublicSiteView(generics.RetrieveAPIView):
    queryset = Site.objects.select_related('owner')
    serializer_class = PublicSiteSerializer
    permission_classes = [AllowAny]
    lookup_field = 'identifier'


@extend_schema(tags=['Public Sites'])
class PublicSiteByIdView(generics.RetrieveAPIView):
    queryset = Site.objects.select_related('owner')
    serializer_class = PublicSiteSerializer
    permission_classes = [AllowAny]
    lookup_field = 'pk'
    lookup_url_kwarg = 'site_id'


class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Media'],
        request=FILE_UPLOAD_REQUEST_SERIALIZER,
        responses={
            201: FILE_UPLOAD_RESPONSE_SERIALIZER,
            200: FILE_UPLOAD_RESPONSE_SERIALIZER,
            400: OpenApiResponse(description='Validation error'),
            500: OpenApiResponse(description='Storage backend error'),
        },
    )
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
                exc_str = str(exc).lower()
                # Handle case where file exists in storage but not in DB (after DB reset)
                if 'duplicate' in exc_str or 'already exists' in exc_str:
                    logger.warning(f"File already exists in storage, using existing file: {storage_key}")
                    # Build URL for existing file
                    try:
                        storage_url = storage.build_url(bucket_name, storage_key)
                        storage_result = StorageSaveResult(
                            bucket=bucket_name,
                            path=storage_key,
                            url=storage_url
                        )
                    except Exception as build_exc:
                        logger.error(f"Failed to build URL for existing file: {build_exc}")
                        return Response({'error': 'File exists but cannot access it'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                else:
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

        payload = {
            'url': asset_url,
            'hash': asset.file_hash,
            'asset_id': asset.id,
            'bucket': asset.storage_bucket,
            'deduplicated': not created,
        }
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(payload, status=response_status)

    @extend_schema(
        tags=['Media'],
        request=None,
        parameters=[
            OpenApiParameter('url', OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter('usage', OpenApiTypes.STR, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter('site_id', OpenApiTypes.INT, location=OpenApiParameter.QUERY, required=False),
        ],
        responses={
            200: FILE_DELETE_RESPONSE_SERIALIZER,
            204: OpenApiResponse(description='No content'),
            400: OpenApiResponse(description='Validation error'),
        },
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
        if status_code == status.HTTP_204_NO_CONTENT:
            return Response(status=status_code)
        return Response(payload, status=status_code)


@extend_schema(
    tags=['Sites'],
    summary='Trigger site publish',
    description='Invoke the Vercel build hook to publish the specified site.',
    request=None,
    responses={
        200: inline_serializer(
            name='PublishSiteResponse',
            fields={
                'message': serializers.CharField(),
                'site_identifier': serializers.CharField(),
            },
        ),
        404: OpenApiResponse(description='Site not found'),
        500: OpenApiResponse(description='Failed to trigger Vercel build'),
    },
)
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


@tag_viewset('Custom Components')
class CustomReactComponentViewSet(viewsets.ModelViewSet):
    queryset = CustomReactComponent.objects.all()
    serializer_class = CustomReactComponentSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    @extend_schema(tags=['Custom Components'])
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


@tag_viewset('Notifications')
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@extend_schema(tags=['Messaging'])
class SendEmailView(APIView):
    """Queue a custom email for delivery, optionally including an attachment."""

    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    @extend_schema(
        summary="Send custom email",
        description=(
            "Queue a custom email delivery. Accepts multipart data containing recipient, "
            "subject, message, and optional attachment."
        ),
        request=SendEmailSerializer,
        responses={
            202: EMAIL_ACCEPTED_RESPONSE,
            400: OpenApiResponse(description='Validation error'),
            500: OpenApiResponse(description='Attachment read failure'),
        },
        tags=['Messaging'],
    )
    def post(self, request, *args, **kwargs):
        serializer = SendEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        recipient = validated['recipient']
        subject = validated['subject']
        message = validated['message']
        attachment = validated.get('attachment')

        attachment_content_b64 = None
        attachment_filename = None
        attachment_mimetype = None

        if attachment:
            try:
                attachment_content = attachment.read()
            except Exception as exc:  # pragma: no cover - backend specific
                logger.exception("Failed to read attachment for custom email send")
                return Response(
                    {'detail': 'Failed to read the provided attachment.'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            attachment_content_b64 = base64.b64encode(attachment_content).decode('utf-8')
            attachment_filename = attachment.name
            attachment_mimetype = getattr(attachment, 'content_type', None)

        send_custom_email_task_async.delay(
            recipient_list=[recipient],
            subject=subject,
            message=message,
            attachment_content_b64=attachment_content_b64,
            attachment_filename=attachment_filename,
            attachment_mimetype=attachment_mimetype,
        )

        return Response(
            {
                'status': 'success',
                'detail': 'Email send task has been queued for processing.',
            },
            status=status.HTTP_202_ACCEPTED,
        )


class BaseTemplatedEmailView(APIView):
    """Base view for queuing templated emails with JSON payloads."""

    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser,)
    serializer_class = None
    template_name: str = ''
    default_subject: str = ''
    success_detail: str = 'Email send task has been queued for processing.'

    def get_serializer_class(self):
        if self.serializer_class is None:
            raise NotImplementedError('serializer_class must be defined.')
        return self.serializer_class

    def build_context(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform validated serializer data (excluding meta fields) into template context."""

        return data

    def get_email_subject(self, data: Dict[str, Any]) -> str:
        return data.get('email_subject') or self.default_subject

    def get_plain_message(self, html_content: str, context: Dict[str, Any]) -> str | None:
        plain = strip_tags(html_content).strip()
        return plain or None

    def post(self, request, *args, **kwargs):
        serializer_cls = self.get_serializer_class()
        serializer = serializer_cls(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated = serializer.validated_data
        recipient = validated.get('recipient')
        subject = self.get_email_subject(validated)

        if not subject:
            return Response(
                {'email_subject': ['Subject is required for this email template.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        context_input = {
            key: value
            for key, value in validated.items()
            if key not in {'recipient', 'email_subject'}
        }
        context = self.build_context(context_input)
        html_content = render_to_string(self.template_name, context)
        plain_message = self.get_plain_message(html_content, context)

        logger.info(
            "Queueing templated email '%s' to %s using template %s",
            subject,
            recipient,
            self.template_name,
        )

        send_custom_email_task_async.delay(
            recipient_list=[recipient],
            subject=subject,
            message=plain_message,
            html_content=html_content,
        )

        return Response(
            {
                'status': 'success',
                'detail': self.success_detail,
            },
            status=status.HTTP_202_ACCEPTED,
        )


@extend_schema(
    tags=['Messaging'],
    summary='Send admin session cancellation notification',
    description='Queue an email informing admin about a student-cancelled session.',
    request=AdminSessionCancellationEmailSerializer,
    responses={202: EMAIL_ACCEPTED_RESPONSE, 400: OpenApiResponse(description='Validation error')},
)
class AdminSessionCancellationEmailView(BaseTemplatedEmailView):
    serializer_class = AdminSessionCancellationEmailSerializer
    template_name = 'emails/admin_session_cancellation_notification.html'
    default_subject = 'Powiadomienie: Student anulował sesję'

    def build_context(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'student_name': data['student_name'],
            'subject': data['session_title'],
            'date': data['date'],
            'start_time': data['start_time'],
            'end_time': data['end_time'],
        }


@extend_schema(
    tags=['Messaging'],
    summary='Send pending reservation notification to admin',
    description='Queue an email notifying admin about a new reservation awaiting confirmation.',
    request=AdminSessionNewReservationEmailSerializer,
    responses={202: EMAIL_ACCEPTED_RESPONSE, 400: OpenApiResponse(description='Validation error')},
)
class AdminSessionNewReservationEmailView(BaseTemplatedEmailView):
    serializer_class = AdminSessionNewReservationEmailSerializer
    template_name = 'emails/admin_session_new_reservation_notification.html'
    default_subject = 'Nowa rezerwacja sesji oczekuje na potwierdzenie!'

    def build_context(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'student_name': data['student_name'],
            'subject': data['session_title'],
            'date': data['date'],
            'start_time': data['start_time'],
            'end_time': data['end_time'],
            'admin_url': data['admin_url'],
        }


@extend_schema(
    tags=['Messaging'],
    summary='Send cancellation notice to student',
    description='Queue an email informing student that the tutor cancelled the session.',
    request=SessionCanceledByAdminEmailSerializer,
    responses={202: EMAIL_ACCEPTED_RESPONSE, 400: OpenApiResponse(description='Validation error')},
)
class SessionCanceledByAdminEmailView(BaseTemplatedEmailView):
    serializer_class = SessionCanceledByAdminEmailSerializer
    template_name = 'emails/session_canceled_by_admin.html'
    default_subject = 'Twoja sesja korepetycji została odwołana'

    def build_context(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'student_name': data['student_name'],
            'subject': data['session_title'],
            'date': data['date'],
            'start_time': data['start_time'],
            'end_time': data['end_time'],
            'calendar_url': data['calendar_url'],
        }


@extend_schema(
    tags=['Messaging'],
    summary='Send Discord confirmation to student',
    description='Queue an email confirming a Discord session for the student.',
    request=SessionConfirmedDiscordEmailSerializer,
    responses={202: EMAIL_ACCEPTED_RESPONSE, 400: OpenApiResponse(description='Validation error')},
)
class SessionConfirmedDiscordEmailView(BaseTemplatedEmailView):
    serializer_class = SessionConfirmedDiscordEmailSerializer
    template_name = 'emails/session_confirmed_discord.html'
    default_subject = 'Twoja sesja na Discord została potwierdzona!'

    def build_context(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'student_name': data['student_name'],
            'subject': data['session_title'],
            'date': data['date'],
            'start_time': data['start_time'],
            'end_time': data['end_time'],
            'discord_url': data['discord_url'],
        }


@extend_schema(
    tags=['Messaging'],
    summary='Send Google Meet confirmation to student',
    description='Queue an email confirming a Google Meet session for the student.',
    request=SessionConfirmedGoogleMeetEmailSerializer,
    responses={202: EMAIL_ACCEPTED_RESPONSE, 400: OpenApiResponse(description='Validation error')},
)
class SessionConfirmedGoogleMeetEmailView(BaseTemplatedEmailView):
    serializer_class = SessionConfirmedGoogleMeetEmailSerializer
    template_name = 'emails/session_confirmed_google_meet.html'
    default_subject = 'Twoja sesja na Google Meet została potwierdzona!'

    def build_context(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'student_name': data['student_name'],
            'subject': data['session_title'],
            'date': data['date'],
            'start_time': data['start_time'],
            'end_time': data['end_time'],
        }


@extend_schema(
    tags=['Messaging'],
    summary='Send reservation receipt to student',
    description='Queue an email confirming reception of a new reservation to the student.',
    request=SessionNewReservationEmailSerializer,
    responses={202: EMAIL_ACCEPTED_RESPONSE, 400: OpenApiResponse(description='Validation error')},
)
class SessionNewReservationEmailView(BaseTemplatedEmailView):
    serializer_class = SessionNewReservationEmailSerializer
    template_name = 'emails/session_new_reservation.html'
    default_subject = 'Potwierdzenie rezerwacji sesji'

    def build_context(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'student_name': data['student_name'],
            'subject': data['session_title'],
            'date': data['date'],
            'start_time': data['start_time'],
            'end_time': data['end_time'],
        }


@extend_schema(
    tags=['Terms of Service'],
    summary='Get latest Terms of Service',
    description='Returns the version and markdown content of the latest Terms of Service document. This is a public endpoint.',
    responses={
        200: inline_serializer(
            name='LatestTermsResponse',
            fields={
                'version': serializers.CharField(),
                'content_md': serializers.CharField(),
                'published_at': serializers.DateTimeField(),
            }
        ),
        404: OpenApiResponse(description='No terms of service found'),
    },
)
class LatestTermsView(APIView):
    """Provides the version and markdown content of the latest Terms of Service."""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        try:
            latest_terms = TermsOfService.objects.latest('published_at')
            return Response({
                'version': latest_terms.version,
                'content_md': latest_terms.content_md,
                'published_at': latest_terms.published_at,
            })
        except TermsOfService.DoesNotExist:
            return Response({'detail': 'No terms of service found.'}, status=status.HTTP_404_NOT_FOUND)


@extend_schema(
    tags=['Terms of Service'],
    summary='Accept latest Terms of Service',
    description='Allows an authenticated user to accept the latest Terms of Service version.',
    responses={
        200: inline_serializer(
            name='AcceptTermsResponse',
            fields={
                'status': serializers.CharField(),
                'message': serializers.CharField(),
            }
        ),
        400: OpenApiResponse(description='No terms to accept'),
    },
)
class AcceptTermsView(APIView):
    """Allows an authenticated user to accept the latest Terms of Service."""
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            latest_terms = TermsOfService.objects.latest('published_at')
            user = request.user
            
            user.terms_agreement = latest_terms
            user.terms_agreement_date = timezone.now()
            user.save(update_fields=['terms_agreement', 'terms_agreement_date'])
            
            return Response({'status': 'success', 'message': f'Terms v{latest_terms.version} accepted.'})
        except TermsOfService.DoesNotExist:
            return Response({'detail': 'No terms to accept.'}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    tags=['Terms of Service'],
    summary='Get all Terms of Service versions',
    description='Returns all versions of Terms of Service. Requires admin authentication.',
    responses={
        200: inline_serializer(
            name='AllTermsResponse',
            fields={
                'id': serializers.IntegerField(),
                'version': serializers.CharField(),
                'content_md': serializers.CharField(),
                'published_at': serializers.DateTimeField(),
                'created_at': serializers.DateTimeField(),
            },
            many=True
        ),
    },
)
class AllTermsView(APIView):
    """Returns all versions of Terms of Service for admin management."""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, *args, **kwargs):
        all_terms = TermsOfService.objects.all().order_by('-published_at')
        data = [{
            'id': terms.id,
            'version': terms.version,
            'content_md': terms.content_md,
            'published_at': terms.published_at,
            'created_at': terms.created_at,
        } for terms in all_terms]
        return Response(data)


@extend_schema(
    tags=['Terms of Service'],
    summary='Create new Terms of Service version',
    description='Create a new version of Terms of Service. Requires admin authentication.',
    request=inline_serializer(
        name='CreateTermsRequest',
        fields={
            'version': serializers.CharField(),
            'content_md': serializers.CharField(),
        }
    ),
    responses={
        201: inline_serializer(
            name='CreateTermsResponse',
            fields={
                'id': serializers.IntegerField(),
                'version': serializers.CharField(),
                'published_at': serializers.DateTimeField(),
            }
        ),
        400: OpenApiResponse(description='Validation error'),
    },
)
class CreateTermsView(APIView):
    """Create a new version of Terms of Service."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, *args, **kwargs):
        version = request.data.get('version')
        content_md = request.data.get('content_md')

        if not version or not content_md:
            return Response(
                {'detail': 'Version and content_md are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if version already exists
        if TermsOfService.objects.filter(version=version).exists():
            return Response(
                {'detail': f'Version {version} already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        terms = TermsOfService.objects.create(
            version=version,
            content_md=content_md
        )

        logger.info(f"Created new Terms of Service version {version} by {request.user.email}")

        return Response({
            'id': terms.id,
            'version': terms.version,
            'published_at': terms.published_at,
        }, status=status.HTTP_201_CREATED)
