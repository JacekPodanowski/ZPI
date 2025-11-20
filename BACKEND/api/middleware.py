"""Custom middleware for the API."""

from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class TemporaryPasswordMiddleware(MiddlewareMixin):
    """
    Middleware that blocks access to all endpoints (except allowed ones) 
    for users with temporary passwords that must be changed.
    """
    
    # Endpoints that are allowed even with temporary password
    ALLOWED_PATHS = [
        '/api/v1/auth/token/',
        '/api/v1/auth/token/refresh/',
        '/api/v1/auth/logout/',
        '/api/v1/auth/user/',
        '/api/v1/auth/change-password/',
        '/api/v1/setup-account/',
        '/api/v1/validate-setup-token/',
        '/admin/',
        '/static/',
        '/media/',
    ]
    
    def process_request(self, request):
        """Check if user has temporary password and block access if needed."""
        
        # Skip for allowed paths
        path = request.path
        if any(path.startswith(allowed) for allowed in self.ALLOWED_PATHS):
            return None
        
        # Try to get user from JWT token
        try:
            jwt_auth = JWTAuthentication()
            auth_result = jwt_auth.authenticate(request)
            
            if auth_result is not None:
                user, _ = auth_result
                
                # Check if user has temporary password
                if hasattr(user, 'is_temporary_password') and user.is_temporary_password:
                    return JsonResponse({
                        'error': 'Musisz zmienić hasło tymczasowe przed kontynuowaniem.',
                        'detail': 'Twoje konto wymaga zmiany hasła. Zostałeś zaproszony do zespołu z hasłem jednorazowym.',
                        'requires_password_change': True,
                        'redirect_to': '/studio/change-password'
                    }, status=403)
        except (AuthenticationFailed, Exception):
            # If authentication fails or user is not authenticated, let the request continue
            # The view will handle authentication requirements
            pass
        
        return None
