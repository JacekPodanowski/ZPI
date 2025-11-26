"""
Shared constants loaded from SHARED_SETTINGS folder.
This ensures backend and frontend use the same configuration.
"""

import json
import os
from pathlib import Path
from typing import Dict, Any

# Path to shared settings folder
SHARED_SETTINGS_PATH = Path(__file__).resolve().parent.parent.parent / "SHARED_SETTINGS"


def load_json_file(filename: str) -> Dict[str, Any]:
    """Load and parse a JSON/JS file from SHARED_SETTINGS."""
    file_path = SHARED_SETTINGS_PATH / filename
    
    if not file_path.exists():
        raise FileNotFoundError(f"Shared settings file not found: {file_path}")
    
    content = file_path.read_text(encoding='utf-8')
    
    # Remove JavaScript comments (// and /* */)
    import re
    # Remove single-line comments
    content = re.sub(r'//.*?$', '', content, flags=re.MULTILINE)
    # Remove multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    
    # Remove JS export syntax
    content = re.sub(r'export\s+const\s+\w+\s*=\s*', '', content)
    
    # Remove trailing semicolon and whitespace
    content = content.strip()
    if content.endswith(';'):
        content = content[:-1]
    
    # Parse as JSON
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse {filename}: {e}")


# ============================================
# SIZE LIMITS
# ============================================
try:
    _size_limits = load_json_file("sizeLimits.js")
except Exception as e:
    print(f"Warning: Could not load sizeLimits.js: {e}")
    _size_limits = {}

# Global limits
MAX_TOTAL_STORAGE_PER_USER = _size_limits.get('MAX_TOTAL_STORAGE_PER_USER', 1024 * 1024 * 1024)
MAX_PAGES_PER_USER = _size_limits.get('MAX_PAGES_PER_USER', 10)
MAX_SITE_SIZE = _size_limits.get('MAX_SITE_SIZE', 500 * 1024 * 1024)

# Photo limits (general images)
MAX_PHOTO_UPLOAD_SIZE = _size_limits.get('MAX_PHOTO_UPLOAD_SIZE', 100 * 1024 * 1024)
MAX_PHOTO_STORED_SIZE = _size_limits.get('MAX_PHOTO_STORED_SIZE', 25 * 1024 * 1024)
TARGET_PHOTO_WIDTH = _size_limits.get('TARGET_PHOTO_WIDTH', 1920)
TARGET_PHOTO_HEIGHT = _size_limits.get('TARGET_PHOTO_HEIGHT', 1080)

# Avatar limits
MAX_AVATAR_UPLOAD_SIZE = _size_limits.get('MAX_AVATAR_UPLOAD_SIZE', 25 * 1024 * 1024)
MAX_AVATAR_STORED_SIZE = _size_limits.get('MAX_AVATAR_STORED_SIZE', 5 * 1024 * 1024)
TARGET_AVATAR_SIZE = _size_limits.get('TARGET_AVATAR_SIZE', 512)

# Backend validation (safety limits)
BACKEND_MAX_IMAGE_SIZE = _size_limits.get('BACKEND_MAX_IMAGE_SIZE', 25 * 1024 * 1024)
BACKEND_MAX_AVATAR_SIZE = _size_limits.get('BACKEND_MAX_AVATAR_SIZE', 5 * 1024 * 1024)

# Video limits
MAX_VIDEO_UPLOAD_SIZE = _size_limits.get('MAX_VIDEO_UPLOAD_SIZE', 100 * 1024 * 1024)
MAX_VIDEO_DURATION = _size_limits.get('MAX_VIDEO_DURATION', 600)

# WebP conversion
WEBP_QUALITY = _size_limits.get('WEBP_QUALITY', 90)
WEBP_QUALITY_THUMBNAIL = _size_limits.get('WEBP_QUALITY_THUMBNAIL', 75)
WEBP_QUALITY_AVATAR = _size_limits.get('WEBP_QUALITY_AVATAR', 90)

# Responsive sizes
THUMBNAIL_SIZE = _size_limits.get('THUMBNAIL_SIZE', 300)
MEDIUM_SIZE = _size_limits.get('MEDIUM_SIZE', 800)
LARGE_SIZE = _size_limits.get('LARGE_SIZE', 1920)
AVATAR_SIZE = _size_limits.get('AVATAR_SIZE', 512)

# Temp storage
TEMP_STORAGE_EXPIRE = _size_limits.get('TEMP_STORAGE_EXPIRE', 24 * 60 * 60)
TEMP_STORAGE_CLEANUP_INTERVAL = _size_limits.get('TEMP_STORAGE_CLEANUP_INTERVAL', 6 * 60 * 60)
MAX_TEMP_STORAGE_PER_USER = _size_limits.get('MAX_TEMP_STORAGE_PER_USER', 100 * 1024 * 1024)

# Processing
BATCH_PROCESSING_LIMIT = _size_limits.get('BATCH_PROCESSING_LIMIT', 5)
PROCESSING_TIMEOUT = _size_limits.get('PROCESSING_TIMEOUT', 30000)

# Bandwidth
MAX_MONTHLY_BANDWIDTH_PER_USER = _size_limits.get('MAX_MONTHLY_BANDWIDTH_PER_USER', 10 * 1024 * 1024 * 1024)

# Allowed formats
ALLOWED_IMAGE_FORMATS = _size_limits.get('ALLOWED_IMAGE_FORMATS', ['jpg', 'jpeg', 'png', 'gif', 'webp'])
ALLOWED_IMAGE_MIMETYPES = tuple(_size_limits.get('ALLOWED_IMAGE_MIMETYPES', [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
]))
ALLOWED_VIDEO_FORMATS = _size_limits.get('ALLOWED_VIDEO_FORMATS', ['mp4', 'webm', 'mov'])
ALLOWED_VIDEO_MIMETYPES = tuple(_size_limits.get('ALLOWED_VIDEO_MIMETYPES', [
    'video/mp4',
    'video/webm',
    'video/quicktime'
]))


# ============================================
# TEAM ROLES & PERMISSIONS
# ============================================
try:
    _team_roles = load_json_file("teamRoles.js")
except Exception as e:
    print(f"Warning: Could not load teamRoles.js: {e}")
    _team_roles = {}

TEAM_ROLES = _team_roles

# Role definitions for easy access
ROLE_VIEWER = 'viewer'
ROLE_CONTRIBUTOR = 'contributor'
ROLE_MANAGER = 'manager'
ROLE_OWNER = 'owner'

VALID_ROLES = [ROLE_VIEWER, ROLE_CONTRIBUTOR, ROLE_MANAGER, ROLE_OWNER]


def get_role_permissions(role: str) -> Dict[str, bool]:
    """
    Get permissions dictionary for a given role.
    
    Args:
        role: Role key (viewer, contributor, manager, owner)
        
    Returns:
        Dictionary of permission flags
    """
    role_data = TEAM_ROLES.get(role, TEAM_ROLES.get('viewer', {}))
    return role_data.get('permissions', {})


def has_permission(role: str, permission: str) -> bool:
    """
    Check if a role has a specific permission.
    
    Args:
        role: Role key (viewer, contributor, manager, owner)
        permission: Permission key (e.g., 'editAnyEvent', 'manageTeam')
        
    Returns:
        True if role has permission, False otherwise
    """
    permissions = get_role_permissions(role)
    return permissions.get(permission, False)


# Permission shortcuts for common checks
def can_view_other_events(role: str) -> bool:
    return has_permission(role, 'viewOtherEvents')

def can_add_events(role: str) -> bool:
    return has_permission(role, 'addEvents')

def can_edit_own_events(role: str) -> bool:
    return has_permission(role, 'editOwnEvents')

def can_edit_any_event(role: str) -> bool:
    return has_permission(role, 'editAnyEvent')

def can_cancel_own_events(role: str) -> bool:
    return has_permission(role, 'cancelOwnEvents')

def can_manage_team_availability(role: str) -> bool:
    return has_permission(role, 'manageTeamAvailability')

def can_edit_site_content(role: str) -> bool:
    return has_permission(role, 'editSiteContent')

def can_manage_team(role: str) -> bool:
    return has_permission(role, 'manageTeam')

def can_change_roles(role: str) -> bool:
    return has_permission(role, 'changeRoles')

def can_edit_settings(role: str) -> bool:
    return has_permission(role, 'editSettings')

def can_manage_subscription(role: str) -> bool:
    return has_permission(role, 'manageSubscription')
