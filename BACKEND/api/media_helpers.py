"""Helpers for managing uploaded media assets."""

from __future__ import annotations

import logging
from typing import Optional
from urllib.parse import urlparse

from django.conf import settings

from .media_storage import get_media_storage
from .models import MediaAsset

logger = logging.getLogger(__name__)


def normalize_media_path(file_url: str) -> Optional[str]:
    """Translate a user-provided media URL into a storage-relative path."""
    trimmed = (file_url or '').strip()
    if not trimmed:
        return None

    parsed = urlparse(trimmed)
    candidate = parsed.path if parsed.scheme or parsed.netloc else trimmed
    candidate = candidate.replace('\\', '/').lstrip()

    prefixes = []
    media_url = getattr(settings, 'MEDIA_URL', None)
    if media_url:
        prefixes.append(media_url.rstrip('/') + '/')

    supabase_public_urls = getattr(settings, 'SUPABASE_STORAGE_PUBLIC_URLS', {}) or {}
    prefixes.extend(url.rstrip('/') + '/' for url in supabase_public_urls.values() if url)

    supabase_public_default = getattr(settings, 'SUPABASE_STORAGE_PUBLIC_URL', None)
    if supabase_public_default:
        prefixes.append(str(supabase_public_default).rstrip('/') + '/')

    for prefix in prefixes:
        if candidate.startswith(prefix):
            candidate = candidate[len(prefix):]
            break

    relative_path = candidate.lstrip('/')

    if '..' in relative_path or relative_path.startswith('/'):
        return None

    return relative_path or None


def get_asset_by_path_or_url(value: str) -> Optional[MediaAsset]:
    """Return the MediaAsset matching the provided URL or storage path."""
    if not value:
        return None

    relative_path = normalize_media_path(value)
    if relative_path:
        asset = MediaAsset.objects.filter(storage_path=relative_path).first()
        if asset:
            return asset

    return MediaAsset.objects.filter(file_url=value).first()


def is_media_asset_in_use(asset: Optional[MediaAsset]) -> bool:
    """Check whether a media asset still has any usage references."""
    if asset is None:
        return False
    return asset.usages.exists()


def cleanup_asset_if_unused(asset: Optional[MediaAsset]) -> bool:
    """Delete the physical file and record if the asset has no remaining usages."""
    if asset is None:
        return False

    if is_media_asset_in_use(asset):
        return False

    storage = get_media_storage()
    bucket = asset.storage_bucket or getattr(settings, 'SUPABASE_STORAGE_BUCKET_MAP', {}).get('other', '')

    try:
        storage.delete(bucket, asset.storage_path)
    except Exception:  # pragma: no cover - storage backend dependent
        logger.exception("Failed to delete media file %s", asset.storage_path)
        return False

    asset.delete()
    logger.info("Removed orphaned media asset %s", asset.id)
    return True
