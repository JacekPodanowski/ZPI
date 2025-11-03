"""Middleware for enforcing Terms of Service acceptance."""

from django.shortcuts import redirect
from django.urls import reverse
from .models import TermsOfService


class EnforceTermsOfServiceMiddleware:
    """
    Middleware that checks if authenticated users have accepted the latest ToS.
    If not, they are redirected to the ToS acceptance page.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = request.user

        # Bypass for anonymous users, staff, or superusers
        if not user.is_authenticated or user.is_staff or user.is_superuser:
            return self.get_response(request)

        # List of URL names/paths that are always allowed
        allowed_paths = [
            '/api/v1/terms/latest/',
            '/api/v1/terms/accept/',
            '/api/v1/auth/logout/',
        ]

        # Allow access to admin and specific ToS-related endpoints
        if request.path_info in allowed_paths or request.path_info.startswith('/admin/'):
            return self.get_response(request)

        try:
            latest_terms = TermsOfService.objects.latest('published_at')
        except TermsOfService.DoesNotExist:
            # If no terms exist, allow access
            return self.get_response(request)

        if not user.terms_agreement or user.terms_agreement.id != latest_terms.id:
            # User has not agreed to the latest terms
            # Only redirect for non-API requests (frontend pages)
            if not request.path_info.startswith('/api/'):
                return redirect('/studio/accept-terms')
            # For API requests, let them through but the frontend will handle the redirect
            # based on the user's ToS status in their profile data

        return self.get_response(request)
