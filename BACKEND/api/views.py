"""REST API views for the multi-tenant Personal Site Generator backend."""

import logging
from django.conf import settings
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

from .models import PlatformUser, Site, Client, Event, Booking, Template
from .serializers import (
    PlatformUserSerializer,
    SiteSerializer,
    ClientSerializer,
    EventSerializer,
    BookingSerializer,
    CustomRegisterSerializer,
    TemplateSerializer,
)

logger = logging.getLogger(__name__)


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

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
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
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied('You cannot modify a site you do not own.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied('You cannot delete a site you do not own.')
        instance.delete()


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
