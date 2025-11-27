# Unified Permissions & Size Limits System

## Overview

A unified system where both backend and frontend share the same configuration for team roles, permissions, and media size limits. The source files live in `SHARED_SETTINGS/` and are synced to local folders in each project.

## Structure

```
SHARED_SETTINGS/
├── sizeLimits.js     # Source - Size limits and constraints
├── teamRoles.js      # Source - Role definitions and permissions
├── sync.bat          # Script to sync files (double-click to run)
└── README.md         # Short instructions

FRONTEND/src/shared/  # Local copy for frontend
├── sizeLimits.js
└── teamRoles.js

BACKEND/api/shared/   # Local copy for backend
├── sizeLimits.js
└── teamRoles.js
```

## Syncing Files

After editing files in `SHARED_SETTINGS/`, run the sync script:

- **Double-click** `SHARED_SETTINGS\sync.bat`, or
- **Terminal:** `.\SHARED_SETTINGS\sync.bat`

## Usage

### Backend (Python)

```python
from api.shared_constants import (
    # Permissions
    has_permission,
    can_edit_any_event,
    can_manage_team,
    
    # Size limits
    BACKEND_MAX_IMAGE_SIZE,
    MAX_AVATAR_STORED_SIZE,
    TARGET_PHOTO_WIDTH,
)

# Check permissions
if has_permission(role, 'editAnyEvent'):
    # User can edit events

if can_manage_team(role):
    # User can manage team

# Use size limits
if file.size > BACKEND_MAX_IMAGE_SIZE:
    raise ValidationError("File too large")
```

### Frontend (JavaScript)

```javascript
import { TEAM_ROLES, getRoleInfo } from '../shared/teamRoles';
import { SIZE_LIMITS } from '../shared/sizeLimits';
import { processImageForUpload } from '../utils/imageProcessing';

// Check permissions
const roleInfo = getRoleInfo(user.role);
if (roleInfo.permissions.editAnyEvent) {
    // User can edit events
}

// Process images before upload
const processedFile = await processImageForUpload(file, 'photo');
const processedAvatar = await processImageForUpload(file, 'avatar');

// Check size limits
if (file.size > SIZE_LIMITS.MAX_PHOTO_UPLOAD_SIZE) {
    // Show error
}
```

## Team Roles & Permissions

### Viewer (Obserwator)
- Can only view their own assigned events
- Can view booking details
- Can export their calendar
- **Cannot** add or edit events

### Contributor (Współpracownik)
- Can manage their own calendar
- Can add and edit their own events
- Can view other team members' events
- Can manage own availability
- **Cannot** edit other team members' events

### Manager (Menedżer)
- Can manage the entire team calendar
- Can add, edit, and cancel any event
- Can assign events to team members
- Can manage team availability
- **Cannot** edit site content or manage team members

### Owner (Właściciel)
- Full access to all features
- Can edit site content
- Can manage team (add/remove members)
- Can change roles
- Can edit settings and manage subscription

## Image Processing

### Frontend-Only Processing

All image processing happens on the **frontend only**. Backend just validates size and saves.

**Photos:**
- User can select up to **100MB**
- Frontend scales to max **1920px** (longest side)
- Frontend converts to **WebP** format
- Result sent to backend: max **25MB**

**Avatars:**
- User can select up to **25MB**
- Frontend scales to **512x512px** (square)
- Frontend converts to **WebP** format
- Result sent to backend: max **5MB**

**Videos:**
- No processing - direct upload up to **100MB**
- Larger videos → suggest YouTube/Vimeo embed

### Backend Validation

Backend only validates size (no conversion):
- Images: max **25MB** (already WebP from frontend)
- Avatars: max **5MB** (already WebP from frontend)
- Videos: max **100MB** (pass-through)

### Usage Example

```javascript
import { processImageForUpload, validateImageFile } from '../utils/imageProcessing';

// Validate file
const validation = validateImageFile(file, 'avatar');
if (!validation.valid) {
    alert(validation.error);
    return;
}

// Process and upload
try {
    const processedFile = await processImageForUpload(file, 'avatar');
    // Upload processedFile to backend
    await uploadAvatar(processedFile);
} catch (error) {
    alert(error.message);
}
```

## Migration Notes

1. **Source files location:**
   - `SHARED_SETTINGS/sizeLimits.js` - Edit this for size limit changes
   - `SHARED_SETTINGS/teamRoles.js` - Edit this for role/permission changes
   - `SHARED_SETTINGS/sync.bat` - Run this after changes

2. **Auto-synced files (don't edit directly):**
   - `FRONTEND/src/shared/sizeLimits.js`
   - `FRONTEND/src/shared/teamRoles.js`
   - `BACKEND/api/shared/sizeLimits.js`
   - `BACKEND/api/shared/teamRoles.js`

3. **Backend constants loader:**
   - `BACKEND/api/shared_constants.py` - Parses JS files from `api/shared/`

4. **Frontend imports use relative paths:**
   - `import { SIZE_LIMITS } from '../shared/sizeLimits';`
   - `import { getRoleInfo } from '../../../shared/teamRoles';`

## Benefits

✅ **Single source of truth** - Edit in SHARED_SETTINGS, sync to both projects  
✅ **Independent deployments** - Frontend and backend can be hosted separately  
✅ **No runtime dependencies** - Each project has its own copy  
✅ **Frontend/Backend alignment** - Same permissions everywhere
