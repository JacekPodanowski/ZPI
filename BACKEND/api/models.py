from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from .utils import generate_site_identifier


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
    account_type = models.CharField(max_length=10, choices=AccountType.choices, default=AccountType.FREE)
    source_tag = models.CharField(max_length=10, choices=SourceTag.choices, default=SourceTag.WEB)
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
    admin = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='managed_events')
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
    admin = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='availability_blocks')
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