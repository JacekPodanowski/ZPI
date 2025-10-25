"""Storage abstraction for media assets with optional Supabase support."""

from __future__ import annotations

import logging
from dataclasses import dataclass
import os
from functools import lru_cache
from threading import Lock
from typing import Any, Optional

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import Storage, default_storage

try:  # pragma: no cover - optional dependency imported at runtime
    from supabase import Client as SupabaseClient, create_client
except Exception:  # pragma: no cover - supabase is optional
    SupabaseClient = None  # type: ignore[assignment]
    create_client = None  # type: ignore[assignment]

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
        if SupabaseClient is None or create_client is None:
            raise StorageError('Supabase client library is not installed')

        self._client = create_client(base_url, service_key)
        self._timeout = timeout  # Reserved for future per-request overrides
        self._public_urls = {bucket: url.rstrip('/') + '/' for bucket, url in public_urls.items()}
        self._known_buckets: set[str] = set()
        self._bucket_lock = Lock()

    @staticmethod
    def _response_error(response: Any) -> Optional[str]:
        error = getattr(response, 'error', None)
        if error:
            message = getattr(error, 'message', None)
            return str(message or error)
        if isinstance(response, dict):
            raw_error = response.get('error')
            if raw_error:
                return str(raw_error)
        return None

    @staticmethod
    def _response_data(response: Any) -> Any:
        if hasattr(response, 'data'):
            return getattr(response, 'data')
        if isinstance(response, dict):
            return response.get('data')
        return None

     def _ensure_bucket(self, bucket: str) -> None:
        bucket = (bucket or '').strip()
        if not bucket or bucket in self._known_buckets:
            return

        with self._bucket_lock:
            if bucket in self._known_buckets:
                return

            try:
                existing_resp = self._client.storage.list_buckets()
            except Exception as exc:  # pragma: no cover - external dependency
                logger.warning("Unable to list Supabase buckets: %s", exc)
                existing_resp = None

            if existing_resp is not None:
                data = self._response_data(existing_resp) or []
                names = {item.get('name') for item in data if isinstance(item, dict)}
                if bucket in names:
                    self._known_buckets.update(names)
                    return

            payload = {
                'name': bucket,
                'public': True,
            }

            try:
                create_resp = self._client.storage.create_bucket(bucket, payload)
            except Exception as exc:  # pragma: no cover - external dependency
                raise StorageError(f'Failed to ensure Supabase bucket `{bucket}`: {exc}') from exc

            error = self._response_error(create_resp)
            if error and 'already exists' not in error.lower():
                raise StorageError(f'Failed to create Supabase bucket `{bucket}`: {error}')

            self._known_buckets.add(bucket)


    def save(self, bucket: str, path: str, data: bytes, content_type: str) -> StorageSaveResult:
        if not bucket:
            raise StorageError('Supabase bucket must be provided')
        self._ensure_bucket(bucket)

        normalized_path = path.lstrip('/')
        file_bytes = data if isinstance(data, (bytes, bytearray)) else bytes(data)
        options = {
            'content-type': content_type or 'application/octet-stream',
            'cacheControl': '31536000',
        }

        try:
            upload_resp = self._client.storage.from_(bucket).upload(
                normalized_path,
                file_bytes,
                file_options=options,
            )
        except Exception as exc:  # pragma: no cover - external dependency
            raise StorageError(f'Failed to upload file to Supabase: {exc}') from exc

        error = self._response_error(upload_resp)
        if error:
            raise StorageError(f'Supabase upload failed: {error}')

        data_payload = self._response_data(upload_resp) or {}
        stored_path = data_payload.get('path', normalized_path)

        url = self.build_url(bucket, stored_path)
        return StorageSaveResult(bucket=bucket, path=stored_path, url=url)

    def delete(self, bucket: str, path: str) -> None:
        if not bucket:
            return
        self._ensure_bucket(bucket)
        normalized_path = path.lstrip('/')

        try:
            delete_resp = self._client.storage.from_(bucket).remove([normalized_path])
        except Exception as exc:  # pragma: no cover - external dependency
            logger.warning("Failed to delete Supabase object %s/%s: %s", bucket, normalized_path, exc)
            return

        error = self._response_error(delete_resp)
        if error:
            logger.warning("Supabase delete reported error for %s/%s: %s", bucket, normalized_path, error)

    def build_url(self, bucket: str, path: str) -> str:
        normalized_path = path.lstrip('/')
        self._ensure_bucket(bucket)

        public_url: Optional[str] = None
        try:
            public_resp = self._client.storage.from_(bucket).get_public_url(normalized_path)
            error = self._response_error(public_resp)
            if not error:
                data_payload = self._response_data(public_resp) or {}
                public_url = data_payload.get('publicUrl') or data_payload.get('publicURL')
        except Exception as exc:  # pragma: no cover - external dependency
            logger.debug("Supabase get_public_url failed for %s/%s: %s", bucket, normalized_path, exc)

        if not public_url:
            public_base = self._public_urls.get(bucket)
            if not public_base:
                raise StorageError(f"No public URL configured for bucket '{bucket}'")
            public_url = f"{public_base}{normalized_path}"
        return public_url


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