from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlatformUserViewSet,
    SiteViewSet,
    ClientViewSet,
    EventViewSet,
    BookingViewSet,
    CustomRegisterView,
    ResendVerificationEmailView,
    ConfirmEmailView,
    RequestMagicLinkView,
    VerifyMagicLinkView,
    GoogleLogin,
    TemplateViewSet,
    PublicSiteListView,
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
    LatestTermsView,
    AcceptTermsView,
    AllTermsView,
    CreateTermsView,
    AdminUsersListView,
    AdminSitesListView,
    EmailTemplateViewSet,
    SendTestEmailView,
    PublicBookingView,
    PublicAvailabilityView,
    TeamMemberViewSet,
    accept_invitation,
    accept_invitation_studio,
    reject_invitation_studio,
    check_domain_availability,
    get_domain_pricing,
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
router.register(r'email-templates', EmailTemplateViewSet, basename='emailtemplate')
router.register(r'team-members', TeamMemberViewSet, basename='teammember')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', CustomRegisterView.as_view(), name='custom_register'),
    path('auth/resend-verification/', ResendVerificationEmailView.as_view(), name='resend_verification'),
    path('auth/confirm-email/', ConfirmEmailView.as_view(), name='confirm_email'),
    path('auth/magic-link/request/', RequestMagicLinkView.as_view(), name='request_magic_link'),
    path('auth/magic-link/verify/', VerifyMagicLinkView.as_view(), name='verify_magic_link'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('public-sites/', PublicSiteListView.as_view(), name='public_sites_list'),
    path('public-sites/by-id/<int:site_id>/', PublicSiteByIdView.as_view(), name='public_site_detail_by_id'),
    path('public-sites/<slug:identifier>/', PublicSiteView.as_view(), name='public_site_detail'),
    path('sites/<int:site_id>/publish/', publish_site, name='publish-site'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('send-custom-email/', SendEmailView.as_view(), name='send-custom-email'),
    path('emails/test/', SendTestEmailView.as_view(), name='send-test-email'),
    path('emails/admin-session-cancellation/', AdminSessionCancellationEmailView.as_view(), name='email-admin-session-cancellation'),
    path('emails/admin-session-new-reservation/', AdminSessionNewReservationEmailView.as_view(), name='email-admin-session-new-reservation'),
    path('emails/session-canceled-by-admin/', SessionCanceledByAdminEmailView.as_view(), name='email-session-canceled-by-admin'),
    path('emails/session-confirmed-discord/', SessionConfirmedDiscordEmailView.as_view(), name='email-session-confirmed-discord'),
    path('emails/session-confirmed-google-meet/', SessionConfirmedGoogleMeetEmailView.as_view(), name='email-session-confirmed-google-meet'),
    path('emails/session-new-reservation/', SessionNewReservationEmailView.as_view(), name='email-session-new-reservation'),
    path('terms/latest/', LatestTermsView.as_view(), name='terms-latest'),
    path('terms/accept/', AcceptTermsView.as_view(), name='terms-accept'),
    path('terms/all/', AllTermsView.as_view(), name='terms-all'),
    path('terms/create/', CreateTermsView.as_view(), name='terms-create'),
    path('admin/users/', AdminUsersListView.as_view(), name='admin-users-list'),
    path('admin/sites/', AdminSitesListView.as_view(), name='admin-sites-list'),
    path('public-sites/<int:site_id>/bookings/', PublicBookingView.as_view(), name='public_booking'),
    path('public-sites/<int:site_id>/availability/', PublicAvailabilityView.as_view(), name='public_availability'),
    # Team invitation endpoints
    path('accept-invitation/<uuid:token>/', accept_invitation, name='accept-invitation'),
    path('team-invitations/<uuid:token>/accept/', accept_invitation_studio, name='accept-invitation-studio'),
    path('team-invitations/<uuid:token>/reject/', reject_invitation_studio, name='reject-invitation-studio'),
    # Domain checking endpoints
    path('domains/check-availability/', check_domain_availability, name='check-domain-availability'),
    path('domains/pricing/', get_domain_pricing, name='get-domain-pricing'),
]