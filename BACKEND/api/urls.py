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
    NotificationViewSet,
)

router = DefaultRouter()
router.register(r'users', PlatformUserViewSet, basename='user')
router.register(r'sites', SiteViewSet, basename='site')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'events', EventViewSet, basename='event')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'custom-components', CustomReactComponentViewSet, basename='customcomponent')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', CustomRegisterView.as_view(), name='custom_register'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('public-sites/by-id/<int:site_id>/', PublicSiteByIdView.as_view(), name='public_site_detail_by_id'),
    path('public-sites/<slug:identifier>/', PublicSiteView.as_view(), name='public_site_detail'),
    path('sites/<int:site_id>/publish/', publish_site, name='publish-site'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
]