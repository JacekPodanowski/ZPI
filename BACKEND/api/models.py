import uuid

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.crypto import get_random_string
from datetime import timedelta
from .utils import generate_site_identifier


class TermsOfService(models.Model):
    """Stores different versions of Terms of Service with markdown content."""
    version = models.CharField(max_length=20, unique=True, default='0.0', help_text="Version number, e.g., '1.0' or '2025-11-01'")
    content_md = models.TextField(default='', blank=True, help_text="Markdown content of the terms")
    published_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return f"Terms of Service v{self.version}"


class PlatformUserManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        extra_fields.setdefault('account_type', PlatformUser.AccountType.FREE)
        extra_fields.setdefault('source_tag', PlatformUser.SourceTag.WEB)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('account_type', PlatformUser.AccountType.PRO)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)


class PlatformUser(AbstractBaseUser, PermissionsMixin):
    class AccountType(models.TextChoices):
        FREE = 'free', 'Free'
        PRO = 'pro', 'Pro'
        PRO_PLUS = 'pro_plus', 'Pro+'

    class SourceTag(models.TextChoices):
        JACEK = 'JACEK', 'Jacek Campaign'
        WEB = 'WEB', 'Organic Web'
        TEAM_INVITATION = 'TEAM_INV', 'Team Invitation'

    username = models.CharField(
        max_length=150,
        unique=True,
        blank=True,
        null=True,
        help_text='Optional unique username used for legacy flows.'
    )
    email = models.EmailField(max_length=254, unique=True)
    first_name = models.CharField(max_length=150, blank=False)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    avatar_url = models.CharField(max_length=500, blank=True, null=True, help_text='URL to user avatar image')
    public_image_url = models.CharField(max_length=500, blank=True, null=True, help_text='Public image URL displayed on team page')
    role_description = models.CharField(max_length=200, blank=True, null=True, help_text='Role/title displayed on team page (e.g., "Założyciel", "Instruktor")')
    bio = models.TextField(blank=True, null=True, help_text='Biography displayed on team page')
    account_type = models.CharField(max_length=10, choices=AccountType.choices, default=AccountType.FREE)
    source_tag = models.CharField(max_length=10, choices=SourceTag.choices, default=SourceTag.WEB)
    preferences = models.JSONField(
        default=dict,
        blank=True,
        help_text='User preferences: {"theme": {"mode": "dark", "themeId": "studio"}, "calendar": {"operating_start_hour": 6, "operating_end_hour": 22}}'
    )
    terms_agreement = models.ForeignKey(
        TermsOfService,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='agreed_users',
        help_text='The ToS version this user has accepted'
    )
    terms_agreement_date = models.DateTimeField(null=True, blank=True, help_text='When the user accepted the ToS')
    is_temporary_password = models.BooleanField(default=False, help_text='Whether the user has a temporary password that must be changed')
    password_changed_at = models.DateTimeField(null=True, blank=True, help_text='When the user last changed their password')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = PlatformUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f"{self.first_name} {self.last_name or ''}".strip()
        return full_name

    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name

    def __str__(self):
        return f"{self.email} ({self.get_account_type_display()})"

    class Meta:
        verbose_name = 'Platform user'
        verbose_name_plural = 'Platform users'


class Site(models.Model):
    """
    Represents a personal website in the platform.
    
    ID RANGE CONVENTION:
    - ID 1: Reserved for "YourEasySite Demo" (showcase/preview site)
    - IDs 2-99: Mock/demo sites for development and testing
    - IDs 100+: Real user sites (auto-incremented by Django/PostgreSQL)
    
    This convention allows:
    - Easy identification of site types by ID alone
    - Simple filtering (e.g., id >= 100 for user sites, is_mock=True for test sites)
    - Reserved space for development without conflicts
    """
    owner = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='sites')
    name = models.CharField(max_length=255)
    identifier = models.SlugField(max_length=255, unique=True, editable=False, blank=True, null=True)
    color_index = models.IntegerField(default=0, help_text='Index of the site color in the palette (0-11)')
    team_size = models.IntegerField(default=1, help_text='Cached count of team members for calendar optimization')
    is_mock = models.BooleanField(default=False, help_text='Flag indicating if this is a mock/demo site for testing (includes showcase)')
    template_config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        owner = getattr(self, 'owner', None)
        owner_first = getattr(owner, 'first_name', '') if owner else ''
        owner_last = getattr(owner, 'last_name', '') if owner else ''
        desired_identifier = generate_site_identifier(self.pk, self.name, owner_first, owner_last)
        if self.identifier != desired_identifier:
            Site.objects.filter(pk=self.pk).update(identifier=desired_identifier)
            self.identifier = desired_identifier

    def __str__(self):
        return f"{self.name} ({self.identifier})"


class SiteVersion(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='versions')
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    version_number = models.PositiveIntegerField()
    template_config = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(
        PlatformUser,
        on_delete=models.SET_NULL,
        related_name='created_site_versions',
        blank=True,
        null=True
    )
    notes = models.CharField(max_length=500, blank=True)
    change_summary = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=('site', 'version_number'), name='unique_site_version_per_site')
        ]

    def __str__(self):
        return f"{self.site.identifier} v{self.version_number}"


class Template(models.Model):
    owner = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='calendar_templates')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    template_config = models.JSONField(default=dict)
    thumbnail_url = models.URLField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('owner', 'name')]
        indexes = [
            models.Index(fields=['owner']),
        ]

    def __str__(self):
        return f"{self.name} ({self.owner.email})"


class Client(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='clients')
    email = models.EmailField()
    name = models.CharField(max_length=255)
    google_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('site', 'email')]
        indexes = [
            models.Index(fields=['site', 'email']),
            models.Index(fields=['site', 'google_id']),
        ]

    def __str__(self):
        return f"{self.email} ({self.site.identifier})"


class TeamMember(models.Model):
    """Represents a team member with invitation and permission management."""
    class InvitationStatus(models.TextChoices):
        INVITED = 'invited', 'Invited (No account)'
        PENDING = 'pending', 'Pending (Has account)'
        LINKED = 'linked', 'Linked (Connected)'
        REJECTED = 'rejected', 'Rejected/Left'

    class PermissionRole(models.TextChoices):
        VIEWER = 'viewer', 'Viewer'
        CONTRIBUTOR = 'contributor', 'Contributor'
        MANAGER = 'manager', 'Manager'

    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='team_members')
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(blank=True, null=True, help_text='Required for sending invitations')
    role_description = models.CharField(max_length=255, blank=True, help_text='E.g., "Yoga Instructor", "Therapist"')
    bio = models.TextField(blank=True, help_text='Member bio for public display')
    avatar_url = models.CharField(max_length=500, blank=True, null=True, help_text='Private avatar URL for internal use')
    public_image_url = models.CharField(max_length=500, blank=True, null=True, help_text='Public image URL displayed on site')
    is_active = models.BooleanField(default=True)
    
    # Invitation management
    linked_user = models.ForeignKey(PlatformUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='team_memberships')
    invitation_status = models.CharField(max_length=16, choices=InvitationStatus.choices, default=InvitationStatus.INVITED)
    invitation_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    invited_at = models.DateTimeField(null=True, blank=True)
    
    # Permissions
    permission_role = models.CharField(max_length=16, choices=PermissionRole.choices, default=PermissionRole.VIEWER)
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['site', 'linked_user']),
            models.Index(fields=['invitation_token']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        status = f"({self.get_invitation_status_display()})"
        return f"{self.first_name} {self.last_name} {status} - {self.site.name}"


class Event(models.Model):
    class EventType(models.TextChoices):
        INDIVIDUAL = 'individual', 'Individual'
        GROUP = 'group', 'Group'

    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='events')
    creator = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='created_events')
    
    # Dual assignment: exactly one must be filled
    assigned_to_team_member = models.ForeignKey(
        'TeamMember',
        on_delete=models.CASCADE,  # Delete event when team member is deleted (e.g., when site is deleted)
        null=True,
        blank=True,
        related_name='assigned_events',
        help_text='Team member assigned to this event'
    )
    assigned_to_owner = models.ForeignKey(
        PlatformUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_events',
        help_text='Owner assigned to this event'
    )
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    capacity = models.PositiveIntegerField(default=1)
    event_type = models.CharField(max_length=32, choices=EventType.choices, default=EventType.INDIVIDUAL)
    attendees = models.ManyToManyField(Client, related_name='events', blank=True)
    show_host = models.BooleanField(default=False, help_text='Whether to display the host/assigned person publicly')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_time']
        constraints = [
            models.CheckConstraint(check=models.Q(end_time__gt=models.F('start_time')), name='event_end_after_start'),
            models.CheckConstraint(check=models.Q(capacity__gte=1), name='event_capacity_positive'),
            # Ensure exactly one assignment field is filled
            models.CheckConstraint(
                check=(
                    models.Q(assigned_to_team_member__isnull=False, assigned_to_owner__isnull=True) |
                    models.Q(assigned_to_team_member__isnull=True, assigned_to_owner__isnull=False)
                ),
                name='event_single_assignment'
            ),
        ]

    def __str__(self):
        return f"{self.title} ({self.start_time.isoformat()} - {self.end_time.isoformat()})"


class AvailabilityBlock(models.Model):
    """
    Represents a time window where clients can book appointments.
    The creator defines meeting length, time snapping, and buffer time.
    """
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='availability_blocks')
    creator = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='created_availability_blocks')
    
    # Dual assignment: exactly one must be filled (optional for availability blocks)
    assigned_to_team_member = models.ForeignKey(
        'TeamMember',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='assigned_availability_blocks',
        help_text='Team member assigned to this availability block'
    )
    assigned_to_owner = models.ForeignKey(
        PlatformUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_availability_blocks',
        help_text='Owner assigned to this availability block'
    )
    
    title = models.CharField(max_length=255, default='Dostępny')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    meeting_length = models.IntegerField(
        default=60,
        help_text='Meeting duration in minutes (e.g., 30, 45, 60)'
    )
    time_snapping = models.IntegerField(
        default=30,
        help_text='Interval in minutes for when meetings can start (e.g., 15, 30, 60)'
    )
    buffer_time = models.IntegerField(
        default=0,
        help_text='Minimum time between meetings in minutes'
    )
    show_host = models.BooleanField(default=False, help_text='Whether to display the host/assigned person publicly')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'start_time']
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_time__gt=models.F('start_time')),
                name='availability_end_after_start'
            ),
            # Optional assignment: either both are null, or exactly one is filled
            models.CheckConstraint(
                check=(
                    models.Q(assigned_to_team_member__isnull=True, assigned_to_owner__isnull=True) |
                    models.Q(assigned_to_team_member__isnull=False, assigned_to_owner__isnull=True) |
                    models.Q(assigned_to_team_member__isnull=True, assigned_to_owner__isnull=False)
                ),
                name='availability_optional_single_assignment'
            ),
        ]

    def __str__(self):
        return f"{self.title} on {self.date} ({self.start_time} - {self.end_time})"


class Booking(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='bookings')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, related_name='bookings', null=True, blank=True)
    guest_email = models.EmailField(blank=True, null=True)
    guest_name = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['site']),
            models.Index(fields=['event']),
        ]

    def __str__(self):
        subject = self.client.email if self.client else self.guest_email or 'Guest'
        return f"Booking for {subject} on event {self.event_id}"


class MediaAsset(models.Model):
    class MediaType(models.TextChoices):
        IMAGE = 'image', 'Image'
        VIDEO = 'video', 'Video'
        OTHER = 'other', 'Other'

    file_name = models.CharField(max_length=255)
    storage_path = models.CharField(max_length=500, unique=True)
    file_url = models.CharField(max_length=500, unique=True)
    file_hash = models.CharField(max_length=64, unique=True)
    media_type = models.CharField(max_length=16, choices=MediaType.choices, default=MediaType.OTHER)
    file_size = models.BigIntegerField(default=0, help_text='Size in bytes of the stored media file')
    storage_bucket = models.CharField(max_length=100, blank=True, default='', help_text='Supabase bucket name (if applicable)')
    uploaded_by = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='uploaded_media')
    uploaded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=['media_type']),
            models.Index(fields=['uploaded_at']),
        ]

    def __str__(self):
        return f"{self.file_name} ({self.media_type})"


class MediaUsage(models.Model):
    class UsageType(models.TextChoices):
        AVATAR = 'avatar', 'Avatar'
        SITE_CONTENT = 'site_content', 'Site content'

    asset = models.ForeignKey(MediaAsset, on_delete=models.CASCADE, related_name='usages')
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='media_usages', blank=True, null=True)
    user = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='media_usages', blank=True, null=True)
    usage_type = models.CharField(max_length=32, choices=UsageType.choices)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=(
                    (models.Q(site__isnull=False) & models.Q(user__isnull=True)) |
                    (models.Q(site__isnull=True) & models.Q(user__isnull=False))
                ),
                name='mediausage_single_context'
            ),
            models.UniqueConstraint(
                fields=['asset', 'site', 'usage_type'],
                condition=models.Q(site__isnull=False),
                name='mediausage_unique_site_usage'
            ),
            models.UniqueConstraint(
                fields=['asset', 'user', 'usage_type'],
                condition=models.Q(user__isnull=False),
                name='mediausage_unique_user_usage'
            ),
        ]

    def __str__(self):
        target = self.site.identifier if self.site else (self.user.email if self.user else 'unknown')
        return f"{self.usage_type} -> {target}"


def custom_component_path(instance, filename):
    return f'components/{filename}'


class CustomReactComponent(models.Model):
    site = models.ForeignKey(
        Site, 
        on_delete=models.CASCADE, 
        related_name='custom_components',
        help_text='Site this custom component belongs to'
    )
    created_by = models.ForeignKey(
        PlatformUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_components',
        help_text='User who created this component'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    source_code = models.TextField(blank=True, help_text='Oryginalny kod JSX dla celów edycji')
    compiled_js = models.FileField(upload_to=custom_component_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [('site', 'name')]
        indexes = [
            models.Index(fields=['site']),
        ]

    def __str__(self):
        return f"{self.name} ({self.site.identifier})"


class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = (
        ('achievement', 'Achievement'),
        ('cancellation', 'Cancellation'),
        ('group_full', 'Group Full'),
        ('other', 'Other'),
    )

    user = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES, default='other')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Notification for {self.user.email}: {self.message[:20]}'


class MagicLink(models.Model):
    """Stores magic link tokens for passwordless authentication and password reset."""
    
    class ActionType(models.TextChoices):
        LOGIN = 'login', 'Login'
        PASSWORD_RESET = 'password_reset', 'Password Reset'
        TEAM_INVITATION = 'team_invitation', 'Team Invitation'
    
    user = models.ForeignKey(
        PlatformUser, 
        on_delete=models.CASCADE, 
        related_name='magic_links',
        null=True,
        blank=True,
        help_text='User associated with this magic link'
    )
    team_member = models.ForeignKey(
        'TeamMember',
        on_delete=models.CASCADE,
        related_name='invitation_links',
        null=True,
        blank=True,
        help_text='Team member associated with this invitation link'
    )
    email = models.EmailField(max_length=254)
    token = models.CharField(max_length=64, unique=True, db_index=True)
    action_type = models.CharField(max_length=20, choices=ActionType.choices, default=ActionType.LOGIN)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action_type']),
            models.Index(fields=['user', 'used']),
        ]
    
    def __str__(self):
        return f'Magic link for {self.user.email} ({"used" if self.used else "active"})'
    
    def is_valid(self):
        """Check if the magic link is still valid."""
        if self.used:
            return False
        if timezone.now() > self.expires_at:
            return False
        return True
    
    def mark_as_used(self):
        """Mark the magic link as used."""
        self.used = True
        self.used_at = timezone.now()
        self.save(update_fields=['used', 'used_at'])
    
    @classmethod
    def create_for_email(cls, email, expiry_minutes=15, action_type=None, user=None):
        """Create a new magic link for the given email and user."""
        if action_type is None:
            action_type = cls.ActionType.LOGIN
        
        # If user is not provided, try to find by email
        if user is None:
            try:
                user = PlatformUser.objects.get(email=email)
            except PlatformUser.DoesNotExist:
                raise ValueError(f"No user found with email {email}")
        
        token = get_random_string(64)
        expires_at = timezone.now() + timedelta(minutes=expiry_minutes)
        return cls.objects.create(
            user=user,
            email=email,
            token=token,
            action_type=action_type,
            expires_at=expires_at
        )
    
    @classmethod
    def cleanup_expired(cls):
        """Delete expired magic links."""
        cutoff = timezone.now()
        cls.objects.filter(expires_at__lt=cutoff).delete()


class EmailTemplate(models.Model):
    """Email template model supporting both default and custom user templates."""
    
    class Category(models.TextChoices):
        BOOKING_CONFIRMATION = 'booking_confirmation', 'Booking Confirmation'
        BOOKING_CANCELLATION = 'booking_cancellation', 'Booking Cancellation'
        ACCOUNT_REGISTRATION = 'account_registration', 'Account Registration'
        SITE_STATUS = 'site_status', 'Site Status'
        PLAN_CHANGE = 'plan_change', 'Plan Change'
        SUBSCRIPTION_REMINDER = 'subscription_reminder', 'Subscription Reminder'
    
    name = models.CharField(max_length=255, help_text='Template name for display')
    slug = models.SlugField(max_length=255, unique=True, help_text='Unique identifier for the template')
    category = models.CharField(max_length=50, choices=Category.choices, help_text='Template category')
    subject_pl = models.CharField(max_length=255, help_text='Email subject in Polish')
    subject_en = models.CharField(max_length=255, help_text='Email subject in English')
    content_pl = models.TextField(help_text='HTML email content in Polish')
    content_en = models.TextField(help_text='HTML email content in English')
    is_default = models.BooleanField(default=False, help_text='Is this a default system template?')
    owner = models.ForeignKey(
        PlatformUser, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='email_templates',
        help_text='Owner of custom template (null for default templates)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', '-is_default', 'name']
        indexes = [
            models.Index(fields=['owner', 'category']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        prefix = '[DEFAULT]' if self.is_default else '[CUSTOM]'
        return f'{prefix} {self.name} ({self.get_category_display()})'


class DomainOrder(models.Model):
    """Stores domain purchase orders with payment and configuration tracking."""
    
    class OrderStatus(models.TextChoices):
        PENDING_PAYMENT = 'pending_payment', 'Pending Payment'
        CONFIGURING_DNS = 'configuring_dns', 'Configuring DNS'
        ACTIVE = 'active', 'Active'
        DNS_ERROR = 'dns_error', 'DNS Configuration Error'
        EXPIRED = 'expired', 'Expired'
        CANCELLED = 'cancelled', 'Cancelled'
    
    user = models.ForeignKey(
        PlatformUser,
        on_delete=models.CASCADE,
        related_name='domain_orders',
        help_text='User who placed the order'
    )
    site = models.ForeignKey(
        Site,
        on_delete=models.CASCADE,
        related_name='domain_orders',
        help_text='Site this domain is for'
    )
    domain_name = models.CharField(
        max_length=255,
        help_text='Full domain name (e.g., example.com)'
    )
    ovh_order_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='OVH order ID from the API'
    )
    ovh_cart_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='OVH cart ID used for this order'
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Domain price in EUR'
    )
    status = models.CharField(
        max_length=32,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING_PAYMENT,
        help_text='Current status of the domain order'
    )
    payment_url = models.URLField(
        blank=True,
        null=True,
        help_text='Mock payment URL for testing'
    )
    dns_configuration = models.JSONField(
        default=dict,
        blank=True,
        help_text='DNS records configured for this domain'
    )
    target = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Target URL for domain redirect (e.g., youtube.com or user site subdomain)'
    )
    proxy_mode = models.BooleanField(
        default=False,
        help_text='If True, use reverse proxy (keeps URL). If False, use 301 redirect (changes URL)'
    )
    error_message = models.TextField(
        blank=True,
        null=True,
        help_text='Error message if DNS configuration failed'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['site']),
            models.Index(fields=['ovh_order_id']),
            models.Index(fields=['domain_name']),
        ]
    
    def __str__(self):
        return f"{self.domain_name} - {self.get_status_display()} (Order #{self.id})"


class Testimonial(models.Model):
    """Stores client testimonials/reviews for a site."""
    
    site = models.ForeignKey(
        Site,
        on_delete=models.CASCADE,
        related_name='testimonials',
        help_text='Site this testimonial belongs to'
    )
    author_name = models.CharField(
        max_length=255,
        help_text='Name of the person leaving the testimonial'
    )
    author_email = models.EmailField(
        blank=True,
        null=True,
        help_text='Email address (optional, for verification)'
    )
    rating = models.IntegerField(
        help_text='Rating from 1 to 5'
    )
    content = models.TextField(
        help_text='Testimonial content'
    )
    is_approved = models.BooleanField(
        default=True,
        help_text='Whether this testimonial is approved for public display'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['site', 'is_approved']),
            models.Index(fields=['site', 'rating']),
            models.Index(fields=['created_at']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(rating__gte=1, rating__lte=5),
                name='testimonial_rating_range'
            ),
        ]
    
    def __str__(self):
        return f"{self.author_name} - {self.rating}★ ({self.site.name})"


class TestimonialSummary(models.Model):
    """Stores AI-generated summaries of testimonials for a site."""
    
    site = models.OneToOneField(
        Site,
        on_delete=models.CASCADE,
        related_name='testimonial_summary',
        help_text='Site this summary belongs to'
    )
    summary = models.TextField(
        help_text='AI-generated summary of recent testimonials'
    )
    detailed_summary = models.TextField(
        blank=True,
        help_text='Detailed AI-generated analysis for admin panel'
    )
    total_count = models.IntegerField(
        default=0,
        help_text='Total number of testimonials analyzed'
    )
    average_rating = models.FloatField(
        default=0.0,
        help_text='Average rating from analyzed testimonials'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Testimonial summaries'
    
    def __str__(self):
        return f"Summary for {self.site.name} ({self.total_count} testimonials)"
