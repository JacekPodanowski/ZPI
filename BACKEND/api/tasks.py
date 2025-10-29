"""Celery tasks for asynchronous media processing."""

import hashlib
import logging
from celery import shared_task
from django.conf import settings

from .media_processing import convert_to_webp, ImageProcessingError
from .media_storage import get_media_storage, StorageError
from .models import MediaAsset

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_image_async(self, image_bytes: bytes, file_hash: str, original_filename: str, usage: str):
    """
    Asynchronously process an uploaded image:
    1. Convert to WebP format
    2. Upload to Supabase Storage
    3. Update MediaAsset record with final URL
    
    Args:
        self: Celery task instance (bound task)
        image_bytes: Raw image bytes
        file_hash: SHA256 hash of the file for deduplication
        original_filename: Original filename for reference
        usage: Usage type (e.g., 'site_content', 'avatar')
    
    Returns:
        dict: Processing result with status and URL
    """
    try:
        logger.info(f"[Celery] Starting image processing for {original_filename} (hash: {file_hash[:16]}...)")
        
        # Determine quality based on usage
        quality = (
            settings.MEDIA_WEBP_QUALITY_AVATAR
            if usage == 'avatar'
            else settings.MEDIA_WEBP_QUALITY_DEFAULT
        )
        
        # Convert to WebP
        try:
            converted_bytes, converted_mime = convert_to_webp(
                image_bytes,
                max_dimensions=settings.MEDIA_IMAGE_MAX_DIMENSIONS,
                quality=quality,
            )
            logger.info(f"[Celery] Converted image to WebP. Size: {len(converted_bytes)} bytes")
        except ImageProcessingError as e:
            logger.error(f"[Celery] Image conversion failed: {e}")
            raise self.retry(exc=e)
        
        # Check final size
        if len(converted_bytes) > settings.MEDIA_IMAGE_MAX_FINAL_BYTES:
            error_msg = f"Optimized image exceeds size limit: {len(converted_bytes)} > {settings.MEDIA_IMAGE_MAX_FINAL_BYTES}"
            logger.error(f"[Celery] {error_msg}")
            raise ValueError(error_msg)
        
        # Get storage backend
        storage = get_media_storage()
        bucket_name = settings.SUPABASE_STORAGE_BUCKET_MAP.get('image') or settings.SUPABASE_STORAGE_BUCKET_DEFAULT
        
        # Upload to storage
        storage_key = f"images/{file_hash}.webp"
        try:
            storage_result = storage.save(bucket_name, storage_key, converted_bytes, converted_mime)
            logger.info(f"[Celery] Uploaded to storage: {storage_result.url}")
        except StorageError as e:
            logger.error(f"[Celery] Storage upload failed: {e}")
            raise self.retry(exc=e)
        
        # Update MediaAsset record if it exists
        asset = MediaAsset.objects.filter(file_hash=file_hash).first()
        if asset:
            asset.storage_path = storage_result.path
            asset.file_url = storage_result.url
            asset.file_size = len(converted_bytes)
            asset.storage_bucket = bucket_name
            asset.save(update_fields=['storage_path', 'file_url', 'file_size', 'storage_bucket'])
            logger.info(f"[Celery] Updated MediaAsset {asset.id}")
        
        return {
            'status': 'success',
            'hash': file_hash,
            'url': storage_result.url,
            'size': len(converted_bytes),
            'bucket': bucket_name,
        }
        
    except Exception as exc:
        logger.exception(f"[Celery] Unexpected error processing image: {exc}")
        # Retry up to max_retries times
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def cleanup_unused_media(self, older_than_hours: int = 24):
    """
    Clean up orphaned media files that are no longer referenced.
    
    Args:
        self: Celery task instance
        older_than_hours: Only clean up files older than this many hours
    
    Returns:
        dict: Cleanup statistics
    """
    from django.utils import timezone
    from datetime import timedelta
    from .media_helpers import cleanup_asset_if_unused
    
    try:
        logger.info(f"[Celery] Starting media cleanup (older than {older_than_hours}h)")
        
        cutoff_time = timezone.now() - timedelta(hours=older_than_hours)
        orphaned_assets = MediaAsset.objects.filter(
            created_at__lt=cutoff_time,
            usage_records__isnull=True
        )
        
        removed_count = 0
        failed_count = 0
        
        for asset in orphaned_assets:
            try:
                if cleanup_asset_if_unused(asset):
                    removed_count += 1
                    logger.debug(f"[Celery] Removed orphaned asset {asset.id}")
            except Exception as e:
                failed_count += 1
                logger.warning(f"[Celery] Failed to remove asset {asset.id}: {e}")
        
        result = {
            'status': 'success',
            'removed': removed_count,
            'failed': failed_count,
            'checked': orphaned_assets.count(),
        }
        logger.info(f"[Celery] Cleanup complete: {result}")
        return result
        
    except Exception as exc:
        logger.exception(f"[Celery] Media cleanup failed: {exc}")
        raise self.retry(exc=exc)
