"""Management command to load ALL email templates for DEV category.

This command loads all email templates from the emails/ directory into the database
with the 'dev' category for development and testing purposes. This includes:
  - Account emails (magic link, password reset, account confirmation)
  - Team emails (team invitations)
  - Booking emails (all 4 booking templates)
  - Newsletter emails (event newsletter, confirmation)
"""
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import EmailTemplate


class Command(BaseCommand):
    help = 'Load all email templates for DEV category (development/testing only)'

    def handle(self, *args, **options):
        self.stdout.write('Loading all email templates for DEV category...')
        
        templates_to_create = [
            # Account emails
            {
                'name': '[DEV] Magic Link Login',
                'slug': 'dev-magic-link-login',
                'category': 'dev',
                'subject_pl': 'Link logowania do Twojego konta',
                'subject_en': 'Login link to your account',
                'file_path': 'emails/account/magic_link_login.html',
            },
            {
                'name': '[DEV] Password Reset',
                'slug': 'dev-password-reset-link',
                'category': 'dev',
                'subject_pl': 'Reset hasła',
                'subject_en': 'Password Reset',
                'file_path': 'emails/account/password_reset_link.html',
            },
            {
                'name': '[DEV] Account Confirmation',
                'slug': 'dev-new-account-confirmation',
                'category': 'dev',
                'subject_pl': 'Potwierdź swoje konto',
                'subject_en': 'Confirm your account',
                'file_path': 'emails/account/new_account_confirmation.html',
            },
            # Team emails
            {
                'name': '[DEV] Team Invitation (New User)',
                'slug': 'dev-team-invitation-new-user',
                'category': 'dev',
                'subject_pl': 'Zaproszenie do zespołu',
                'subject_en': 'Team Invitation',
                'file_path': 'emails/team/team_invitation_new_user.html',
            },
            {
                'name': '[DEV] Team Invitation (Existing User)',
                'slug': 'dev-team-invitation-existing-user',
                'category': 'dev',
                'subject_pl': 'Zaproszenie do zespołu',
                'subject_en': 'Team Invitation',
                'file_path': 'emails/team/team_invitation_existing_user.html',
            },
            # Booking emails
            {
                'name': '[DEV] Booking Confirmation (to Client)',
                'slug': 'dev-booking-confirmation-to-client',
                'category': 'dev',
                'subject_pl': '✓ Rezerwacja potwierdzona',
                'subject_en': '✓ Booking Confirmed',
                'file_path': 'emails/booking/booking_confirmation_to_client.html',
            },
            {
                'name': '[DEV] Booking Confirmation (to Creator)',
                'slug': 'dev-booking-confirmation-to-creator',
                'category': 'dev',
                'subject_pl': 'Nowa rezerwacja',
                'subject_en': 'New Booking',
                'file_path': 'emails/booking/booking_confirmation_to_creator.html',
            },
            {
                'name': '[DEV] Booking Cancelled by Client',
                'slug': 'dev-booking-cancelled-by-client',
                'category': 'dev',
                'subject_pl': 'Rezerwacja anulowana',
                'subject_en': 'Booking Cancelled',
                'file_path': 'emails/booking/booking_cancelled_by_client.html',
            },
            {
                'name': '[DEV] Booking Cancelled by Creator',
                'slug': 'dev-booking-cancelled-by-creator',
                'category': 'dev',
                'subject_pl': 'Sesja została odwołana',
                'subject_en': 'Session Cancelled',
                'file_path': 'emails/booking/booking_cancelled_by_creator.html',
            },
            # Newsletter emails
            {
                'name': '[DEV] Event Newsletter',
                'slug': 'dev-event-newsletter',
                'category': 'dev',
                'subject_pl': 'Newsletter - Nadchodzące wydarzenia',
                'subject_en': 'Newsletter - Upcoming Events',
                'file_path': 'emails/newsletter/event_newsletter.html',
            },
            {
                'name': '[DEV] Newsletter Confirmation',
                'slug': 'dev-newsletter-confirmation',
                'category': 'dev',
                'subject_pl': 'Potwierdzenie subskrypcji newslettera',
                'subject_en': 'Newsletter Subscription Confirmation',
                'file_path': 'emails/newsletter/newsletter_confirmation.html',
            },
        ]
        
        created_count = 0
        updated_count = 0
        
        for template_data in templates_to_create:
            # Check if template already exists
            existing = EmailTemplate.objects.filter(slug=template_data['slug']).first()
            
            # Read template file
            file_path = os.path.join(settings.BASE_DIR, template_data['file_path'])
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if existing:
                    # Update existing template
                    existing.name = template_data['name']
                    existing.category = template_data['category']
                    existing.subject_pl = template_data['subject_pl']
                    existing.subject_en = template_data['subject_en']
                    existing.content_pl = content
                    existing.content_en = content
                    existing.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'↻ Updated template: {template_data["name"]}')
                    )
                else:
                    # Create new template
                    EmailTemplate.objects.create(
                        name=template_data['name'],
                        slug=template_data['slug'],
                        category=template_data['category'],
                        subject_pl=template_data['subject_pl'],
                        subject_en=template_data['subject_en'],
                        content_pl=content,
                        content_en=content,
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
                    self.style.ERROR(f'✗ Error processing template {template_data["slug"]}: {str(e)}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'\nCompleted! Created {created_count}, Updated {updated_count} DEV email templates.')
        )
