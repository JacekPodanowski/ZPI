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
    """
    Generate unique site identifier in format `<id>-<site-slug>`.
    
    ID RANGE CONVENTION:
    - ID 1: Reserved for "YourEasySite Demo" (identifier: 1-youreasysite-demo)
    - IDs 2-99: Mock/demo sites (e.g., 2-pracownia-jogi, 3-studio-oddechu)
    - IDs 100+: Real user sites (e.g., 100-wellness-studio, 101-yoga-center)
    
    No obfuscation needed - the ID itself indicates site type.
    """
    slug = slugify(name or '') or 'site'
    identifier = f"{site_id}-{slug}"
    # Ensure identifier fits within field limit
    return identifier[:255]


# Avatar color generation for TeamMembers and PlatformUsers
AVATAR_COLOR_PALETTE = [
    '#FF6B9D',  # różowy
    '#C44569',  # bordowy
    '#FEA47F',  # pomarańczowy
    '#F8B500',  # żółty
    '#3DC1D3',  # turkusowy
    '#778BEB',  # niebieski
    '#786FA6',  # fioletowy
    '#63CDDA',  # jasny niebieski
    '#EA8685',  # łososiowy
    '#F8D49D',  # beżowy
]


def get_avatar_color(name: str) -> str:
    """
    Generate a deterministic avatar background color based on name.
    
    Args:
        name: Full name or identifier to generate color from
        
    Returns:
        Hex color code from the predefined palette
    """
    if not name:
        return AVATAR_COLOR_PALETTE[0]
    
    ascii_sum = sum(ord(char) for char in name)
    color_index = ascii_sum % len(AVATAR_COLOR_PALETTE)
    return AVATAR_COLOR_PALETTE[color_index]


def get_avatar_letter(first_name: str | None, email: str | None = None) -> str:
    """
    Get the first letter for avatar display.
    
    Args:
        first_name: User's first name
        email: Fallback email if first_name is not available
        
    Returns:
        Single uppercase letter for avatar display
    """
    if first_name and first_name.strip():
        return first_name.strip()[0].upper()
    elif email and email.strip():
        return email.strip()[0].upper()
    return '?'