# api/management/commands/create_initial_superuser.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
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

        defaults = {
            'username': superuser_username,
            'first_name': superuser_first_name,
            'last_name': superuser_last_name,
            'is_staff': True,
            'is_superuser': True,
        }


        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=superuser_email,
                defaults={**defaults, 'password': superuser_password}
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Creating superuser {superuser_username} ({superuser_email})'))
                user.set_password(superuser_password)
                user.save()
            else:
                updated_fields = []
                for field, value in defaults.items():
                    if getattr(user, field) != value and value is not None:
                        setattr(user, field, value)
                        updated_fields.append(field)

                if not user.check_password(superuser_password):
                    user.set_password(superuser_password)
                    updated_fields.append('password')

                if updated_fields:
                    user.save(update_fields=list(set(updated_fields)))
                    self.stdout.write(self.style.WARNING('Updated existing superuser credentials to match environment variables.'))
                else:
                    self.stdout.write(self.style.WARNING('Superuser already exists with matching credentials.'))