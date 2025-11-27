"""Celery configuration for the Personal Site Generator."""

import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_config.settings')

app = Celery('django_config')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Configure periodic tasks
app.conf.beat_schedule = {
    'send-test-notification-every-15-minutes': {
        'task': 'api.tasks.send_random_test_notification',
        'schedule': 900.0,  # 15 minutes in seconds
    },
    'sync-cloudflare-domain-status-every-10-minutes': {
        'task': 'api.tasks.sync_cloudflare_domain_status',
        'schedule': 600.0,  # 10 minutes in seconds
    },
    'cleanup-expired-domain-reservations-every-30-minutes': {
        'task': 'api.tasks.cleanup_expired_domain_reservations',
        'schedule': 1800.0,  # 30 minutes in seconds
    },
}
app.conf.timezone = 'UTC'


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery configuration."""
    print(f'Request: {self.request!r}')
