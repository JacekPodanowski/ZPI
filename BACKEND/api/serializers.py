"""Serializers for the multi-tenant Personal Site Generator backend."""

import logging
from django.utils.text import slugify
from django.utils import timezone
from rest_framework import serializers

from .models import (
    PlatformUser,
    Site,
    Client,
    Event,
    Booking,
    Template,
    CustomReactComponent,
    MediaUsage,
    Notification,
    AvailabilityBlock,
    TermsOfService,
)
from .media_helpers import cleanup_asset_if_unused, get_asset_by_path_or_url

logger = logging.getLogger(__name__)


class CustomRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    accept_terms = serializers.BooleanField(write_only=True)

    class Meta:
        model = PlatformUser
        fields = ['first_name', 'last_name', 'email', 'password', 'password2', 'account_type', 'source_tag', 'accept_terms']
        extra_kwargs = {
            'password': {'write_only': True},
            'account_type': {'required': False},
            'source_tag': {'required': False},
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'detail': 'Passwords must match.'})
        
        if not data.get('accept_terms'):
            raise serializers.ValidationError({'detail': 'You must accept the Terms of Service to register.'})
            
        return data

    def create(self, validated_data):
        validated_data.pop('password2', None)
        validated_data.pop('accept_terms', None)
        email = validated_data['email']
        base_username = slugify(email.split('@')[0])
        username = base_username
        counter = 1
        existing_usernames = set(
            PlatformUser.objects.filter(username__startswith=base_username).values_list('username', flat=True)
        )
        while username in existing_usernames:
            username = f"{base_username}{counter}"
            counter += 1

        logger.info("Creating platform user %s with generated username %s", email, username)
        # Create user with is_active=False until email is verified
        user = PlatformUser.objects.create_user(
            username=username, 
            is_active=False,  # User cannot login until email is confirmed
            **validated_data
        )

        # Associate the latest ToS version with the new user
        try:
            latest_terms = TermsOfService.objects.latest('published_at')
            user.terms_agreement = latest_terms
            user.terms_agreement_date = timezone.now()
            user.save(update_fields=['terms_agreement', 'terms_agreement_date'])
        except TermsOfService.DoesNotExist:
            logger.warning("No TermsOfService found in the database during registration for user %s.", user.email)

        return user


class PlatformUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'avatar',
            'account_type', 'source_tag', 'is_staff', 'is_active',
            'preferences', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_staff', 'is_active']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        old_avatar_url = instance.avatar
        new_avatar_url = validated_data.get('avatar', old_avatar_url)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        if 'avatar' in validated_data:
            self._sync_avatar_usage(user, old_avatar_url, new_avatar_url)
        return user

    def _sync_avatar_usage(self, user: PlatformUser, old_url: str | None, new_url: str | None) -> None:
        if old_url == new_url:
            return

        if new_url:
            asset = get_asset_by_path_or_url(new_url)
            if asset:
                MediaUsage.objects.get_or_create(
                    asset=asset,
                    user=user,
                    usage_type=MediaUsage.UsageType.AVATAR,
                )
                MediaUsage.objects.filter(
                    user=user,
                    usage_type=MediaUsage.UsageType.AVATAR,
                ).exclude(asset=asset).delete()
            else:
                logger.warning("Avatar URL %s is not managed media", new_url)
                MediaUsage.objects.filter(
                    user=user,
                    usage_type=MediaUsage.UsageType.AVATAR,
                ).delete()
        else:
            MediaUsage.objects.filter(
                user=user,
                usage_type=MediaUsage.UsageType.AVATAR,
            ).delete()

        if old_url and old_url != new_url:
            old_asset = get_asset_by_path_or_url(old_url)
            if old_asset:
                MediaUsage.objects.filter(
                    asset=old_asset,
                    user=user,
                    usage_type=MediaUsage.UsageType.AVATAR,
                ).delete()
                cleanup_asset_if_unused(old_asset)


class SiteSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Site
        fields = [
            'id', 'owner', 'name', 'identifier', 'color_index',
            'template_config', 'version_history',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['identifier', 'created_at', 'updated_at', 'owner']
        extra_kwargs = {
            'color_index': {'required': False}
        }


class PublicSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ['id', 'identifier', 'name', 'template_config', 'updated_at']
        read_only_fields = ['id', 'identifier', 'name', 'template_config', 'updated_at']


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'site', 'email', 'name', 'google_id', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        site = attrs.get('site') or (self.instance.site if self.instance else None)
        if site is None:
            raise serializers.ValidationError({'site': 'Site reference is required.'})
        google_id = attrs.get('google_id')
        if google_id and Client.objects.filter(site=site, google_id=google_id).exclude(
            pk=self.instance.pk if self.instance else None
        ).exists():
            raise serializers.ValidationError({'google_id': 'This Google account is already linked to the site.'})
        return attrs


class EventSerializer(serializers.ModelSerializer):
    attendees = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'site', 'creator', 'title', 'description',
            'start_time', 'end_time', 'capacity', 'event_type',
            'attendees', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'attendees', 'creator']

    def validate(self, attrs):
        site = attrs.get('site') or (self.instance.site if self.instance else None)
        # creator is now read-only, so it won't be in attrs during creation
        # validation will happen in the ViewSet's perform_create
        return attrs


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'id', 'site', 'event', 'client', 'guest_email', 'guest_name',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        site = attrs.get('site') or (self.instance.site if self.instance else None)
        event = attrs.get('event') or (self.instance.event if self.instance else None)
        client = attrs.get('client') or (self.instance.client if self.instance else None)

        if event and site and event.site_id != site.id:
            raise serializers.ValidationError({'event': 'Event must belong to the provided site.'})

        if client and site and client.site_id != site.id:
            raise serializers.ValidationError({'client': 'Client must belong to the provided site.'})

        if not client and not (attrs.get('guest_email') or (self.instance.guest_email if self.instance else None)):
            raise serializers.ValidationError({'guest_email': 'Provide a client or guest contact details.'})

        return attrs


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'name', 'description', 'template_config', 'thumbnail_url']


class CustomReactComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomReactComponent
        fields = [
            'id', 'name', 'description', 'source_code', 'compiled_js',
            'created_at', 'updated_at'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at', 'notification_type']


class AvailabilityBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvailabilityBlock
        fields = [
            'id', 'site', 'creator', 'title', 'date', 'start_time', 'end_time',
            'meeting_lengths', 'time_snapping', 'buffer_time', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Automatically set creator to the current user
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class SendEmailSerializer(serializers.Serializer):
    """Validate payload for sending custom emails with an optional attachment."""

    recipient = serializers.EmailField(required=True)
    subject = serializers.CharField(required=True, max_length=255)
    message = serializers.CharField(required=True)
    attachment = serializers.FileField(required=False, allow_empty_file=False)

    def __init__(self, *args, **kwargs):
        # Guard against accidental use with model instances
        kwargs.pop('instance', None)
        super().__init__(*args, **kwargs)


class BaseTemplatedEmailSerializer(serializers.Serializer):
    """Base serializer for templated emails providing recipient and optional subject override."""

    recipient = serializers.EmailField(required=True)
    email_subject = serializers.CharField(required=False, max_length=255)

    def __init__(self, *args, **kwargs):
        kwargs.pop('instance', None)
        super().__init__(*args, **kwargs)


class AdminSessionCancellationEmailSerializer(BaseTemplatedEmailSerializer):
    student_name = serializers.CharField(required=True, max_length=255)
    session_title = serializers.CharField(required=True, max_length=255)
    date = serializers.CharField(required=True, max_length=255)
    start_time = serializers.CharField(required=True, max_length=255)
    end_time = serializers.CharField(required=True, max_length=255)


class AdminSessionNewReservationEmailSerializer(BaseTemplatedEmailSerializer):
    student_name = serializers.CharField(required=True, max_length=255)
    session_title = serializers.CharField(required=True, max_length=255)
    date = serializers.CharField(required=True, max_length=255)
    start_time = serializers.CharField(required=True, max_length=255)
    end_time = serializers.CharField(required=True, max_length=255)
    admin_url = serializers.URLField(required=True)


class SessionCanceledByAdminEmailSerializer(BaseTemplatedEmailSerializer):
    student_name = serializers.CharField(required=True, max_length=255)
    session_title = serializers.CharField(required=True, max_length=255)
    date = serializers.CharField(required=True, max_length=255)
    start_time = serializers.CharField(required=True, max_length=255)
    end_time = serializers.CharField(required=True, max_length=255)
    calendar_url = serializers.URLField(required=True)


class SessionConfirmedDiscordEmailSerializer(BaseTemplatedEmailSerializer):
    student_name = serializers.CharField(required=True, max_length=255)
    session_title = serializers.CharField(required=True, max_length=255)
    date = serializers.CharField(required=True, max_length=255)
    start_time = serializers.CharField(required=True, max_length=255)
    end_time = serializers.CharField(required=True, max_length=255)
    discord_url = serializers.URLField(required=True)


class SessionConfirmedGoogleMeetEmailSerializer(BaseTemplatedEmailSerializer):
    student_name = serializers.CharField(required=True, max_length=255)
    session_title = serializers.CharField(required=True, max_length=255)
    date = serializers.CharField(required=True, max_length=255)
    start_time = serializers.CharField(required=True, max_length=255)
    end_time = serializers.CharField(required=True, max_length=255)


class SessionNewReservationEmailSerializer(BaseTemplatedEmailSerializer):
    student_name = serializers.CharField(required=True, max_length=255)
    session_title = serializers.CharField(required=True, max_length=255)
    date = serializers.CharField(required=True, max_length=255)
    start_time = serializers.CharField(required=True, max_length=255)
    end_time = serializers.CharField(required=True, max_length=255)