from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from notifications.models import Notification

class Command(BaseCommand):
    help = 'Deletes achievement notifications older than 30 days.'

    def handle(self, *args, **options):
        thirty_days_ago = timezone.now() - timedelta(days=30)
        old_achievements = Notification.objects.filter(
            notification_type='achievement',
            created_at__lt=thirty_days_ago
        )
        count = old_achievements.count()
        old_achievements.delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} old achievement notifications.'))
