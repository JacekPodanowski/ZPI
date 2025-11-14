# Team Members System - Technical Documentation

## Overview
Multi-tenant team management system allowing site owners to add team members without requiring platform accounts initially. Team members can exist in four states and have role-based permissions.

## Core Concept
- **TeamMembers (linked)** = Regular PlatformUsers with limited permissions to specific sites
- **Owners** = PlatformUsers with full permissions to their own sites
- Same user can be Owner of their sites AND TeamMember in others
- Single Studio interface for all users with role-based access control

---

## Database Models

### TeamMember
```python
site: ForeignKey(Site)                    # Which site they belong to
first_name: CharField (required)
last_name: CharField (required)
email: EmailField (optional initially, required for invitation)
role_description: TextField               # E.g., "Yoga Instructor"
avatar_url: URLField (null=True)         # Custom avatar or null for generated
is_active: BooleanField (default=True)

# Invitation Management
linked_user: ForeignKey(PlatformUser, null=True)
invitation_status: CharField              # mock/invited/pending/linked/rejected
invitation_token: UUIDField (unique)
invited_at: DateTimeField (null=True)

# Permissions
permission_role: CharField                # viewer/contributor/manager
```

### Event (Modified)
```python
# Exactly ONE must be filled (validated):
assigned_to_team_member: ForeignKey(TeamMember, null=True, blank=True)
assigned_to_owner: ForeignKey(PlatformUser, null=True, blank=True)
```

### Site (New Field)
```python
team_size: IntegerField (default=1)      # Cached count for calendar optimization
```

---

## Invitation Status States

### 1. Mock (`'mock'`)
- Created by owner in Team Page
- No account connection
- Generic avatar (first letter + deterministic color)
- Visible on public site
- Can be assigned to events

### 2. Invited (`'invited'`)
- Owner clicks "Send Invitation" (user has NO account)
- Token generated, email sent with link: `/accept-invitation/{TOKEN}`
- Leads to OAuth registration
- After registration: auto-links, status → `'linked'`

### 3. Pending (`'pending'`)
- Owner clicks "Send Invitation" (user HAS account - email exists in DB)
- Token generated, notification email sent
- TeamMemberSiteTile appears in user's Sites panel with accept/reject buttons
- User actions:
  - ✓ Accept → status: `'linked'`, linked_user filled, full access
  - ✗ Reject → status: `'rejected'`, tile disappears

### 4. Linked (`'linked'`)
- Connected to PlatformUser account
- permission_role activates
- Full Studio access based on role
- Can leave team (status → `'rejected'`, linked_user → null)

---

## Permission Roles

### Viewer
- ✅ See own assigned events + booking details
- ✅ Export personal calendar
- ❌ No edit/add/delete permissions
- ❌ Can't see other members' events

### Contributor
- ✅ All Viewer permissions
- ✅ Add/edit/delete own events (assigned to self)
- ✅ See all events (read-only for others)
- ✅ Manage own availability
- ❌ Can't assign events to others

### Manager
- ✅ All Contributor permissions
- ✅ Add/edit/delete any event
- ✅ Assign events to any team member or owner
- ✅ Manage team availability
- ❌ No team member CRUD
- ❌ No site editor/settings access

### Owner (Implicit Role)
- ✅ All Manager permissions
- ✅ Team member CRUD + role changes
- ✅ Full editor + site settings access
- ✅ Subscription management

---

## API Endpoints

### Sites List
```
GET /api/v1/sites/
Response: {
  "owned_sites": [...],           # Full SiteTile data
  "team_member_sites": [{         # TeamMemberSiteTile data
    "id": 2,
    "team_member_info": {
      "permission_role": "contributor",
      "invitation_status": "pending",
      ...
    }
  }]
}
```

### Team Member Management
```
POST   /api/v1/sites/{site_id}/team-members/          # Create (Owner only)
PATCH  /api/v1/team-members/{id}/                     # Update (Owner only)
DELETE /api/v1/team-members/{id}/                     # Delete (Owner only)
POST   /api/v1/team-members/{id}/send-invitation/    # Send invite (Owner only)
```

### Invitations
```
GET  /api/v1/accept-invitation/{token}/               # Link for 'invited' status
POST /api/v1/team-invitations/{token}/accept/        # Accept 'pending' status
POST /api/v1/team-invitations/{token}/reject/        # Reject 'pending' status
POST /api/v1/team-members/{id}/leave/                # Leave team ('linked' only)
```

### Event Permissions
- **Create**: Owner/Manager choose assignee; Contributor auto-assigns to self; Viewer forbidden
- **Update/Delete**: Owner/Manager any event; Contributor only own events; Viewer forbidden

---

## Avatar System

### Generic Avatar Generation
- **Trigger**: TeamMember creation, PlatformUser registration (if avatar_url is null)
- **Letter**: First character of first_name (TeamMember) or name/email (PlatformUser)
- **Color**: Deterministic hash from full name modulo 10 colors

### Color Palette (10 Pastel Colors)
```
#FF6B9D, #C44569, #FEA47F, #F8B500, #3DC1D3,
#778BEB, #786FA6, #63CDDA, #EA8685, #F8D49D
```

### Hash Function
```python
def getAvatarColor(name):
    ascii_sum = sum(ord(char) for char in name)
    color_index = ascii_sum % 10
    return COLOR_PALETTE[color_index]
```

---

## Calendar View Logic

### Team Size Optimization
```python
if site.team_size == 1:
    events = Event.objects.filter(assigned_to_owner=owner)
else:
    events = Event.objects.filter(
        Q(assigned_to_owner=owner) | Q(assigned_to_team_member__site=site)
    )
```

### Team Member Avatars (when team_size > 1)
- Display next to calendar title after site filter selection
- Clickable filters (same UX as site filters)
- Filter events by selected team member

### Role-Based Visibility
- **Owner**: All events, full edit rights
- **Manager**: All events, full edit rights
- **Contributor**: All events visible, only own editable
- **Viewer**: Only own events visible (read-only)

---

## Email Templates

### Invited (No Account)
```
Subject: "Zaproszenie do zespołu strony [site_name]"
CTA: "Zarejestruj się i dołącz"
Link: https://youreasysite.com/accept-invitation/{TOKEN}
```

### Pending (Has Account)
```
Subject: "Zaproszenie do zespołu strony [site_name]"
CTA: "Przejdź do panelu"
Link: https://youreasysite.com/studio/sites
Note: "Zaproszenie znajdziesz w swoim panelu Sites"
```

---

## Authorization Middleware

Every request to `/api/v1/sites/{site_id}/`:
1. Check if `Site.owner == request.user` → Full access
2. Else, check if TeamMember exists:
   - `site_id == Site.id`
   - `linked_user == request.user`
   - `invitation_status == 'linked'`
3. If yes, retrieve `permission_role` and validate action
4. If unauthorized: `403 Forbidden` with message: "Nie masz uprawnień. Twoja rola: [role]"

---

## Frontend Components

### TeamMemberSiteTile (New)
- **Pending Status**: Shows invitation with accept/reject buttons
- **Linked Status**: Shows role info, calendar button, simplified menu (only "Leave Team")
- No editor/settings access

### Studio Sites Panel
Displays two types:
1. **SiteTile**: Owned sites (full features)
2. **TeamMemberSiteTile**: Member sites (role-based features)

---

## Implementation Phases

### Phase 1 (MVP)
- TeamMember model + CRUD
- Event dual assignment (assigned_to_owner / assigned_to_team_member)
- Generic avatar generator
- TeamMemberAvatar component
- Role dropdown with tooltips
- GET /api/v1/sites/ returns team_member_sites

### Phase 2
- Invitation system (tokens, email logic)
- Accept/reject endpoints
- TeamMemberSiteTile with invitation section
- Leave team functionality
- Authorization middleware

### Phase 3
- Calendar role-based views
- Availability management
- Personal calendar export
- Invitation statistics dashboard
