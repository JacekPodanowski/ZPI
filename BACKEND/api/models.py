from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.db.models import F, Q

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, username=None, user_type=None, first_name="", last_name="", **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)

        if not user_type:
            user_type = User.UserType.STUDENT

        is_staff = extra_fields.pop('is_staff', False)
        is_superuser = extra_fields.pop('is_superuser', False)

        user = self.model(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            user_type=user_type,
            **extra_fields
        )
        user.is_staff = is_staff
        user.is_superuser = is_superuser
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, username=None, first_name="", last_name="", user_type=None, **extra_fields):
        effective_user_type = User.UserType.ADMIN

        if not first_name:
            raise ValueError('Superuser must have a first name.')
        if not last_name:
            raise ValueError('Superuser must have a last name.')
            
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(
            email=email,
            password=password,
            username=username,
            user_type=effective_user_type, 
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )

class User(AbstractBaseUser, PermissionsMixin):
    class UserType(models.TextChoices):
        STUDENT = 'student', 'Student'
        VIP = 'vip', 'VIP'
        ADMIN = 'admin', 'Admin'

    username = models.CharField(
        max_length=150,
        unique=True, 
        blank=True,  
        null=True,   
        help_text='Optional. If provided, must be unique. 150 characters or fewer.'
    )
    email = models.EmailField(max_length=254, unique=True) 
    first_name = models.CharField(max_length=150, blank=False)
    last_name = models.CharField(max_length=150, blank=True, null=True)  
    phone = models.CharField(max_length=20, null=True, blank=True)
    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        default=UserType.STUDENT
    )
    created_at = models.DateTimeField(default=timezone.now)

    is_staff = models.BooleanField(
        default=False,
        help_text='Designates whether the user can log into this admin site. Should be True only for ADMIN type.'
    )
    is_active = models.BooleanField(
        default=True,
        help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.'
    )
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.email} ({self.get_user_type_display()})"

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class TimeSlot(models.Model):
    tutor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL, 
        null=True,
        blank=True, 
        related_name='time_slots',
        limit_choices_to= Q(user_type=User.UserType.ADMIN)
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        tutor_display = self.tutor.email if self.tutor else "N/A (tutor deleted)"
        return f"Slot for {tutor_display}: {self.start_time.strftime('%Y-%m-%d %H:%M')} - {self.end_time.strftime('%H:%M')}"

    class Meta:
        ordering = ['start_time']
        verbose_name = 'Time Slot'
        verbose_name_plural = 'Time Slots'
        constraints = [
            models.CheckConstraint(check=models.Q(end_time__gt=models.F('start_time')), name='end_time_after_start_time_slot_new')
        ]

class Meeting(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        CANCELED = 'canceled', 'Canceled'
        COMPLETED = 'completed', 'Completed'

    class Platform(models.TextChoices):
        DISCORD = 'discord', 'Discord'
        GOOGLE_MEET = 'google_meet', 'Google Meet'

    student = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='student_meetings',
        null=True,
        blank=True,
        limit_choices_to=Q(user_type=User.UserType.STUDENT) | Q(user_type=User.UserType.VIP)
    )
    tutor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True, 
        related_name='tutor_meetings',
        limit_choices_to= Q(user_type=User.UserType.ADMIN)
    )
    time_slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.PROTECT, 
        related_name='meetings'
    )
    subject = models.CharField(max_length=100)
    notes = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    platform = models.CharField(max_length=20, choices=Platform.choices, default=Platform.DISCORD)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        student_display = self.student.email if self.student else "N/A"
        tutor_display = self.tutor.email if self.tutor else (self.time_slot.tutor.email if self.time_slot and self.time_slot.tutor else "N/A")
        return f"Meeting: {self.subject} (Tutor: {tutor_display}, Student: {student_display})"

    class Meta:
        ordering = ['-time_slot__start_time']
        verbose_name = 'Meeting'
        verbose_name_plural = 'Meetings'


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NEW_RESERVATION = 'new_reservation', 'New Reservation'
        RESERVATION_CONFIRMED = 'reservation_confirmed', 'Reservation Confirmed'
        RESERVATION_CANCELED = 'reservation_canceled', 'Reservation Canceled'
        REMINDER = 'reminder', 'Reminder'
        SYSTEM = 'system', 'System'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    meeting = models.ForeignKey(Meeting, on_delete=models.SET_NULL, related_name='notifications', null=True, blank=True)
    title = models.CharField(max_length=100)
    message = models.TextField()
    type = models.CharField(max_length=50, choices=NotificationType.choices)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        user_identifier = self.user.email
        return f"Notification for {user_identifier}: {self.title}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'


class DailyActivitySummary(models.Model):
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_summaries', limit_choices_to=Q(user_type=User.UserType.ADMIN))
    date = models.DateField()
    has_available_slots = models.BooleanField(default=False)
    has_booked_slots = models.BooleanField(default=False)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('tutor', 'date') 
        ordering = ['date']
        verbose_name = "Podsumowanie Aktywności Dziennej"
        verbose_name_plural = "Podsumowania Aktywności Dziennych"

    def __str__(self):
        return f"Podsumowanie dla {self.tutor.email} na dzień {self.date}"