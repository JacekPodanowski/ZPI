# BACKEND/api/routing.py
"""
WebSocket routing configuration for Django Channels.
Defines URL patterns for WebSocket connections.
"""

from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/ai-updates/(?P<user_id>\w+)/$', consumers.AIConsumer.as_asgi()),
    re_path(r'ws/google-calendar/(?P<site_id>\w+)/$', consumers.GoogleCalendarConsumer.as_asgi()),
]
