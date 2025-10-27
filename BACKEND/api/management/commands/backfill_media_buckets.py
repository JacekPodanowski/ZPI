from __future__ import annotations

from django.core.management.base import BaseCommand
from django.conf import settings

from api.models import MediaAsset


class Command(BaseCommand):
    help = 'Backfill MediaAsset.storage_bucket for existing assets when migrating to Supabase.'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', dest='dry_run', default=False, help='Show changes but do not write them')

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        mapping = getattr(settings, 'SUPABASE_STORAGE_BUCKET_MAP', {}) or {}
        public_urls = getattr(settings, 'SUPABASE_STORAGE_PUBLIC_URLS', {}) or {}

        qs = MediaAsset.objects.filter(storage_bucket='')
        total = qs.count()
        self.stdout.write(self.style.NOTICE(f'Found {total} media assets with empty storage_bucket'))

        updated = 0
        for asset in qs.iterator():
            candidate = None
            # Prefer explicit mapping by media_type
            if asset.media_type and asset.media_type in mapping:
                candidate = mapping.get(asset.media_type)

            # Fallback: if storage_path starts with known public url bucket name
            if not candidate and asset.storage_path:
                first = asset.storage_path.lstrip('/').split('/', 1)[0]
                if first in public_urls:
                    candidate = first

            # Final fallback: use 'other' mapping
            if not candidate:
                candidate = mapping.get('other')

            if candidate:
                self.stdout.write(f'Asset id={asset.id} set storage_bucket={candidate} (was empty)')
                if not dry_run:
                    MediaAsset.objects.filter(pk=asset.pk).update(storage_bucket=candidate)
                updated += 1
            else:
                self.stdout.write(self.style.WARNING(f'Asset id={asset.id} no candidate bucket found; skipped'))

        self.stdout.write(self.style.SUCCESS(f'Done. Updated {updated} of {total} assets.'))
