"""Permission classes for team member role-based access control."""

from rest_framework import permissions
from .models import TeamMember
from . import shared_constants as sc


class IsOwnerOrTeamMember(permissions.BasePermission):
    """
    Permission class that allows access to site owners and linked team members.
    Specific role-based restrictions are handled in the ViewSet methods.
    """
    
    def has_object_permission(self, request, view, obj):
        """Check if user is owner or linked team member of the site."""
        # Add debug logging
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"[IsOwnerOrTeamMember.has_object_permission] User: {request.user.id}, Method: {request.method}, Object: {obj}")
        
        # Staff always have access
        if request.user.is_staff:
            logger.debug(f"[IsOwnerOrTeamMember] User is staff - allowing")
            return True
        
        # For Site objects
        if hasattr(obj, 'owner'):
            # Check if user is owner
            if obj.owner == request.user:
                logger.debug(f"[IsOwnerOrTeamMember] User is owner - allowing")
                return True
            
            # Check if user is a linked team member (any role)
            is_team_member = TeamMember.objects.filter(
                site=obj,
                linked_user=request.user,
                invitation_status='linked'
            ).exists()
            
            logger.debug(f"[IsOwnerOrTeamMember] Is team member: {is_team_member}")
            return is_team_member
        
        # For Event objects
        if hasattr(obj, 'site'):
            # Check if user is site owner
            if obj.site.owner == request.user:
                logger.debug(f"[IsOwnerOrTeamMember] User is site owner - allowing")
                return True
            
            # Check if user is a linked team member (any role)
            is_team_member = TeamMember.objects.filter(
                site=obj.site,
                linked_user=request.user,
                invitation_status='linked'
            ).exists()
            
            logger.debug(f"[IsOwnerOrTeamMember] Is team member: {is_team_member}")
            return is_team_member
        
        logger.warning(f"[IsOwnerOrTeamMember] No matching condition - denying")
        return False


class CanManageEvents(permissions.BasePermission):
    """
    Permission class for event management based on team member role.
    Uses shared constants to ensure frontend/backend alignment.
    
    - Owner: Can manage all events
    - Manager: Can manage all events (editAnyEvent permission)
    - Contributor: Can manage only their own events (editOwnEvents permission)
    - Viewer: Cannot manage events (no edit permissions)
    """
    
    def has_object_permission(self, request, view, obj):
        """Check if user can manage this event based on their role."""
        user = request.user
        
        # Staff always have access
        if user.is_staff:
            return True
        
        # Site owner has full access
        if obj.site.owner == user:
            return True
        
        # Get team member
        team_member = TeamMember.objects.filter(
            site=obj.site,
            linked_user=user,
            invitation_status='linked'
        ).first()
        
        if not team_member:
            return False
        
        role = team_member.permission_role
        
        # For safe methods (GET, HEAD, OPTIONS), check view permissions
        if request.method in permissions.SAFE_METHODS:
            # Check if can view other events, otherwise only own events
            if sc.can_view_other_events(role):
                return True
            # Viewer can only see their own events
            return obj.assigned_to_team_member == team_member
        
        # For write methods (POST, PUT, PATCH, DELETE)
        # Check if can edit any event
        if sc.can_edit_any_event(role):
            return True
        
        # Check if can edit own events
        if sc.can_edit_own_events(role):
            return obj.assigned_to_team_member == team_member
        
        return False


class CanCreateEvents(permissions.BasePermission):
    """
    Permission class for event creation based on team member role.
    Uses shared constants for permission checks.
    
    - Owner: Can create events
    - Manager: Can create events
    - Contributor: Can create events (assigned to self)
    - Viewer: Cannot create events
    """
    
    def has_permission(self, request, view):
        """Check if user can create events."""
        if not request.user.is_authenticated:
            return False
        
        # Staff always have access
        if request.user.is_staff:
            return True
        
        # For list view, allow all authenticated users
        if request.method == 'GET':
            return True
        
        # For POST, need to check site access in has_object_permission
        # or in the view itself
        return True
    
    def has_object_permission(self, request, view, obj):
        """Check if user can create events for this site."""
        user = request.user
        
        # Site owner can create events
        if hasattr(obj, 'owner') and obj.owner == user:
            return True
        
        # Check team member role
        site = obj if hasattr(obj, 'owner') else obj.site
        team_member = TeamMember.objects.filter(
            site=site,
            linked_user=user,
            invitation_status='linked'
        ).first()
        
        if not team_member:
            return False
        
        role = team_member.permission_role
        
        # Use shared constants to check permission
        return sc.can_add_events(role)


def get_user_role_for_site(user, site):
    """
    Get the user's role for a specific site.
    
    Returns:
        str: 'owner', 'manager', 'contributor', 'viewer', or None
    """
    if site.owner == user:
        return 'owner'
    
    team_member = TeamMember.objects.filter(
        site=site,
        linked_user=user,
        invitation_status='linked'
    ).first()
    
    if team_member:
        return team_member.permission_role
    
    return None


def can_user_edit_event(user, event):
    """
    Check if user can edit a specific event.
    Uses shared constants for permission logic.
    
    Args:
        user: PlatformUser instance
        event: Event instance
        
    Returns:
        bool: True if user can edit, False otherwise
    """
    # Site owner can edit all events
    if event.site.owner == user:
        return True
    
    # Get team member role
    team_member = TeamMember.objects.filter(
        site=event.site,
        linked_user=user,
        invitation_status='linked'
    ).first()
    
    if not team_member:
        return False
    
    role = team_member.permission_role
    
    # Check if can edit any event
    if sc.can_edit_any_event(role):
        return True
    
    # Check if can edit own events
    if sc.can_edit_own_events(role):
        return event.assigned_to_team_member == team_member
    
    return False
