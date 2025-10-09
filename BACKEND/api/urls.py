from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, 
    TimeSlotViewSet, 
    MeetingViewSet, 
    NotificationViewSet, 
    DailyActivitySummaryViewSet,
    CustomRegisterView,
    GoogleLogin,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'timeslots', TimeSlotViewSet, basename='timeslot')
router.register(r'meetings', MeetingViewSet, basename='meeting')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'daily-summaries', DailyActivitySummaryViewSet, basename='dailysummary')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', CustomRegisterView.as_view(), name='custom_register'),
    path('auth/google/', GoogleLogin.as_view(), name='google_login'),
]