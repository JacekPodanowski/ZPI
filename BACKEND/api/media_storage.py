"""Storage abstraction for media assets with optional Supabase support."""

from __future__ import annotations

import logging
from dataclasses import dataclass
import os
from functools import lru_cache
from typing import Optional

import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage, default_storage

logger = logging.getLogger(__name__)


class StorageError(RuntimeError):
    """Raised when a storage backend operation fails."""


@dataclass(frozen=True)
class StorageSaveResult:
    bucket: str
    path: str
    url: str


class BaseStorageProvider:
    """Minimal interface for storage backends."""

    def save(self, bucket: str, path: str, data: bytes, content_type: str) -> StorageSaveResult:
        raise NotImplementedError

    def delete(self, bucket: str, path: str) -> None:
        raise NotImplementedError

    def build_url(self, bucket: str, path: str) -> str:
        raise NotImplementedError


class DjangoStorageProvider(BaseStorageProvider):
    """Fallback storage provider backed by Django's default storage."""

    def __init__(self, storage: Storage) -> None:
        self._storage = storage

    def save(self, bucket: str, path: str, data: bytes, content_type: str) -> StorageSaveResult:
        relative_path = path.lstrip('/')
        combined_path = os.path.join(bucket, relative_path) if bucket else relative_path
        content = ContentFile(data)
        saved_path = self._storage.save(combined_path, content)
        return StorageSaveResult(bucket=bucket or '', path=saved_path, url=self._storage.url(saved_path))

    def delete(self, bucket: str, path: str) -> None:
        stored_path = path
        if bucket and not path.startswith(bucket):
            stored_path = os.path.join(bucket, path)
        if self._storage.exists(stored_path):
            self._storage.delete(stored_path)

    def build_url(self, bucket: str, path: str) -> str:
        stored_path = path
        if bucket and not path.startswith(bucket):
            stored_path = os.path.join(bucket, path)
        return self._storage.url(stored_path)


class SupabaseStorageProvider(BaseStorageProvider):
    """Storage provider that persists files in Supabase Storage."""

    def __init__(
        self,
        *,
        base_url: str,
        service_key: str,
        timeout: int,
        public_urls: dict[str, str],
    ) -> None:
        self._base_url = base_url.rstrip('/')
        self._service_key = service_key
        self._timeout = timeout
        self._public_urls = {bucket: url.rstrip('/') + '/' for bucket, url in public_urls.items()}

    def _auth_headers(self, content_type: Optional[str] = None) -> dict[str, str]:
        headers: dict[str, str] = {
            'Authorization': f'Bearer {self._service_key}',
            'apikey': self._service_key,
            'Accept': 'application/json',
        }
        if content_type:
            headers['Content-Type'] = content_type
        return headers

    def save(self, bucket: str, path: str, data: bytes, content_type: str) -> StorageSaveResult:
        if not bucket:
            raise StorageError('Supabase bucket must be provided')
        content_type = content_type or 'application/octet-stream'
        normalized_path = path.lstrip('/')
        endpoint = f"{self._base_url}/storage/v1/object/{bucket}/{normalized_path}"
        headers = self._auth_headers(content_type)
        headers['x-upsert'] = 'false'
        headers['x-cache-control'] = 'public, max-age=31536000'
        headers['Content-Length'] = str(len(data))

        response = requests.post(
            endpoint,
            headers=headers,
            data=data,
            timeout=self._timeout,
        )
        if response.status_code not in (200, 201):
            logger.error(
                "Supabase upload failed for path %s with status %s: %s",
                normalized_path,
                response.status_code,
                response.text,
            )
            raise StorageError(f"Supabase upload failed with status {response.status_code}")

        return StorageSaveResult(bucket=bucket, path=normalized_path, url=self.build_url(bucket, normalized_path))

    def delete(self, bucket: str, path: str) -> None:
        if not bucket:
            return
        endpoint = f"{self._base_url}/storage/v1/object/{bucket}"
        headers = self._auth_headers('application/json')
        normalized_path = path.lstrip('/')
        payload = {'prefixes': [normalized_path]}
        response = requests.delete(endpoint, headers=headers, json=payload, timeout=self._timeout)
        if response.status_code not in (200, 204):
            logger.warning(
                "Supabase delete returned status %s for %s: %s",
                response.status_code,
                normalized_path,
                response.text,
            )

    def build_url(self, bucket: str, path: str) -> str:
        normalized_path = path.lstrip('/')
        public_base = self._public_urls.get(bucket)
        if not public_base:
            raise StorageError(f"No public URL configured for bucket '{bucket}'")
        return f"{public_base}{normalized_path}".replace('//', '/')


@lru_cache(maxsize=1)
def get_media_storage() -> BaseStorageProvider:
    """Return the configured storage provider, defaulting to Django storage."""
    if (
        settings.SUPABASE_URL
        and settings.SUPABASE_SERVICE_ROLE_KEY
        and settings.SUPABASE_STORAGE_PUBLIC_URLS
    ):
        logger.info("Using Supabase storage backend for media assets")
        return SupabaseStorageProvider(
            base_url=settings.SUPABASE_URL,
            service_key=settings.SUPABASE_SERVICE_ROLE_KEY,
            public_urls=settings.SUPABASE_STORAGE_PUBLIC_URLS,
            timeout=settings.MEDIA_STORAGE_TIMEOUT,
        )

    logger.info("Falling back to Django default storage backend for media assets")
    return DjangoStorageProvider(default_storage)