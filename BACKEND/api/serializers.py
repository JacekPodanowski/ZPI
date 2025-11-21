"""Serializers for the multi-tenant Personal Site Generator backend."""

import logging
from django.utils.text import slugify
from django.utils import timezone
from rest_framework import serializers

from django.db import ProgrammingError, OperationalError
from django.db.models import Q

from .models import (
    PlatformUser,
    Site,
    SiteVersion,
    Client,
    Event,
    Booking,
    Template,
    CustomReactComponent,
    MediaUsage,
    Notification,
    AvailabilityBlock,
    TermsOfService,
    EmailTemplate,
    TeamMember,
    AttendedSession,
    DomainOrder,
    Testimonial,
    TestimonialSummary,
    NewsletterSubscription,
    Payment,
    BigEvent,
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
            'id', 'username', 'email', 'first_name', 'last_name', 'avatar_url',
            'public_image_url', 'role_description',
            'account_type', 'source_tag', 'is_staff', 'is_active',
            'preferences', 'created_at', 'updated_at',
            'is_temporary_password', 'password_changed_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_staff', 'is_active', 'is_temporary_password', 'password_changed_at']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        old_avatar_url = instance.avatar_url
        new_avatar_url = validated_data.get('avatar_url', old_avatar_url)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        if 'avatar_url' in validated_data:
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


class UserSummarySerializer(serializers.ModelSerializer):
    """Simplified serializer for user info in calendar roster responses."""
    avatar_color = serializers.SerializerMethodField()
    avatar_letter = serializers.SerializerMethodField()
    
    class Meta:
        model = PlatformUser
        fields = [
            'id', 'first_name', 'last_name', 'avatar_url', 
            'avatar_color', 'avatar_letter'
        ]
    
    def get_avatar_color(self, obj):
        from .utils import get_avatar_color
        full_name = obj.get_full_name() or obj.email
        return get_avatar_color(full_name)
    
    def get_avatar_letter(self, obj):
        from .utils import get_avatar_letter
        return get_avatar_letter(obj.first_name)


class SiteSerializer(serializers.ModelSerializer):
    owner = PlatformUserSerializer(read_only=True)
    latest_version = serializers.SerializerMethodField()

    class Meta:
        model = Site
        fields = [
            'id', 'owner', 'name', 'identifier', 'color_index', 'team_size',
            'is_mock', 'template_config', 'created_at', 'updated_at', 'latest_version'
        ]
        read_only_fields = ['identifier', 'created_at', 'updated_at', 'owner', 'team_size', 'is_mock']
        extra_kwargs = {
            'color_index': {'required': False}
        }

    def get_latest_version(self, obj):
        try:
            latest = obj.versions.order_by('-version_number').first()
        except (ProgrammingError, OperationalError):
            logger.warning(
                "SiteVersion table unavailable while fetching latest version for site %s", obj.pk,
                exc_info=True,
            )
            return None

        if not latest:
            return None
        return {
            'id': str(latest.id),
            'version_number': latest.version_number,
            'created_at': latest.created_at,
            'created_by': latest.created_by_id,
            'notes': latest.notes,
            'change_summary': latest.change_summary
        }


class SiteVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = SiteVersion
        fields = [
            'id', 'site', 'version_number', 'template_config', 'created_at',
            'created_by', 'created_by_name', 'notes', 'change_summary'
        ]
        read_only_fields = ['id', 'site', 'version_number', 'created_at', 'created_by', 'created_by_name']

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return None
        full_name = obj.created_by.get_full_name()
        return full_name or obj.created_by.email


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
    bookings = serializers.SerializerMethodField()
    assignment_type = serializers.SerializerMethodField()
    assignment_label = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'site', 'creator', 'title', 'description',
            'start_time', 'end_time', 'capacity', 'event_type',
            'attendees', 'bookings', 'created_at', 'updated_at',
            'assigned_to_owner', 'assigned_to_team_member',
            'assignment_type', 'assignment_label', 'show_host'
        ]
        read_only_fields = ['created_at', 'updated_at', 'attendees', 'creator', 'bookings', 'assignment_type', 'assignment_label']

    def get_bookings(self, obj):
        """Return booking information including client/guest details"""
        bookings = obj.bookings.all()
        return [{
            'id': booking.id,
            'client_name': booking.client.name if booking.client else booking.guest_name,
            'client_email': booking.client.email if booking.client else booking.guest_email,
            'notes': booking.notes,
            'created_at': booking.created_at
        } for booking in bookings]
    
    def get_assignment_type(self, obj):
        """Return 'owner' or 'team_member' based on which assignment field is filled"""
        if obj.assigned_to_owner_id:
            return 'owner'
        elif obj.assigned_to_team_member_id:
            return 'team_member'
        return None
    
    def get_assignment_label(self, obj):
        """Return human-readable label for the assigned person"""
        if obj.assigned_to_owner:
            return obj.assigned_to_owner.get_full_name() or obj.assigned_to_owner.email
        elif obj.assigned_to_team_member:
            return f"{obj.assigned_to_team_member.first_name} {obj.assigned_to_team_member.last_name}"
        return None

    def validate_capacity(self, value):
        """Validate capacity: must be >= 1 or exactly -1 (unlimited)"""
        if value != -1 and value < 1:
            raise serializers.ValidationError("Capacity must be -1 (unlimited) or a positive number >= 1.")
        return value

    def validate(self, attrs):
        site = attrs.get('site') or (self.instance.site if self.instance else None)
        # creator is now read-only, so it won't be in attrs during creation
        # validation will happen in the ViewSet's perform_create
        return attrs


class BookingSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    client_email = serializers.SerializerMethodField()
    event_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'site', 'event', 'client', 'guest_email', 'guest_name',
            'client_name', 'client_email', 'event_details',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'client_name', 'client_email', 'event_details']

    def get_client_name(self, obj):
        return obj.client.name if obj.client else obj.guest_name
    
    def get_client_email(self, obj):
        return obj.client.email if obj.client else obj.guest_email
    
    def get_event_details(self, obj):
        return {
            'title': obj.event.title,
            'start_time': obj.event.start_time,
            'end_time': obj.event.end_time,
        }

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
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Template
        fields = ['id', 'owner', 'name', 'description', 'template_config', 'thumbnail_url', 'is_public', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']


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
    assignment_type = serializers.SerializerMethodField()
    assignment_label = serializers.SerializerMethodField()
    
    class Meta:
        model = AvailabilityBlock
        fields = [
            'id', 'site', 'creator', 'title', 'date', 'start_time', 'end_time',
            'meeting_length', 'time_snapping', 'buffer_time', 'created_at', 'updated_at',
            'assigned_to_owner', 'assigned_to_team_member', 'assignment_type', 'assignment_label', 'show_host'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'updated_at', 'assignment_type', 'assignment_label']

    def get_assignment_type(self, obj):
        """Return 'owner' or 'team_member' based on which assignment field is filled"""
        if obj.assigned_to_owner_id:
            return 'owner'
        elif obj.assigned_to_team_member_id:
            return 'team_member'
        return None
    
    def get_assignment_label(self, obj):
        """Return human-readable label for the assigned person"""
        if obj.assigned_to_owner:
            user = obj.assigned_to_owner
            name = f"{user.first_name} {user.last_name}".strip() or user.email
            return f"{name} (Właściciel)"
        elif obj.assigned_to_team_member:
            member = obj.assigned_to_team_member
            if member.linked_user:
                user = member.linked_user
                name = f"{user.first_name} {user.last_name}".strip() or user.email
            else:
                name = member.email
            return f"{name} (Zespół)"
        return None
    
    def create(self, validated_data):
        # Automatically set creator to the current user
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class EmailTemplateSerializer(serializers.ModelSerializer):
    """Serializer for EmailTemplate model supporting CRUD operations."""
    is_custom = serializers.SerializerMethodField()
    
    class Meta:
        model = EmailTemplate
        fields = [
            'id', 'name', 'slug', 'category', 'subject_pl', 'subject_en',
            'content_pl', 'content_en', 'is_default', 'is_custom', 'owner',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_default', 'created_at', 'updated_at', 'owner']
    
    def get_is_custom(self, obj):
        """Mark templates as custom if they belong to a user."""
        return not obj.is_default
    
    def create(self, validated_data):
        """Automatically set the owner to the current user for custom templates."""
        validated_data['owner'] = self.context['request'].user
        validated_data['is_default'] = False
        return super().create(validated_data)


class TestEmailSerializer(serializers.Serializer):
    """Serializer for sending test emails using a template."""
    template_id = serializers.IntegerField(required=True, help_text='ID of the email template to use')
    from_email = serializers.EmailField(required=True, help_text='Sender email address')
    to_email = serializers.EmailField(required=True, help_text='Recipient email address')
    language = serializers.ChoiceField(
        choices=[('pl', 'Polish'), ('en', 'English')],
        default='pl',
        help_text='Language version to send (pl or en)'
    )
    test_data = serializers.JSONField(
        required=False,
        default=dict,
        help_text='Optional test data for template variables (e.g., {"client_name": "Jan Kowalski"})'
    )


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


# Team Member Serializers
class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer for TeamMember with avatar generation support."""
    avatar_color = serializers.SerializerMethodField()
    avatar_letter = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'site', 'name', 'email', 'role_description', 
            'avatar_url', 'is_active', 'linked_user', 'invitation_status',
            'invitation_token', 'invited_at', 'permission_role', 'created_at',
            'updated_at', 'avatar_color', 'avatar_letter'
        ]
        read_only_fields = ['id', 'invitation_token', 'created_at', 'updated_at', 'invited_at']
        extra_kwargs = {
            'site': {'required': True},
            'linked_user': {'read_only': True},
            'invitation_status': {'read_only': True},
        }
    
    def to_representation(self, instance):
        """Override to return linked user's avatar if connected."""
        data = super().to_representation(instance)
        
        # If linked to a user, use their avatar
        if instance.linked_user:
            data['avatar_url'] = instance.linked_user.avatar_url or ''
            # Also update name and color/letter from linked user
            user_name = f"{instance.linked_user.first_name} {instance.linked_user.last_name}".strip() or instance.linked_user.email
            from .utils import get_avatar_color, get_avatar_letter
            data['avatar_color'] = get_avatar_color(user_name)
            data['avatar_letter'] = get_avatar_letter(instance.linked_user.first_name or instance.linked_user.email)
        
        return data
    
    def get_avatar_color(self, obj):
        """Get deterministic color for avatar based on name."""
        from .utils import get_avatar_color
        return get_avatar_color(obj.name)
    
    def get_avatar_letter(self, obj):
        """Get first letter for avatar display."""
        from .utils import get_avatar_letter
        return get_avatar_letter(obj.name)


class TeamMemberInfoSerializer(serializers.ModelSerializer):
    """Simplified serializer for team member info in site responses."""
    avatar_color = serializers.SerializerMethodField()
    avatar_letter = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'name', 'role_description', 'permission_role',
            'invitation_status', 'avatar_url', 'avatar_color', 'avatar_letter'
        ]
    
    def to_representation(self, instance):
        """Override to return linked user's avatar if connected."""
        data = super().to_representation(instance)
        
        if instance.linked_user:
            data['avatar_url'] = instance.linked_user.avatar_url or ''
            user_name = f"{instance.linked_user.first_name} {instance.linked_user.last_name}".strip() or instance.linked_user.email
            from .utils import get_avatar_color, get_avatar_letter
            data['avatar_color'] = get_avatar_color(user_name)
            data['avatar_letter'] = get_avatar_letter(instance.linked_user.first_name or instance.linked_user.email)
        
        return data
    
    def get_avatar_color(self, obj):
        from .utils import get_avatar_color
        return get_avatar_color(obj.name)
    
    def get_avatar_letter(self, obj):
        from .utils import get_avatar_letter
        return get_avatar_letter(obj.name)


class PublicTeamMemberSerializer(serializers.ModelSerializer):
    """Public serializer for team members displayed on public sites."""
    avatar_color = serializers.SerializerMethodField()
    avatar_letter = serializers.SerializerMethodField()
    role = serializers.CharField(source='role_description')
    image = serializers.SerializerMethodField()  # Use avatar_url or linked_user's avatar
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'name', 'role', 'image',
            'avatar_url', 'avatar_color', 'avatar_letter'
        ]
    
    def get_image(self, obj):
        """Return linked user's avatar if connected, otherwise team member's avatar."""
        if obj.linked_user:
            return obj.linked_user.avatar_url or ''
        return obj.avatar_url or ''
    
    def get_avatar_color(self, obj):
        from .utils import get_avatar_color
        name = obj.name
        if obj.linked_user:
            name = f"{obj.linked_user.first_name} {obj.linked_user.last_name}".strip() or obj.linked_user.email
        return get_avatar_color(name)
    
    def get_avatar_letter(self, obj):
        from .utils import get_avatar_letter
        name = obj.name
        if obj.linked_user:
            name = obj.linked_user.first_name or obj.linked_user.email
        return get_avatar_letter(name)


class AttendedSessionSerializer(serializers.ModelSerializer):
    """Serializer for attendance report rows."""
    host_display_name = serializers.SerializerMethodField()

    class Meta:
        model = AttendedSession
        fields = [
            'id', 'title', 'start_time', 'end_time', 'duration_minutes',
            'event', 'host_type', 'host_display_name'
        ]
        read_only_fields = fields

    def get_host_display_name(self, obj):
        if obj.host_type == AttendedSession.HostType.OWNER and obj.host_user:
            return obj.host_user.get_full_name() or obj.host_user.email
        if obj.host_team_member:
            return obj.host_team_member.name
        return ''


class SiteWithTeamSerializer(serializers.ModelSerializer):
    """Extended Site serializer that includes team member info."""
    owner = PlatformUserSerializer(read_only=True)
    latest_version = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    team_member_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Site
        fields = [
            'id', 'owner', 'name', 'identifier', 'color_index', 'team_size',
            'template_config', 'created_at', 'updated_at', 'latest_version',
            'is_owner', 'team_member_info'
        ]
        read_only_fields = ['identifier', 'created_at', 'updated_at', 'owner', 'team_size']
    
    def get_latest_version(self, obj):
        try:
            latest = obj.versions.order_by('-version_number').first()
        except (ProgrammingError, OperationalError):
            logger.warning(
                "SiteVersion table unavailable while fetching latest version for site %s", obj.pk,
                exc_info=True,
            )
            return None

        if not latest:
            return None
        return {
            'id': str(latest.id),
            'version_number': latest.version_number,
            'created_at': latest.created_at,
            'created_by': latest.created_by_id,
            'notes': latest.notes,
            'change_summary': latest.change_summary
        }
    
    def get_is_owner(self, obj):
        """Check if current user is the site owner."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.owner_id == request.user.id
    
    def get_team_member_info(self, obj):
        """Get team member info if current user is a team member."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        # Check if user is a team member of this site
        from .models import TeamMember
        team_member = TeamMember.objects.filter(
            site=obj,
            invitation_status__in=['pending', 'linked']
        ).filter(
            Q(linked_user=request.user) |
            Q(linked_user__isnull=True, email__iexact=request.user.email)
        ).first()
        
        if team_member:
            return TeamMemberInfoSerializer(team_member).data
        return None


class DomainOrderSerializer(serializers.ModelSerializer):
    """Serializer for domain orders with payment and DNS configuration tracking."""
    
    user_email = serializers.EmailField(source='user.email', read_only=True)
    site_name = serializers.CharField(source='site.name', read_only=True)
    site_identifier = serializers.CharField(source='site.identifier', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = DomainOrder
        fields = [
            'id', 'user', 'user_email', 'site', 'site_name', 'site_identifier',
            'domain_name', 'ovh_order_id', 'ovh_cart_id', 'price', 'status',
            'status_display', 'payment_url', 'dns_configuration', 'target', 'proxy_mode', 'error_message',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'ovh_order_id', 'ovh_cart_id', 'payment_url',
            'dns_configuration', 'error_message', 'created_at', 'updated_at'
        ]


class TestimonialSerializer(serializers.ModelSerializer):
    """Serializer for client testimonials."""
    
    class Meta:
        model = Testimonial
        fields = [
            'id', 'site', 'author_name', 'author_email', 'rating', 'content',
            'is_approved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TestimonialSummarySerializer(serializers.ModelSerializer):
    """Serializer for AI-generated testimonial summaries."""
    
    class Meta:
        model = TestimonialSummary
        fields = [
            'id', 'site', 'summary', 'detailed_summary', 'total_count',
            'average_rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class NewsletterSubscriptionSerializer(serializers.Serializer):
    """Serializer for newsletter subscription."""
    
    site_identifier = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    frequency = serializers.ChoiceField(
        choices=['daily', 'weekly', 'monthly'],
        default='weekly'
    )
    
    def validate_site_identifier(self, value):
        """Validate that the site exists."""
        from .models import Site
        try:
            Site.objects.get(identifier=value)
        except Site.DoesNotExist:
            raise serializers.ValidationError('Site not found.')
        return value


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Przelewy24 payments."""
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'session_id', 'amount', 'currency', 'description',
            'email', 'plan_id', 'token', 'status', 'p24_order_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'token', 'p24_order_id', 'created_at', 'updated_at']


class BigEventSerializer(serializers.ModelSerializer):
    """Serializer for big events (trips, workshops, retreats)."""
    
    class Meta:
        model = BigEvent
        fields = [
            'id', 'site', 'creator', 'title', 'description', 'location',
            'start_date', 'end_date', 'max_participants', 'current_participants',
            'price', 'status', 'send_email_on_publish', 'email_sent', 'email_sent_at',
            'image_url', 'details', 'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = ['id', 'creator', 'email_sent', 'email_sent_at', 'created_at', 'updated_at', 'published_at']
    
    def create(self, validated_data):
        # Automatically set creator from request user
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)
