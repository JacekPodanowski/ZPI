"""Utility helpers for the multi-tenant backend."""

from django.utils.text import slugify


def generate_site_identifier(site_id: int, name: str) -> str:
    """Combine the numeric site id with a slugified version of the name."""
    slug = slugify(name or '')
    if not slug:
        slug = 'site'
    return f"{site_id}-{slug.replace('-', '_')}"