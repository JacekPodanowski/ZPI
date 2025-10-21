"""Helpers for managing uploaded media assets."""

from __future__ import annotations

import logging
from typing import Optional
from urllib.parse import urlparse

from django.conf import settings
from django.core.files.storage import default_storage

from .models import MediaAsset

logger = logging.getLogger(__name__)


def normalize_media_path(file_url: str) -> Optional[str]:
    """Translate a user-provided media URL into a storage-relative path."""
    trimmed = (file_url or '').strip()
    if not trimmed:
        return None

    parsed = urlparse(trimmed)
    path = parsed.path or ''

    if not path and not parsed.netloc:
        path = trimmed

    if not path.startswith('/'):
        path = f'/{path}'

    media_url = getattr(settings, 'MEDIA_URL', '/media/') or '/media/'
    if path.startswith(media_url):
        relative_path = path[len(media_url):]
    else:
        relative_path = path.lstrip('/')

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

    try:
        if default_storage.exists(asset.storage_path):
            default_storage.delete(asset.storage_path)
    except Exception:  # pragma: no cover - storage backend dependent
        logger.exception("Failed to delete media file %s", asset.storage_path)
        return False

    asset.delete()
    logger.info("Removed orphaned media asset %s", asset.id)
    return True
