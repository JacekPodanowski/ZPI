"""
DDoS Protection Middleware

This middleware implements multiple layers of DDoS protection:
1. IP-based rate limiting using Redis with burst allowance
2. Higher limits for authenticated users
3. Request pattern analysis
4. Automatic IP blocking for suspicious behavior
5. Whitelist/blacklist management
"""

import time
import hashlib
from django.core.cache import cache
from django.http import JsonResponse
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class DDoSProtectionMiddleware:
    """
    Middleware to protect against DDoS attacks.
    
    Features:
    - Rate limiting per IP with burst allowance
    - Higher limits for authenticated users
    - Pattern detection for suspicious behavior
    - Automatic IP blocking
    - Configurable thresholds
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Configuration (can be overridden in settings.py)
        self.REQUESTS_PER_MINUTE = getattr(settings, 'DDOS_REQUESTS_PER_MINUTE', 120)
        self.REQUESTS_PER_HOUR = getattr(settings, 'DDOS_REQUESTS_PER_HOUR', 2000)
        self.BLOCK_DURATION = getattr(settings, 'DDOS_BLOCK_DURATION', 1800)  # 30 min
        self.SUSPICIOUS_THRESHOLD = getattr(settings, 'DDOS_SUSPICIOUS_THRESHOLD', 100)
        
        # Burst allowance - allow short spikes without blocking
        self.BURST_ALLOWANCE = getattr(settings, 'DDOS_BURST_ALLOWANCE', 30)
        self.BURST_WINDOW = getattr(settings, 'DDOS_BURST_WINDOW', 10)  # seconds
        
        # Authenticated users get higher limits (2x)
        self.AUTH_MULTIPLIER = 2.0
        
        # Whitelist (e.g., your own IPs, trusted services)
        self.WHITELIST = getattr(settings, 'DDOS_WHITELIST', [
            '127.0.0.1',
            'localhost',
        ])
        
        # Patterns that indicate DDoS attempts
        self.SUSPICIOUS_PATTERNS = [
            '/admin/',
            '/.env',
            '/wp-admin',
            '/phpmyadmin',
            '/../',
            '/etc/passwd',
        ]
        
        # Public endpoints - more restrictive limits
        self.PUBLIC_ENDPOINTS = [
            '/api/v1/public-sites/',
            '/api/v1/booking/',
            '/api/v1/availability/',
        ]
        
        # Private endpoints - relaxed limits for authenticated users
        self.PRIVATE_ENDPOINTS = [
            '/api/v1/sites/',
            '/api/v1/editor/',
            '/api/v1/upload/',
        ]
    
    def __call__(self, request):
        # Get client IP
        ip = self.get_client_ip(request)
        
        # Check if IP is whitelisted
        if ip in self.WHITELIST:
            return self.get_response(request)
        
        # Check if IP is blocked
        if self.is_blocked(ip):
            logger.warning(f"Blocked request from {ip} - IP is temporarily blocked")
            return JsonResponse({
                'error': 'Too many requests. Your IP has been temporarily blocked.',
                'retry_after': self.get_block_remaining_time(ip)
            }, status=429)
        
        # Determine if user is authenticated and get appropriate limits
        is_authenticated = hasattr(request, 'user') and request.user.is_authenticated
        limits = self.get_limits_for_request(request, is_authenticated)
        
        # Check rate limits with burst allowance
        rate_check = self.check_rate_limit_with_burst(ip, limits, is_authenticated)
        if not rate_check['allowed']:
            if rate_check['should_block']:
                logger.warning(f"Rate limit exceeded for IP: {ip} - blocking")
                self.block_ip(ip)
            else:
                logger.info(f"Rate limit soft exceeded for IP: {ip} - warning")
            
            return JsonResponse({
                'error': 'Rate limit exceeded. Please try again later.',
                'retry_after': rate_check['retry_after']
            }, status=429)
        
        # Check for suspicious patterns
        if self.is_suspicious_request(request):
            logger.warning(f"Suspicious request from {ip}: {request.path}")
            self.increment_suspicious_count(ip)
            
            if self.get_suspicious_count(ip) > self.SUSPICIOUS_THRESHOLD:
                logger.error(f"Blocking IP {ip} due to suspicious activity")
                self.block_ip(ip)
                return JsonResponse({
                    'error': 'Suspicious activity detected. Your IP has been blocked.',
                }, status=403)
        
        # Process the request
        response = self.get_response(request)
        
        return response
    
    def get_limits_for_request(self, request, is_authenticated):
        """Get rate limits based on endpoint type and authentication status."""
        path = request.path
        
        # Base limits
        per_minute = self.REQUESTS_PER_MINUTE
        per_hour = self.REQUESTS_PER_HOUR
        
        # Check if it's a public endpoint (more restrictive)
        is_public = any(path.startswith(ep) for ep in self.PUBLIC_ENDPOINTS)
        
        if is_public and not is_authenticated:
            # Public endpoints for anonymous users - stricter limits
            per_minute = int(per_minute * 0.5)
            per_hour = int(per_hour * 0.5)
        elif is_authenticated:
            # Authenticated users get higher limits
            per_minute = int(per_minute * self.AUTH_MULTIPLIER)
            per_hour = int(per_hour * self.AUTH_MULTIPLIER)
        
        return {
            'per_minute': per_minute,
            'per_hour': per_hour
        }
    
    def check_rate_limit_with_burst(self, ip, limits, is_authenticated):
        """Check rate limits with burst allowance."""
        now = int(time.time())
        
        # Per-minute check
        minute_key = f'ddos:minute:{ip}:{now // 60}'
        minute_count = cache.get(minute_key, 0)
        
        # Per-hour check
        hour_key = f'ddos:hour:{ip}:{now // 3600}'
        hour_count = cache.get(hour_key, 0)
        
        # Burst tracking - allow short spikes
        burst_key = f'ddos:burst:{ip}'
        burst_data = cache.get(burst_key, {'count': 0, 'start': now})
        
        # Reset burst if window expired
        if now - burst_data['start'] > self.BURST_WINDOW:
            burst_data = {'count': 0, 'start': now}
        
        # Calculate effective limits with burst allowance
        effective_minute_limit = limits['per_minute'] + self.BURST_ALLOWANCE
        
        # Check if within burst allowance
        in_burst = minute_count >= limits['per_minute'] and minute_count < effective_minute_limit
        
        if minute_count >= effective_minute_limit:
            # Hard limit exceeded - block
            return {
                'allowed': False,
                'should_block': True,
                'retry_after': 60 - (now % 60)
            }
        
        if hour_count >= limits['per_hour']:
            return {
                'allowed': False,
                'should_block': True,
                'retry_after': 3600 - (now % 3600)
            }
        
        # Increment counters
        cache.set(minute_key, minute_count + 1, 60)
        cache.set(hour_key, hour_count + 1, 3600)
        
        # Track burst usage
        if in_burst:
            burst_data['count'] += 1
            cache.set(burst_key, burst_data, self.BURST_WINDOW)
        
        return {
            'allowed': True,
            'should_block': False,
            'retry_after': 0
        }
    
    def get_client_ip(self, request):
        """Extract the client's IP address from the request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def is_suspicious_request(self, request):
        """Check if the request matches suspicious patterns."""
        path = request.path.lower()
        
        for pattern in self.SUSPICIOUS_PATTERNS:
            if pattern in path:
                return True
        
        # Check for rapid requests to different endpoints
        # (Could indicate scanning behavior)
        
        return False
    
    def increment_suspicious_count(self, ip):
        """Increment the suspicious activity counter for an IP."""
        key = f'ddos:suspicious:{ip}'
        count = cache.get(key, 0)
        cache.set(key, count + 1, 3600)  # Track for 1 hour
    
    def get_suspicious_count(self, ip):
        """Get the suspicious activity count for an IP."""
        key = f'ddos:suspicious:{ip}'
        return cache.get(key, 0)
    
    def block_ip(self, ip):
        """Block an IP address for a specified duration."""
        key = f'ddos:blocked:{ip}'
        cache.set(key, int(time.time()), self.BLOCK_DURATION)
        logger.error(f"IP {ip} has been blocked for {self.BLOCK_DURATION} seconds")
    
    def is_blocked(self, ip):
        """Check if an IP is currently blocked."""
        key = f'ddos:blocked:{ip}'
        blocked_time = cache.get(key)
        
        if blocked_time is None:
            return False
        
        # Check if block has expired
        elapsed = int(time.time()) - blocked_time
        if elapsed >= self.BLOCK_DURATION:
            cache.delete(key)
            return False
        
        return True
    
    def get_block_remaining_time(self, ip):
        """Get the remaining time for a blocked IP."""
        key = f'ddos:blocked:{ip}'
        blocked_time = cache.get(key)
        
        if blocked_time is None:
            return 0
        
        elapsed = int(time.time()) - blocked_time
        remaining = self.BLOCK_DURATION - elapsed
        
        return max(0, remaining)


class RequestLoggingMiddleware:
    """
    Middleware to log all requests for analysis and debugging.
    Useful for identifying attack patterns.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Log request details
        ip = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
        
        logger.info(
            f"Request: {request.method} {request.path} from {ip} "
            f"User-Agent: {user_agent[:100]}"
        )
        
        response = self.get_response(request)
        
        # Log response status
        if response.status_code >= 400:
            logger.warning(
                f"Response {response.status_code} for {request.method} {request.path} "
                f"from {ip}"
            )
        
        return response
    
    def get_client_ip(self, request):
        """Extract the client's IP address from the request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
