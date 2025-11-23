"""
DDoS Protection Middleware

This middleware implements multiple layers of DDoS protection:
1. IP-based rate limiting using Redis
2. Request pattern analysis
3. Automatic IP blocking for suspicious behavior
4. Whitelist/blacklist management
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
    - Rate limiting per IP
    - Pattern detection for suspicious behavior
    - Automatic IP blocking
    - Configurable thresholds
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Configuration (can be overridden in settings.py)
        self.REQUESTS_PER_MINUTE = getattr(settings, 'DDOS_REQUESTS_PER_MINUTE', 60)
        self.REQUESTS_PER_HOUR = getattr(settings, 'DDOS_REQUESTS_PER_HOUR', 1000)
        self.BLOCK_DURATION = getattr(settings, 'DDOS_BLOCK_DURATION', 3600)  # 1 hour
        self.SUSPICIOUS_THRESHOLD = getattr(settings, 'DDOS_SUSPICIOUS_THRESHOLD', 100)
        
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
        
        # Check rate limits
        if not self.check_rate_limit(ip):
            logger.warning(f"Rate limit exceeded for IP: {ip}")
            self.block_ip(ip)
            return JsonResponse({
                'error': 'Rate limit exceeded. Please try again later.',
                'retry_after': 60
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
    
    def get_client_ip(self, request):
        """Extract the client's IP address from the request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def check_rate_limit(self, ip):
        """Check if the IP has exceeded rate limits."""
        now = int(time.time())
        
        # Per-minute check
        minute_key = f'ddos:minute:{ip}:{now // 60}'
        minute_count = cache.get(minute_key, 0)
        
        if minute_count >= self.REQUESTS_PER_MINUTE:
            return False
        
        # Per-hour check
        hour_key = f'ddos:hour:{ip}:{now // 3600}'
        hour_count = cache.get(hour_key, 0)
        
        if hour_count >= self.REQUESTS_PER_HOUR:
            return False
        
        # Increment counters
        cache.set(minute_key, minute_count + 1, 60)
        cache.set(hour_key, hour_count + 1, 3600)
        
        return True
    
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
