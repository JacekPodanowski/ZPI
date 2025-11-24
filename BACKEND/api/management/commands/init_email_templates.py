"""Management command to initialize default email templates in database.

This command loads ONLY client-facing booking email templates into the database
for use in the Email Editor. These are the templates that site creators can customize:
  - Booking Confirmation (sent to clients when a booking is confirmed)
  - Booking Cancellation (sent to clients when creator cancels)

Other email templates (account emails, team invitations, newsletters, creator-facing notifications)
are not stored in the database - they are used directly via render_to_string() from the emails/ directory.
"""
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import EmailTemplate


class Command(BaseCommand):
    help = 'Initialize client-facing booking email templates for the Email Editor (only templates users can customize)'

    def handle(self, *args, **options):
        self.stdout.write('Initializing default email templates...')
        
        templates_to_create = [
            {
                'name': 'Potwierdzenie rezerwacji',
                'slug': 'booking-confirmation-to-client-default',
                'category': 'booking_confirmation',
                'subject_pl': '✓ Rezerwacja potwierdzona',
                'subject_en': '✓ Booking Confirmed',
                'file_path': 'emails/booking/booking_confirmation_to_client.html',
            },
            {
                'name': 'Odwołanie rezerwacji',
                'slug': 'booking-cancelled-by-creator-default',
                'category': 'session_cancelled_by_creator',
                'subject_pl': 'Sesja została odwołana',
                'subject_en': 'Session Cancelled',
                'file_path': 'emails/booking/booking_cancelled_by_creator.html',
            },
        ]
        
        created_count = 0
        for template_data in templates_to_create:
            # Check if template already exists
            if EmailTemplate.objects.filter(slug=template_data['slug']).exists():
                self.stdout.write(
                    self.style.WARNING(f'Template {template_data["slug"]} already exists, skipping...')
                )
                continue
            
            # Read template file
            file_path = os.path.join(settings.BASE_DIR, template_data['file_path'])
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Create template
                EmailTemplate.objects.create(
                    name=template_data['name'],
                    slug=template_data['slug'],
                    category=template_data['category'],
                    subject_pl=template_data['subject_pl'],
                    subject_en=template_data['subject_en'],
                    content_pl=content,
                    content_en=content,  # Using same content for both languages for now
                    is_default=True,
                    owner=None
                )
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created template: {template_data["name"]}')
                )
            except FileNotFoundError:
                self.stdout.write(
                    self.style.ERROR(f'✗ Template file not found: {file_path}')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error creating template {template_data["slug"]}: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nCompleted! Created {created_count} default email templates.')
        )
