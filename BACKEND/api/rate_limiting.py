"""
Rate limiting decorators for API views.

This module provides decorators to apply rate limiting to specific API endpoints,
particularly those that are computationally expensive or security-sensitive.
"""

from functools import wraps
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework import status
import time
import logging

logger = logging.getLogger(__name__)


def rate_limit(requests=10, window=60, key_prefix='api'):
    """
    Rate limit decorator for API views.
    
    Args:
        requests: Maximum number of requests allowed in the time window
        window: Time window in seconds
        key_prefix: Prefix for the cache key
    
    Usage:
        @rate_limit(requests=5, window=60)  # 5 requests per minute
        @api_view(['POST'])
        def my_view(request):
            ...
        
        Or for class-based views:
        @rate_limit(requests=5, window=60)
        def create(self, request, *args, **kwargs):
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(first_arg, *args, **kwargs):
            # Handle both function-based views and class-based view methods
            # If first_arg has META attribute, it's the request object
            # Otherwise, it's self and request is the first element of args
            if hasattr(first_arg, 'META'):
                request = first_arg
                actual_args = args
            else:
                # Class-based view method: first_arg is self, args[0] is request
                request = args[0] if args else None
                actual_args = args[1:] if len(args) > 1 else ()
                
            if request is None:
                logger.error("Rate limit decorator: could not find request object")
                return func(first_arg, *args, **kwargs)
            
            # Get client IP
            ip = get_client_ip(request)
            
            # Create cache key
            now = int(time.time())
            window_key = f'{key_prefix}:{func.__name__}:{ip}:{now // window}'
            
            # Get current count
            count = cache.get(window_key, 0)
            
            if count >= requests:
                logger.warning(
                    f"Rate limit exceeded for {func.__name__} from IP {ip}: "
                    f"{count} requests in {window}s window"
                )
                return Response(
                    {
                        'error': 'Rate limit exceeded',
                        'detail': f'Maximum {requests} requests per {window} seconds allowed',
                        'retry_after': window - (now % window)
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Increment counter
            cache.set(window_key, count + 1, window)
            
            # Process request with original arguments
            return func(first_arg, *args, **kwargs)
        
        return wrapper
    return decorator


def authenticated_rate_limit(requests=20, window=60, key_prefix='auth_api'):
    """
    Rate limit decorator that uses user ID instead of IP for authenticated requests.
    Falls back to IP-based limiting for unauthenticated requests.
    
    Args:
        requests: Maximum number of requests allowed in the time window
        window: Time window in seconds
        key_prefix: Prefix for the cache key
    """
    def decorator(func):
        @wraps(func)
        def wrapper(first_arg, *args, **kwargs):
            # Handle both function-based views and class-based view methods
            if hasattr(first_arg, 'META'):
                request = first_arg
                actual_args = args
            else:
                # Class-based view method: first_arg is self, args[0] is request
                request = args[0] if args else None
                actual_args = args[1:] if len(args) > 1 else ()
                
            if request is None:
                logger.error("Authenticated rate limit decorator: could not find request object")
                return func(first_arg, *args, **kwargs)
            
            # Determine identifier (user ID or IP)
            if hasattr(request, 'user') and request.user.is_authenticated:
                identifier = f'user_{request.user.id}'
            else:
                identifier = f'ip_{get_client_ip(request)}'
            
            # Create cache key
            now = int(time.time())
            window_key = f'{key_prefix}:{func.__name__}:{identifier}:{now // window}'
            
            # Get current count
            count = cache.get(window_key, 0)
            
            if count >= requests:
                logger.warning(
                    f"Rate limit exceeded for {func.__name__} by {identifier}: "
                    f"{count} requests in {window}s window"
                )
                return Response(
                    {
                        'error': 'Rate limit exceeded',
                        'detail': f'Maximum {requests} requests per {window} seconds allowed',
                        'retry_after': window - (now % window)
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS
                )
            
            # Increment counter
            cache.set(window_key, count + 1, window)
            
            # Process request with original arguments
            return func(first_arg, *args, **kwargs)
        
        return wrapper
    return decorator


def get_client_ip(request):
    """Extract the client's IP address from the request."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


# Preset decorators for common use cases
rate_limit_strict = rate_limit(requests=5, window=60)  # 5 requests per minute
rate_limit_moderate = rate_limit(requests=20, window=60)  # 20 requests per minute
rate_limit_relaxed = rate_limit(requests=100, window=60)  # 100 requests per minute

# For authenticated endpoints
auth_rate_limit_strict = authenticated_rate_limit(requests=10, window=60)
auth_rate_limit_moderate = authenticated_rate_limit(requests=50, window=60)
auth_rate_limit_relaxed = authenticated_rate_limit(requests=200, window=60)
