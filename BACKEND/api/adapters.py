# api/adapters.py

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.utils.text import slugify
from urllib.parse import urlencode
from rest_framework_simplejwt.tokens import RefreshToken
import logging

from .models import PlatformUser

logger = logging.getLogger(__name__)


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Custom adapter to override email confirmation URL to point to React frontend.
    """
    
    def get_email_confirmation_url(self, request, emailconfirmation):
        """
        Override to return React frontend URL instead of Django backend URL.
        The key is passed to the React app which will call our API to confirm.
        """
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        key = emailconfirmation.key
        
        # React route: /studio/confirm-email/:key
        confirmation_url = f"{frontend_url}/studio/confirm-email/{key}"
        
        logger.info(f"CustomAccountAdapter: Generated confirmation URL: {confirmation_url}")
        return confirmation_url


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def get_connect_redirect_url(self, request, socialaccount):
        """
        Zastępuje domyślne zachowanie allauth po zalogowaniu przez konto społecznościowe.
        Zamiast przekierowywać na profil w backendzie, generuje tokeny JWT
        i przekierowuje na dedykowaną ścieżkę w aplikacji frontendowej,
        przekazując tokeny jako parametry URL.
        """
        assert request.user.is_authenticated
        logger.info(f"CustomSocialAccountAdapter: Użytkownik {request.user.email} pomyślnie zalogowany przez Google.")

        frontend_url = settings.FRONTEND_URL

        callback_path = "/google-auth-callback"

        user = socialaccount.user
        refresh = RefreshToken.for_user(user)
        
        tokens = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
        
        logger.info(f"CustomSocialAccountAdapter: Wygenerowano tokeny JWT dla {user.email}.")

        redirect_url = f"{frontend_url.rstrip('/')}{callback_path}?{urlencode(tokens)}"
        
        logger.debug(f"CustomSocialAccountAdapter: Przekierowuję na adres: {redirect_url}")
        
        return redirect_url

    def pre_social_login(self, request, sociallogin):
        """
        Interweniuje tuż po udanym zalogowaniu w Google, ale przed utworzeniem
        lub połączeniem konta w systemie. Tutaj możemy np. automatycznie
        wygenerować `username`, jeśli go brakuje.
        """
        user = sociallogin.user
        if not user.username:
            base_username = slugify(user.email.split('@')[0])
            username = base_username
            counter = 1
            existing_usernames = set(
                PlatformUser.objects.filter(username__startswith=base_username).values_list('username', flat=True)
            )

            while username in existing_usernames:
                username = f"{base_username}{counter}"
                counter += 1

            user.username = username
            logger.info(
                "CustomSocialAccountAdapter (pre_social_login): Ustawiono wygenerowany username '%s' dla użytkownika %s.",
                username,
                user.email,
            )

        return