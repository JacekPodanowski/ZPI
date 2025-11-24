from django.core.management.base import BaseCommand
from api.models import TermsOfService
from django.conf import settings
import os


class Command(BaseCommand):
    help = 'Loads the initial Terms of Service from REGULAMIN.md file if none exist'

    def handle(self, *args, **options):
        # Check if any terms already exist
        if TermsOfService.objects.exists():
            self.stdout.write(self.style.WARNING('Terms of Service already exist. Skipping initialization.'))
            return

        # Path to the REGULAMIN.md file
        terms_file_path = os.path.join(settings.BASE_DIR, 'media', 'terms', 'REGULAMIN.md')
        
        if not os.path.exists(terms_file_path):
            self.stdout.write(self.style.ERROR(f'REGULAMIN.md file not found at {terms_file_path}'))
            return

        try:
            with open(terms_file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if not content.strip():
                self.stdout.write(self.style.WARNING('REGULAMIN.md file is empty. Creating placeholder terms.'))
                content = "# Regulamin\n\nRegulamin serwisu będzie dostępny wkrótce."
            
            # Create the initial terms
            terms = TermsOfService.objects.create(
                version='1.0',
                content_md=content
            )
            
            self.stdout.write(self.style.SUCCESS(f'Successfully created initial Terms of Service v{terms.version}'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error loading terms: {str(e)}'))
