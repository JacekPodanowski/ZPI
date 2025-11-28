from django.core.management.base import BaseCommand
from api.models import LegalDocument
from django.conf import settings
import os


# Mapping of document types to their source files
DOCUMENT_FILES = {
    'terms': 'REGULAMIN.md',
    'policy': 'POLITYKA_PRYWATNOSCI.md',
    'guide': 'PORADNIK.md',
}

DOCUMENT_DEFAULTS = {
    'terms': "# Regulamin\n\nRegulamin serwisu będzie dostępny wkrótce.",
    'policy': "# Polityka Prywatności\n\nPolityka prywatności będzie dostępna wkrótce.",
    'guide': "# Poradnik\n\nPoradnik będzie dostępny wkrótce.",
}


class Command(BaseCommand):
    help = 'Loads the initial legal documents (Terms, Policy, Guide) from markdown files if none exist'

    def handle(self, *args, **options):
        for doc_type, filename in DOCUMENT_FILES.items():
            self._load_document(doc_type, filename)

    def _load_document(self, doc_type, filename):
        """Load a single document type if it doesn't exist."""
        # Check if this document type already exists
        if LegalDocument.objects.filter(document_type=doc_type).exists():
            self.stdout.write(self.style.WARNING(
                f'{doc_type.upper()} document already exists. Skipping.'
            ))
            return

        # Path to the document file
        doc_file_path = os.path.join(settings.BASE_DIR, 'legal', filename)
        
        try:
            if os.path.exists(doc_file_path):
                with open(doc_file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if not content.strip():
                    content = DOCUMENT_DEFAULTS[doc_type]
                    self.stdout.write(self.style.WARNING(
                        f'{filename} file is empty. Using placeholder.'
                    ))
            else:
                content = DOCUMENT_DEFAULTS[doc_type]
                self.stdout.write(self.style.WARNING(
                    f'{filename} not found. Using placeholder.'
                ))
            
            # Create the initial document
            doc = LegalDocument.objects.create(
                document_type=doc_type,
                version='1.0',
                content_md=content
            )
            
            self.stdout.write(self.style.SUCCESS(
                f'Successfully created initial {doc_type.upper()} document v{doc.version}'
            ))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f'Error loading {doc_type}: {str(e)}'
            ))
