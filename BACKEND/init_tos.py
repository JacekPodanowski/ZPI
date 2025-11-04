#!/usr/bin/env python
"""
Initialization script to create default Terms of Service entry.
This runs automatically when the backend container starts.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'site_project.settings')
django.setup()

from api.models import TermsOfService

def init_terms_of_service():
    """Create the default ToS entry if it doesn't exist."""
    tos_version = '1.0'
    
    # Check if ToS v1.0 already exists
    if TermsOfService.objects.filter(version=tos_version).exists():
        print(f"✓ ToS v{tos_version} already exists.")
        return
    
    # Create new ToS entry
    print(f"Creating ToS v{tos_version}...")
    tos = TermsOfService.objects.create(version=tos_version)
    print(f"✓ Created ToS v{tos_version} (ID: {tos.id})")

if __name__ == '__main__':
    try:
        init_terms_of_service()
    except Exception as e:
        print(f"✗ Error initializing ToS: {e}")
        pass
