"""Utilities for processing uploaded media files."""

from __future__ import annotations

import io
import logging
from typing import Tuple

from PIL import Image, ImageOps, UnidentifiedImageError

logger = logging.getLogger(__name__)


class ImageProcessingError(RuntimeError):
    """Raised when an uploaded asset cannot be processed as an image."""


def _resample_filter() -> int:
    resampling = getattr(Image, 'Resampling', None)
    if resampling is not None:
        return resampling.LANCZOS
    return Image.LANCZOS  # type: ignore[attr-defined]


def convert_to_webp(
    source_bytes: bytes,
    *,
    max_dimensions: Tuple[int, int],
    quality: int,
) -> Tuple[bytes, str]:
    """Convert image bytes to WebP respecting target dimensions and quality."""
    try:
        with Image.open(io.BytesIO(source_bytes)) as original:
            image = ImageOps.exif_transpose(original)
            if image.mode not in ('RGB', 'RGBA'):
                image = image.convert('RGB')
            else:
                image = image.convert('RGB')

            image.thumbnail(max_dimensions, _resample_filter())
            buffer = io.BytesIO()
            image.save(buffer, format='WEBP', quality=quality, method=6)
            buffer.seek(0)
            return buffer.read(), 'image/webp'
    except UnidentifiedImageError as exc:  # pragma: no cover - pillow specific
        logger.exception("Failed to identify uploaded image")
        raise ImageProcessingError("Uploaded file is not a valid image") from exc
    except OSError as exc:  # pragma: no cover - pillow specific
        logger.exception("Failed to process uploaded image")
        raise ImageProcessingError("Unable to process the provided image") from exc
