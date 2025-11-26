# Unified Permissions & Size Limits System

## Overview

Created a unified system where both backend and frontend share the same configuration for team roles, permissions, and media size limits. This eliminates configuration drift and ensures consistency.

## Structure

```
SHARED_SETTINGS/
├── teamRoles.js      # Role definitions and permissions
└── sizeLimits.js     # Media size limits and constraints
```

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
import { TEAM_ROLES, getRoleInfo } from '@shared/teamRoles';
import { SIZE_LIMITS } from '@shared/sizeLimits';
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

**Note:** Frontend uses the `@shared` alias configured in `vite.config.js`:
- **Locally:** Points to `../SHARED_SETTINGS` (outside FRONTEND folder)
- **Docker:** SHARED_SETTINGS is mounted at `/app/SHARED_SETTINGS` in the container
- The path is automatically resolved based on `VITE_SHARED_PATH` environment variable

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

### Frontend Auto-Scaling

Users can upload large files, but the frontend automatically scales them down:

**Photos:**
- User can select up to **100MB**
- Frontend scales to max **1920x1080px**
- Result sent to backend: max **25MB**

**Avatars:**
- User can select up to **25MB**
- Frontend scales to **512x512px** (square)
- Result sent to backend: max **5MB**

### Backend Validation

Backend validates as a safety measure:
- Photos: max **25MB**
- Avatars: max **5MB**

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

1. **Old files removed:**
   - `FRONTEND/src/constants/teamRoles.js` (moved to SHARED_SETTINGS)

2. **New files created:**
   - `BACKEND/api/shared_constants.py` - Backend constants loader
   - `FRONTEND/src/utils/imageProcessing.js` - Image auto-scaling utility

3. **Updated files:**
   - `BACKEND/api/permissions.py` - Now uses shared constants
   - `BACKEND/site_project/settings.py` - Loads from shared constants
   - `SHARED_SETTINGS/sizeLimits.js` - Enhanced with avatar/photo separation
   - `SHARED_SETTINGS/teamRoles.js` - Already correct, no changes needed

4. **Frontend imports updated:**
   - Changed from `../constants/teamRoles` to `@shared/teamRoles`
   - Added Vite alias `@shared` with dynamic path resolution
   - Added `SHARED_SETTINGS` volume mount in `docker-compose.yml`
   - Added `VITE_SHARED_PATH` environment variable for Docker

## Benefits

✅ **Single source of truth** - No configuration drift  
✅ **Frontend/Backend alignment** - Same permissions everywhere  
✅ **Better UX** - Users can upload large files, frontend handles scaling  
✅ **Reduced backend load** - Images pre-processed on client side  
✅ **Type safety** - Shared constants with validation  
✅ **Easy maintenance** - Change once, applies everywhere

## Docker Configuration

The `SHARED_SETTINGS` folder needs to be accessible to both backend and frontend containers:

**Frontend (docker-compose.yml):**
```yaml
studio-frontend:
  volumes:
    - ./FRONTEND:/app
    - ./SHARED_SETTINGS:/app/SHARED_SETTINGS:ro  # Read-only mount
    - /app/node_modules
  environment:
    - VITE_SHARED_PATH=./SHARED_SETTINGS  # Tells Vite where to find shared settings
```

**Backend:**
The backend accesses SHARED_SETTINGS directly from the mounted volume at `/home/appuser/app` which includes the parent directory structure.

**Important:** After changing `docker-compose.yml` volumes, you must recreate the containers:
```bash
docker-compose down
docker-compose up -d
```

A simple restart (`docker-compose restart`) will NOT pick up volume changes.
