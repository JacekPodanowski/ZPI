# api/management/commands/create_initial_superuser.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a superuser if none exist, using environment variables for credentials.'

    def handle(self, *args, **options):
        superuser_email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        superuser_username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        superuser_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        superuser_first_name = os.environ.get('DJANGO_SUPERUSER_FIRST_NAME', '')
        superuser_last_name = os.environ.get('DJANGO_SUPERUSER_LAST_NAME', '')

        if not all([superuser_email, superuser_username, superuser_password]):
            self.stdout.write(self.style.ERROR('Missing superuser environment variables (EMAIL, USERNAME, PASSWORD). Superuser not created.'))
            return

        if not User.objects.filter(email=superuser_email).exists() and not User.objects.filter(username=superuser_username).exists():
            self.stdout.write(self.style.SUCCESS(f'Creating superuser {superuser_username} ({superuser_email})'))
            try:
                User.objects.create_superuser(
                    email=superuser_email,
                    username=superuser_username,
                    password=superuser_password,
                    first_name=superuser_first_name,
                    last_name=superuser_last_name
                )
                self.stdout.write(self.style.SUCCESS('Superuser created successfully.'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error creating superuser: {e}'))
        else:
            self.stdout.write(self.style.WARNING(f'Superuser with email {superuser_email} or username {superuser_username} already exists. Skipped creation.'))