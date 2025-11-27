# api/management/commands/create_default_site.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
import json
import os
from datetime import datetime, timedelta
from pathlib import Path

from api.models import Site, AvailabilityBlock, Event
from api.signals import suppress_signal_logging

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates the default showcase site (Pokazowa) with ID=1 for the superuser.'

    def handle(self, *args, **options):
        user_email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        if not user_email:
            self.stdout.write(self.style.ERROR('DJANGO_SUPERUSER_EMAIL environment variable not set. Cannot create default site.'))
            return

        try:
            admin_user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Superuser with email {user_email} not found.'))
            return

        # Load YourEasySite Demo configuration
        current_dir = Path(__file__).parent
        json_path = current_dir / 'YourEasySite_Demo.json'
        
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                template_config = json.load(f)
                self.stdout.write(self.style.SUCCESS(f'Loaded config from YourEasySite_Demo.json'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'JSON file not found: {json_path}'))
            return
        except json.JSONDecodeError as e:
            self.stdout.write(self.style.ERROR(f'Invalid JSON in YourEasySite_Demo.json: {e}'))
            return

        with transaction.atomic(), suppress_signal_logging():
            # Force delete existing showcase site if it exists (bypass API protection)
            # This is allowed for management commands but protected at API level
            Site.objects.filter(id=1).delete()
            self.stdout.write(self.style.SUCCESS('Cleared existing showcase site (ID=1)'))
            
            # Create fresh showcase site with ID=1
            site = Site.objects.create(
                id=1,
                owner=admin_user,
                name='Pokazowa',
                template_config=template_config,
                color_index=0,
                team_size=1,
                is_mock=True  # Mark as mock for development/demo purposes
            )
            self.stdout.write(self.style.SUCCESS(f'Created showcase site "Pokazowa" (ID=1)'))
            
            self.stdout.write(self.style.SUCCESS(f'Showcase site "Pokazowa" is ready. This is our professional demo site.'))
