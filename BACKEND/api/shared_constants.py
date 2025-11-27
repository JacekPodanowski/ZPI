"""
Shared constants loaded from local api/shared folder.
This ensures backend and frontend use the same configuration.

⚠️  The files in api/shared/ are auto-generated!
Edit the source files in SHARED_SETTINGS/ and run: SHARED_SETTINGS\\sync.bat
"""

import json
import os
from pathlib import Path
from typing import Dict, Any

# Path to local shared folder (inside api/)
SHARED_SETTINGS_PATH = Path(__file__).resolve().parent / "shared"


def load_json_file(filename: str) -> Dict[str, Any]:
    """Load and parse a JSON file from the shared folder."""
    file_path = SHARED_SETTINGS_PATH / filename
    
    if not file_path.exists():
        raise FileNotFoundError(f"Shared settings file not found: {file_path}")
    
    content = file_path.read_text(encoding='utf-8')
    
    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse {filename}: {e}")


# ============================================
# SIZE LIMITS
# ============================================
try:
    _size_limits = load_json_file("sizeLimits.json")
except Exception as e:
    print(f"Warning: Could not load sizeLimits.json: {e}")
    _size_limits = {}

# Helper to convert MB/KB to bytes
def _mb(key: str, default_mb: int) -> int:
    return _size_limits.get(key, default_mb) * 1024 * 1024

def _kb(key: str, default_kb: int) -> int:
    return _size_limits.get(key, default_kb) * 1024

def _px(key: str, default_px: int) -> int:
    return _size_limits.get(key, default_px)

# Global limits
MAX_TOTAL_STORAGE_PER_USER = _mb('MAX_TOTAL_STORAGE_PER_USER_MB', 1024)
MAX_PAGES_PER_USER = _size_limits.get('MAX_PAGES_PER_USER', 10)
MAX_SITE_SIZE = _mb('MAX_SITE_SIZE_MB', 500)

# Photo limits (general images)
MAX_PHOTO_UPLOAD_SIZE = _mb('MAX_PHOTO_UPLOAD_SIZE_MB', 100)
MAX_PHOTO_STORED_SIZE = _mb('MAX_PHOTO_STORED_SIZE_MB', 25)
MAX_PHOTO_DIMENSION = _px('MAX_PHOTO_DIMENSION_PX', 1920)

# Avatar limits
MAX_AVATAR_UPLOAD_SIZE = _mb('MAX_AVATAR_UPLOAD_SIZE_MB', 25)
MAX_AVATAR_STORED_SIZE = _mb('MAX_AVATAR_STORED_SIZE_MB', 2)
TARGET_AVATAR_SIZE = _px('TARGET_AVATAR_SIZE_PX', 256)

# Backend validation (safety limits)
BACKEND_MAX_IMAGE_SIZE = _mb('BACKEND_MAX_IMAGE_SIZE_MB', 25)
BACKEND_MAX_AVATAR_SIZE = _mb('BACKEND_MAX_AVATAR_SIZE_MB', 5)

# Video limits
MAX_VIDEO_UPLOAD_SIZE = _mb('MAX_VIDEO_UPLOAD_SIZE_MB', 100)
MAX_VIDEO_DURATION = _size_limits.get('MAX_VIDEO_DURATION_SECONDS', 600)

# WebP conversion
WEBP_QUALITY = _size_limits.get('WEBP_QUALITY', 90)
WEBP_QUALITY_THUMBNAIL = _size_limits.get('WEBP_QUALITY_THUMBNAIL', 80)

# Image sizes (for srcset responsive images)
THUMBNAIL_SIZE = _px('THUMBNAIL_SIZE_PX', 400)
FULL_SIZE = _px('FULL_SIZE_PX', 1920)
AVATAR_SIZE = _px('AVATAR_SIZE_PX', 256)

# SVG limits
MAX_SVG_SIZE = _kb('MAX_SVG_SIZE_KB', 500)

# Allowed formats
ALLOWED_IMAGE_FORMATS = _size_limits.get('ALLOWED_IMAGE_FORMATS', ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])
ALLOWED_IMAGE_MIMETYPES = tuple(_size_limits.get('ALLOWED_IMAGE_MIMETYPES', [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
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
    _team_roles = load_json_file("teamRoles.json")
except Exception as e:
    print(f"Warning: Could not load teamRoles.json: {e}")
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
