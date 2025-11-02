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
    AvailabilityBlockViewSet,
    SendEmailView,
    AdminSessionCancellationEmailView,
    AdminSessionNewReservationEmailView,
    SessionCanceledByAdminEmailView,
    SessionConfirmedDiscordEmailView,
    SessionConfirmedGoogleMeetEmailView,
    SessionNewReservationEmailView,
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
router.register(r'availability-blocks', AvailabilityBlockViewSet, basename='availabilityblock')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', CustomRegisterView.as_view(), name='custom_register'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('public-sites/by-id/<int:site_id>/', PublicSiteByIdView.as_view(), name='public_site_detail_by_id'),
    path('public-sites/<slug:identifier>/', PublicSiteView.as_view(), name='public_site_detail'),
    path('sites/<int:site_id>/publish/', publish_site, name='publish-site'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('send-custom-email/', SendEmailView.as_view(), name='send-custom-email'),
    path('emails/admin-session-cancellation/', AdminSessionCancellationEmailView.as_view(), name='email-admin-session-cancellation'),
    path('emails/admin-session-new-reservation/', AdminSessionNewReservationEmailView.as_view(), name='email-admin-session-new-reservation'),
    path('emails/session-canceled-by-admin/', SessionCanceledByAdminEmailView.as_view(), name='email-session-canceled-by-admin'),
    path('emails/session-confirmed-discord/', SessionConfirmedDiscordEmailView.as_view(), name='email-session-confirmed-discord'),
    path('emails/session-confirmed-google-meet/', SessionConfirmedGoogleMeetEmailView.as_view(), name='email-session-confirmed-google-meet'),
    path('emails/session-new-reservation/', SessionNewReservationEmailView.as_view(), name='email-session-new-reservation'),
]