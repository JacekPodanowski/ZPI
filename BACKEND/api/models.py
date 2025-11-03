from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.crypto import get_random_string
from datetime import timedelta
from .utils import generate_site_identifier


def terms_of_service_path(instance, filename):
    """File path for ToS uploads: MEDIA_ROOT/terms/v_1.0/terms.pdf"""
    return f'terms/v_{instance.version}/{filename}'


class TermsOfService(models.Model):
    """Stores different versions of Terms of Service documents."""
    version = models.CharField(max_length=20, unique=True, help_text="Version number, e.g., '1.0' or '2025-11-01'")
    file = models.FileField(upload_to=terms_of_service_path, help_text="The PDF file for these terms.")
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

    class SourceTag(models.TextChoices):
        JACEK = 'JACEK', 'Jacek Campaign'
        WEB = 'WEB', 'Organic Web'

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
    avatar = models.CharField(max_length=500, blank=True, null=True, help_text='URL to user avatar image')
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
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = PlatformUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    def __str__(self):
        return f"{self.email} ({self.get_account_type_display()})"

    class Meta:
        verbose_name = 'Platform user'
        verbose_name_plural = 'Platform users'


class Site(models.Model):
    owner = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='sites')
    name = models.CharField(max_length=255)
    identifier = models.SlugField(max_length=255, unique=True, editable=False, blank=True, null=True)
    color_index = models.IntegerField(default=0, help_text='Index of the site color in the palette (0-11)')
    template_config = models.JSONField(default=dict, blank=True)
    version_history = models.JSONField(default=list, blank=True)
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


class Template(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    template_config = models.JSONField(default=dict)
    thumbnail_url = models.URLField(blank=True, null=True)
    is_public = models.BooleanField(default=True)

    def __str__(self):
        return self.name


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


class Event(models.Model):
    class EventType(models.TextChoices):
        INDIVIDUAL = 'individual', 'Individual'
        GROUP = 'group', 'Group'

    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='events')
    creator = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='created_events')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    capacity = models.PositiveIntegerField(default=1)
    event_type = models.CharField(max_length=32, choices=EventType.choices, default=EventType.INDIVIDUAL)
    attendees = models.ManyToManyField(Client, related_name='events', blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_time']
        constraints = [
            models.CheckConstraint(check=models.Q(end_time__gt=models.F('start_time')), name='event_end_after_start'),
            models.CheckConstraint(check=models.Q(capacity__gte=1), name='event_capacity_positive'),
        ]

    def __str__(self):
        return f"{self.title} ({self.start_time.isoformat()} - {self.end_time.isoformat()})"


class AvailabilityBlock(models.Model):
    """
    Represents a time window where clients can book appointments.
    The creator defines meeting lengths, time snapping, and buffer time.
    """
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='availability_blocks')
    creator = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='created_availability_blocks')
    title = models.CharField(max_length=255, default='Dostępny')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    meeting_lengths = models.JSONField(
        default=list,
        help_text='List of allowed meeting durations in minutes, e.g., [30, 45, 60]'
    )
    time_snapping = models.IntegerField(
        default=30,
        help_text='Interval in minutes for when meetings can start (e.g., 15, 30, 60)'
    )
    buffer_time = models.IntegerField(
        default=0,
        help_text='Minimum time between meetings in minutes'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'start_time']
        constraints = [
            models.CheckConstraint(
                check=models.Q(end_time__gt=models.F('start_time')),
                name='availability_end_after_start'
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
    return f'komponenty/{filename}'


class CustomReactComponent(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    source_code = models.TextField(blank=True, help_text='Oryginalny kod JSX dla celów edycji')
    compiled_js = models.FileField(upload_to=custom_component_path, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


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
    """Stores magic link tokens for passwordless authentication."""
    email = models.EmailField(max_length=254)
    token = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Magic link for {self.email} ({"used" if self.used else "active"})'
    
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
    def create_for_email(cls, email, expiry_minutes=15):
        """Create a new magic link for the given email."""
        token = get_random_string(64)
        expires_at = timezone.now() + timedelta(minutes=expiry_minutes)
        return cls.objects.create(
            email=email,
            token=token,
            expires_at=expires_at
        )
    
    @classmethod
    def cleanup_expired(cls):
        """Delete expired magic links."""
        cutoff = timezone.now()
        cls.objects.filter(expires_at__lt=cutoff).delete()