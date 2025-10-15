"""Utility helpers for the multi-tenant backend."""

from django.utils.text import slugify


def _normalize_owner_segment(first_name: str | None, last_name: str | None) -> str:
    """Create a CamelCase owner segment limited to alphanumeric characters."""
    first = (first_name or '').strip().title()
    last = (last_name or '').strip().title()
    combined = f"{first}{last}"
    alphanumeric = ''.join(ch for ch in combined if ch.isalnum())
    return alphanumeric or 'Owner'


def generate_site_identifier(site_id: int, name: str, owner_first_name: str | None, owner_last_name: str | None) -> str:
    """Return identifier in format `<id>-<site-slug>-<OwnerName>`."""
    slug = slugify(name or '') or 'site'
    owner_segment = _normalize_owner_segment(owner_first_name, owner_last_name)
    identifier = f"{site_id}-{slug}-{owner_segment}"
    # Ensure identifier fits within field limit
    return identifier[:255]