#!/usr/bin/env python
"""
Initialization script to create default Terms of Service entry.
This runs automatically when the backend container starts.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'site_project.settings')
django.setup()

from django.core.files import File
from api.models import TermsOfService

def init_terms_of_service():
    """Create the default ToS entry if it doesn't exist."""
    tos_version = '1.0'
    tos_file_path = 'media/terms/terms_of_service_v1.pdf'
    
    # Check if ToS v1.0 already exists
    if TermsOfService.objects.filter(version=tos_version).exists():
        tos = TermsOfService.objects.get(version=tos_version)
        # Check if file is attached
        if not tos.file:
            print(f"ToS v{tos_version} exists but has no file. Attaching file...")
            if os.path.exists(tos_file_path):
                with open(tos_file_path, 'rb') as f:
                    tos.file.save('terms_of_service_v1.pdf', File(f))
                print(f"✓ File attached to ToS v{tos_version}")
            else:
                print(f"✗ ToS file not found at {tos_file_path}")
        else:
            print(f"✓ ToS v{tos_version} already exists with file")
        return
    
    # Create new ToS entry
    print(f"Creating ToS v{tos_version}...")
    if not os.path.exists(tos_file_path):
        print(f"✗ ToS file not found at {tos_file_path}")
        print("  Creating ToS entry without file (file can be added via admin)")
        tos = TermsOfService.objects.create(version=tos_version)
        print(f"✓ Created ToS v{tos_version} (ID: {tos.id})")
        return
    
    tos = TermsOfService.objects.create(version=tos_version)
    with open(tos_file_path, 'rb') as f:
        tos.file.save('terms_of_service_v1.pdf', File(f))
    print(f"✓ Created ToS v{tos_version} with file (ID: {tos.id})")

if __name__ == '__main__':
    try:
        init_terms_of_service()
    except Exception as e:
        print(f"✗ Error initializing ToS: {e}")
        # Don't fail the container startup if ToS initialization fails
        pass
