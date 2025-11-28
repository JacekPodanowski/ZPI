import uuid

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.crypto import get_random_string
from datetime import timedelta
from .utils import generate_site_identifier


class LegalDocument(models.Model):
    """Stores different versions of legal documents (Terms, Privacy Policy, Guide) with markdown content."""
    
    class DocumentType(models.TextChoices):
        TERMS = 'terms', 'Regulamin'
        POLICY = 'policy', 'Polityka Prywatności'
        GUIDE = 'guide', 'Poradnik'
    
    document_type = models.CharField(
        max_length=20, 
        choices=DocumentType.choices, 
        default=DocumentType.TERMS,
        help_text="Type of legal document"
    )
    version = models.CharField(max_length=20, default='0.0', help_text="Version number, e.g., '1.0' or '2025-11-01'")
    content_md = models.TextField(default='', blank=True, help_text="Markdown content of the document")
    published_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-published_at']
        unique_together = ['document_type', 'version']

    def __str__(self):
        return f"{self.get_document_type_display()} v{self.version}"


# Backwards compatibility alias
TermsOfService = LegalDocument


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
    daily_image_searches = models.IntegerField(default=0, help_text='Number of Pexels searches performed today')
    last_search_date = models.DateField(null=True, blank=True, help_text='Date of last Pexels search (for daily reset)')
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


class Agent(models.Model):
    """
    Represents an AI agent with its own conversation history and specialization.
    Each agent is tied to a specific user, site, and context (e.g., editor, events).
    Users can create multiple agents and switch between them.
    """
    class ContextType(models.TextChoices):
        STUDIO_EDITOR = 'studio_editor', 'Studio Editor'
        STUDIO_EVENTS = 'studio_events', 'Studio Events'
        STUDIO_DASHBOARD = 'studio_dashboard', 'Studio Dashboard'
        STUDIO_TEAM = 'studio_team', 'Studio Team'
        OTHER = 'other', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        PlatformUser,
        on_delete=models.CASCADE,
        related_name='agents',
        help_text='User who owns this agent'
    )
    site = models.ForeignKey(
        'Site',
        on_delete=models.CASCADE,
        related_name='agents',
        null=True,
        blank=True,
        help_text='Site this agent is working on (optional for global agents)'
    )
    context_type = models.CharField(
        max_length=50,
        choices=ContextType.choices,
        default=ContextType.STUDIO_EDITOR,
        help_text='Context/section where this agent operates'
    )
    name = models.CharField(
        max_length=100,
        help_text='Agent name (e.g., "Asystent #1", "Events Helper")'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'site', 'context_type']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.user.email} @ {self.context_type})"


class ChatHistory(models.Model):
    """
    Stores chat conversation history between users and AI assistant.
    Supports context tracking across different sections (studio, events, etc.)
    and maintains conversation memory for improved AI responses.
    Each message is linked to a specific Agent.
    """
    class ContextType(models.TextChoices):
        STUDIO_EDITOR = 'studio_editor', 'Studio Editor'
        STUDIO_EVENTS = 'studio_events', 'Studio Events'
        STUDIO_DASHBOARD = 'studio_dashboard', 'Studio Dashboard'
        STUDIO_TEAM = 'studio_team', 'Studio Team'
        OTHER = 'other', 'Other'

    agent = models.ForeignKey(
        Agent,
        on_delete=models.CASCADE,
        related_name='chat_history',
        null=True,  # Temporarily nullable for migration
        blank=True,
        help_text='Agent that handled this conversation'
    )
    user = models.ForeignKey(
        PlatformUser,
        on_delete=models.CASCADE,
        related_name='chat_history',
        help_text='User who sent the message'
    )
    site = models.ForeignKey(
        'Site',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='chat_history',
        help_text='Site context for the message (optional)'
    )
    context_type = models.CharField(
        max_length=50,
        choices=ContextType.choices,
        default=ContextType.STUDIO_EDITOR,
        help_text='Context/section where the message was sent'
    )
    context_data = models.JSONField(
        default=dict,
        blank=True,
        help_text='Additional context data (page_id, module_id, etc.)'
    )
    user_message = models.TextField(
        help_text='Message sent by the user'
    )
    ai_response = models.TextField(
        help_text='Response from AI assistant'
    )
    task_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Celery task ID for tracking'
    )
    status = models.CharField(
        max_length=20,
        default='success',
        help_text='Status of the AI response (success, error, clarification)'
    )
    deleted = models.BooleanField(
        default=False,
        help_text='Whether this message was deleted/reverted by user'
    )
    related_event_id = models.IntegerField(
        blank=True,
        null=True,
        help_text='ID of BigEvent created/modified by this AI response (for undo functionality)'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['agent', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['site', '-created_at']),
            models.Index(fields=['context_type', '-created_at']),
        ]

    def __str__(self):
        return f"Chat {self.id}: {self.user.email} @ Agent {self.agent.name} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


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
    subdomain = models.CharField(
        max_length=255,
        unique=True,
        editable=False,
        blank=True,
        null=True,
        help_text='Auto-generated subdomain (e.g., 1234-nazwa.youreasysite.pl)'
    )
    is_published = models.BooleanField(
        default=False,
        help_text='Whether this site is published and publicly accessible'
    )
    published_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text='When the site was first published'
    )
    color_index = models.IntegerField(default=0, help_text='Index of the site color in the palette (0-11)')
    team_size = models.IntegerField(default=1, help_text='Cached count of team members for calendar optimization')
    is_mock = models.BooleanField(default=False, help_text='Flag indicating if this is a mock/demo site for testing (includes showcase)')
    template_config = models.JSONField(default=dict, blank=True)
    ai_checkpoints = models.JSONField(
        default=list, 
        blank=True,
        help_text='List of AI checkpoints with {id, timestamp, config, message} for undo functionality'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        owner = getattr(self, 'owner', None)
        owner_first = getattr(owner, 'first_name', '') if owner else ''
        owner_last = getattr(owner, 'last_name', '') if owner else ''
        desired_identifier = generate_site_identifier(self.pk, self.name, owner_first, owner_last)
        
        # Auto-generate subdomain based on identifier
        desired_subdomain = f"{desired_identifier}.youreasysite.pl" if desired_identifier else None
        
        # Update both identifier and subdomain if they changed
        updates = {}
        if self.identifier != desired_identifier:
            updates['identifier'] = desired_identifier
            self.identifier = desired_identifier
        if self.subdomain != desired_subdomain:
            updates['subdomain'] = desired_subdomain
            self.subdomain = desired_subdomain
        
        if updates:
            Site.objects.filter(pk=self.pk).update(**updates)

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
        MOCK = 'mock', 'Mock (Not invited)'
        INVITED = 'invited', 'Invited (No account)'
        PENDING = 'pending', 'Pending (Has account)'
        LINKED = 'linked', 'Linked (Connected)'
        REJECTED = 'rejected', 'Rejected/Left'

    class PermissionRole(models.TextChoices):
        VIEWER = 'viewer', 'Viewer'
        CONTRIBUTOR = 'contributor', 'Contributor'
        MANAGER = 'manager', 'Manager'

    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='team_members')
    name = models.CharField(max_length=300, default='Unnamed', help_text='Full name of the team member')
    email = models.EmailField(blank=True, null=True, help_text='Required for sending invitations')
    role_description = models.CharField(max_length=255, blank=True, help_text='E.g., "Yoga Instructor", "Therapist"')
    avatar_url = models.CharField(max_length=500, blank=True, null=True, help_text='Avatar URL for display')
    is_active = models.BooleanField(default=True)
    
    # Invitation management
    linked_user = models.ForeignKey(PlatformUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='team_memberships')
    invitation_status = models.CharField(max_length=16, choices=InvitationStatus.choices, default=InvitationStatus.MOCK)
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
        return f"{self.name} {status} - {self.site.name}"


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
    capacity = models.IntegerField(default=1, help_text='Maximum capacity. Use -1 for unlimited participants.')
    event_type = models.CharField(max_length=32, choices=EventType.choices, default=EventType.INDIVIDUAL)
    attendees = models.ManyToManyField(Client, related_name='events', blank=True)
    show_host = models.BooleanField(default=False, help_text='Whether to display the host/assigned person publicly')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start_time']
        constraints = [
            models.CheckConstraint(check=models.Q(end_time__gt=models.F('start_time')), name='event_end_after_start'),
            models.CheckConstraint(check=models.Q(capacity__gte=1) | models.Q(capacity=-1), name='event_capacity_positive_or_unlimited'),
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

class AttendedSessionManager(models.Manager):
    def sync_for_site(self, site, until=None) -> int:
        """Snapshot finished events into attendance table (idempotent)."""
        if site is None:
            raise ValueError('site is required')

        until = until or timezone.now()
        site_obj = site if isinstance(site, Site) else Site.objects.get(pk=site)
        site_id = site_obj.pk

        existing_event_ids = list(
            self.filter(site_id=site_id, event__isnull=False)
            .values_list('event_id', flat=True)
        )

        events_qs = Event.objects.filter(
            site_id=site_id,
            start_time__lte=until
        ).select_related('assigned_to_team_member', 'assigned_to_owner')

        if existing_event_ids:
            events_qs = events_qs.exclude(id__in=existing_event_ids)

        snapshots = []
        for event in events_qs:
            host_type = AttendedSession.HostType.TEAM_MEMBER
            host_user = None
            host_member = event.assigned_to_team_member

            if host_member is None:
                host_type = AttendedSession.HostType.OWNER
                host_user = event.assigned_to_owner

            duration_minutes = max(1, int((event.end_time - event.start_time).total_seconds() // 60))

            snapshots.append(
                AttendedSession(
                    site_id=site_id,
                    event=event,
                    host_type=host_type,
                    host_user=host_user,
                    host_team_member=host_member,
                    title=event.title,
                    start_time=event.start_time,
                    end_time=event.end_time,
                    duration_minutes=duration_minutes,
                )
            )

        if snapshots:
            self.bulk_create(snapshots, ignore_conflicts=True)

        return len(snapshots)


class AttendedSession(models.Model):
    class HostType(models.TextChoices):
        OWNER = 'owner', 'Owner'
        TEAM_MEMBER = 'team_member', 'Team Member'

    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='attended_sessions')
    event = models.ForeignKey(Event, on_delete=models.SET_NULL, null=True, blank=True, related_name='attended_sessions')
    host_type = models.CharField(max_length=20, choices=HostType.choices)
    host_user = models.ForeignKey(
        PlatformUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hosted_sessions'
    )
    host_team_member = models.ForeignKey(
        TeamMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hosted_sessions'
    )
    title = models.CharField(max_length=255)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField()
    recorded_at = models.DateTimeField(default=timezone.now)
    source = models.CharField(max_length=32, default='event_snapshot')

    objects = AttendedSessionManager()

    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['site', 'host_type']),
            models.Index(fields=['start_time']),
        ]
        constraints = [
            models.CheckConstraint(
                check=(
                    (
                        models.Q(host_type='owner') &
                        models.Q(host_user__isnull=False) &
                        models.Q(host_team_member__isnull=True)
                    ) |
                    (
                        models.Q(host_type='team_member') &
                        models.Q(host_team_member__isnull=False) &
                        models.Q(host_user__isnull=True)
                    )
                ),
                name='attendedsession_host_guard'
            ),
            models.CheckConstraint(
                check=models.Q(duration_minutes__gte=1),
                name='attendedsession_positive_duration'
            ),
            models.UniqueConstraint(
                fields=['event', 'host_user'],
                condition=models.Q(
                    host_type='owner',
                    event__isnull=False,
                    host_user__isnull=False
                ),
                name='unique_attendance_owner_per_event'
            ),
            models.UniqueConstraint(
                fields=['event', 'host_team_member'],
                condition=models.Q(
                    host_type='team_member',
                    event__isnull=False,
                    host_team_member__isnull=False
                ),
                name='unique_attendance_member_per_event'
            ),
        ]

    def __str__(self):
        host = self.host_user.email if self.host_type == self.HostType.OWNER and self.host_user else (
            f"{self.host_team_member.first_name} {self.host_team_member.last_name}" if self.host_team_member else 'Unknown'
        )
        return f"{self.title} ({host}) @ {self.start_time.isoformat()}"

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
    """Email template model supporting both default and custom user templates.
    Only client-facing email templates are user-editable."""
    
    class Category(models.TextChoices):
        BOOKING_CONFIRMATION = 'booking_confirmation', 'Booking Confirmation'
        SESSION_CANCELLED_BY_CREATOR = 'session_cancelled_by_creator', 'Session Cancelled by Creator'
        DEV = 'dev', 'Development/Testing'
    
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
        FREE = 'free', 'Added to Cloudflare - Awaiting Configuration'
        PENDING = 'pending', 'Waiting for Nameserver Propagation'
        PENDING_PAYMENT = 'pending_payment', 'Pending Payment'
        CONFIGURING_DNS = 'configuring_dns', 'Configuring DNS'
        ACTIVE = 'active', 'Active'
        DNS_ERROR = 'dns_error', 'DNS Configuration Error'
        EXPIRED = 'expired', 'Expired (Not Configured in Time)'
        CANCELLED = 'cancelled', 'Cancelled'
        ERROR = 'error', 'Configuration Error'
    
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
        null=True,
        blank=True,
        help_text='Site this domain is for (optional)'
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
    cloudflare_zone_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Cloudflare Zone ID for this domain'
    )
    cloudflare_nameservers = models.JSONField(
        default=list,
        blank=True,
        help_text='Cloudflare nameservers assigned to this domain'
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text='Expiration time for domain reservation (48h from creation if not configured)'
    )
    domain_expiration_date = models.DateField(
        null=True,
        blank=True,
        help_text='Domain expiration date from registrar (e.g., from WHOIS lookup)'
    )
    expiration_notification_sent = models.BooleanField(
        default=False,
        help_text='Whether the 1-month expiration notification was sent'
    )
    expiration_email_sent = models.BooleanField(
        default=False,
        help_text='Whether the 1-week expiration email was sent'
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
            models.Index(fields=['expires_at']),
        ]
        constraints = [
            # Prevent duplicate active/pending domains across all users
            models.UniqueConstraint(
                fields=['domain_name'],
                condition=models.Q(
                    status__in=['free', 'pending', 'configuring_dns', 'active']
                ),
                name='unique_active_domain_per_system'
            ),
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


class NewsletterSubscription(models.Model):
    """Newsletter subscriptions for event notifications per site."""
    
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='newsletter_subscriptions')
    email = models.EmailField()
    is_active = models.BooleanField(default=True)
    is_confirmed = models.BooleanField(default=False)  # Double opt-in confirmation
    confirmation_token = models.CharField(max_length=64, unique=True, editable=False, null=True, blank=True)
    unsubscribe_token = models.CharField(max_length=64, unique=True, editable=False)
    subscribed_at = models.DateTimeField(default=timezone.now)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    last_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Analytics tracking
    emails_sent = models.IntegerField(default=0)
    emails_opened = models.IntegerField(default=0)
    emails_clicked = models.IntegerField(default=0)
    
    class Meta:
        unique_together = [('site', 'email')]
        indexes = [
            models.Index(fields=['site', 'is_active']),
            models.Index(fields=['unsubscribe_token']),
            models.Index(fields=['confirmation_token']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.unsubscribe_token:
            self.unsubscribe_token = get_random_string(64)
        if not self.confirmation_token and not self.is_confirmed:
            self.confirmation_token = get_random_string(64)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.email} - {self.site.name}"


class NewsletterAnalytics(models.Model):
    """Track individual newsletter email analytics - opens and clicks."""
    subscription = models.ForeignKey(NewsletterSubscription, on_delete=models.CASCADE, related_name='analytics')
    sent_at = models.DateTimeField(auto_now_add=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    tracking_token = models.CharField(max_length=64, unique=True, editable=False)
    
    class Meta:
        indexes = [
            models.Index(fields=['tracking_token']),
            models.Index(fields=['subscription', 'sent_at']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.tracking_token:
            self.tracking_token = get_random_string(64)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Analytics for {self.subscription.email} sent at {self.sent_at}"


class Payment(models.Model):
    """Stores Przelewy24 payment transactions."""
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    user = models.ForeignKey(
        PlatformUser,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text='User who made the payment'
    )
    session_id = models.CharField(
        max_length=100,
        unique=True,
        help_text='Unique session ID for this transaction (order ID)'
    )
    amount = models.IntegerField(
        help_text='Amount in grosz (1 PLN = 100 grosz)'
    )
    currency = models.CharField(
        max_length=3,
        default='PLN',
        help_text='Currency code (ISO 4217)'
    )
    description = models.CharField(
        max_length=255,
        help_text='Payment description'
    )
    email = models.EmailField(
        help_text='Customer email'
    )
    plan_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text='Plan ID being purchased (free, pro, pro-plus)'
    )
    token = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text='Payment token from Przelewy24'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        help_text='Current payment status'
    )
    p24_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Przelewy24 order ID (returned after payment)'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['session_id']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Payment {self.session_id} - {self.get_status_display()} ({self.amount/100} PLN)"


class BigEvent(models.Model):
    """
    Represents large events like trips, workshops, retreats.
    These are major events that can be published to the site and sent via newsletter.
    """
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        CANCELLED = 'cancelled', 'Cancelled'
        COMPLETED = 'completed', 'Completed'

    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='big_events')
    creator = models.ForeignKey(PlatformUser, on_delete=models.CASCADE, related_name='created_big_events')
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    max_participants = models.IntegerField(help_text='Maximum number of participants')
    current_participants = models.IntegerField(default=0, help_text='Current number of registered participants')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='Price per person')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    # Email notification tracking
    email_sent = models.BooleanField(default=False, help_text='Whether email has been sent')
    email_sent_at = models.DateTimeField(blank=True, null=True)
    
    # Additional details
    image_url = models.CharField(max_length=500, blank=True, null=True, help_text='Event cover image')
    details = models.JSONField(default=dict, blank=True, help_text='Additional event details (schedule, requirements, etc.)')
    
    # AI checkpoints for reverting changes
    ai_checkpoints = models.JSONField(
        default=list,
        blank=True,
        help_text='List of AI checkpoints (max 20, newest first). Each checkpoint stores event state before AI changes.'
    )
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['site', 'status']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.title} ({self.site.identifier}) - {self.get_status_display()}"


class GoogleCalendarIntegration(models.Model):
    """
    Stores Google Calendar OAuth credentials and sync settings for a Site.
    Each Site can have ONE active Google Calendar integration.
    """
    site = models.OneToOneField(
        Site,
        on_delete=models.CASCADE,
        related_name='google_calendar_integration',
        help_text='Site connected to Google Calendar'
    )
    connected_by = models.ForeignKey(
        PlatformUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='connected_google_calendars',
        help_text='User who connected this Google Calendar'
    )
    
    # OAuth credentials
    google_email = models.EmailField(help_text='Google account email')
    access_token = models.TextField(help_text='OAuth access token (encrypted)')
    refresh_token = models.TextField(help_text='OAuth refresh token (encrypted)')
    token_expires_at = models.DateTimeField(help_text='When the access token expires')
    
    # Google Calendar details
    calendar_id = models.CharField(max_length=255, help_text='Google Calendar ID (usually the email)')
    calendar_name = models.CharField(max_length=255, blank=True, help_text='Display name of the calendar')
    
    # Sync settings
    is_active = models.BooleanField(default=True, help_text='Whether sync is currently active')
    sync_enabled = models.BooleanField(default=True, help_text='Whether to sync events to Google Calendar')
    last_sync_at = models.DateTimeField(blank=True, null=True, help_text='Last successful sync timestamp')
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Google Calendar Integration'
        verbose_name_plural = 'Google Calendar Integrations'
        indexes = [
            models.Index(fields=['site', 'is_active']),
        ]

    def __str__(self):
        return f"{self.site.name} → {self.google_email}"


class GoogleCalendarEvent(models.Model):
    """
    Maps local Events to Google Calendar events for tracking and synchronization.
    """
    event = models.OneToOneField(
        Event,
        on_delete=models.CASCADE,
        related_name='google_calendar_event',
        help_text='Local event'
    )
    integration = models.ForeignKey(
        GoogleCalendarIntegration,
        on_delete=models.CASCADE,
        related_name='synced_events',
        help_text='Google Calendar integration'
    )
    google_event_id = models.CharField(max_length=255, help_text='Google Calendar event ID')
    last_synced_at = models.DateTimeField(auto_now=True, help_text='Last sync timestamp')
    
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name = 'Google Calendar Event'
        verbose_name_plural = 'Google Calendar Events'
        indexes = [
            models.Index(fields=['integration', 'google_event_id']),
        ]

    def __str__(self):
        return f"{self.event.title} → {self.google_event_id}"
