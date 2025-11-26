"""
Google Calendar Integration Service
Handles OAuth flow and event synchronization with Google Calendar.
"""
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import logging

from django.conf import settings
from django.utils import timezone
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from .models import GoogleCalendarIntegration, GoogleCalendarEvent, Event

logger = logging.getLogger(__name__)


class GoogleCalendarService:
    """Service for managing Google Calendar integration and synchronization."""
    
    SCOPES = ['https://www.googleapis.com/auth/calendar']
    
    def __init__(self):
        self.client_id = os.getenv('GOOGLE_OAUTH_CLIENT_ID')
        self.client_secret = os.getenv('GOOGLE_OAUTH_CLIENT_SECRET')
        self.redirect_uri = os.getenv('GOOGLE_OAUTH_REDIRECT_URI', 'http://localhost:3000/auth/google/callback')
    
    def get_authorization_url(self, state: str) -> str:
        """
        Generate Google OAuth authorization URL.
        
        Args:
            state: State parameter for CSRF protection (should include site_id)
            
        Returns:
            Authorization URL for user to visit
        """
        from google_auth_oauthlib.flow import Flow
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri],
                }
            },
            scopes=self.SCOPES,
            redirect_uri=self.redirect_uri
        )
        
        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            state=state,
            prompt='consent'  # Force consent to ensure we get refresh token
        )
        
        return authorization_url
    
    def exchange_code_for_tokens(self, code: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access and refresh tokens.
        
        Args:
            code: Authorization code from Google OAuth callback
            
        Returns:
            Dictionary containing tokens and user info
        """
        from google_auth_oauthlib.flow import Flow
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.redirect_uri],
                }
            },
            scopes=self.SCOPES,
            redirect_uri=self.redirect_uri
        )
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Get user's primary calendar (email)
        service = build('calendar', 'v3', credentials=credentials)
        calendar = service.calendars().get(calendarId='primary').execute()
        
        return {
            'access_token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_expires_at': credentials.expiry,
            'google_email': calendar.get('id'),
            'calendar_name': calendar.get('summary', 'Primary Calendar')
        }
    
    def get_credentials(self, integration: GoogleCalendarIntegration) -> Credentials:
        """
        Get valid Google API credentials, refreshing if necessary.
        
        Args:
            integration: GoogleCalendarIntegration instance
            
        Returns:
            Valid Credentials object
        """
        credentials = Credentials(
            token=integration.access_token,
            refresh_token=integration.refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=self.client_id,
            client_secret=self.client_secret,
            scopes=self.SCOPES
        )
        
        # Refresh token if expired
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            
            # Update stored tokens
            integration.access_token = credentials.token
            integration.token_expires_at = credentials.expiry
            integration.save(update_fields=['access_token', 'token_expires_at', 'updated_at'])
            
            logger.info(f"Refreshed access token for integration {integration.id}")
        
        return credentials
    
    def create_event(self, integration: GoogleCalendarIntegration, event: Event) -> Optional[str]:
        """
        Create an event in Google Calendar.
        
        Args:
            integration: GoogleCalendarIntegration instance
            event: Event instance to sync
            
        Returns:
            Google Calendar event ID or None on failure
        """
        try:
            credentials = self.get_credentials(integration)
            service = build('calendar', 'v3', credentials=credentials)
            
            # Build event body
            event_body = self._build_event_body(event)
            
            # Create event with sendUpdates to force immediate sync
            google_event = service.events().insert(
                calendarId=integration.calendar_id,
                body=event_body,
                sendUpdates='all'  # Force immediate notification and cache refresh
            ).execute()
            
            google_event_id = google_event['id']
            
            # Create mapping
            GoogleCalendarEvent.objects.create(
                event=event,
                integration=integration,
                google_event_id=google_event_id
            )
            
            integration.last_sync_at = timezone.now()
            integration.save(update_fields=['last_sync_at', 'updated_at'])
            
            logger.info(f"Created Google Calendar event {google_event_id} for Event {event.id}")
            return google_event_id
            
        except HttpError as e:
            logger.error(f"Failed to create Google Calendar event for Event {event.id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error creating Google Calendar event for Event {event.id}: {e}")
            return None
    
    def update_event(self, integration: GoogleCalendarIntegration, event: Event) -> bool:
        """
        Update an existing event in Google Calendar.
        
        Args:
            integration: GoogleCalendarIntegration instance
            event: Event instance to sync
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get mapping
            google_cal_event = GoogleCalendarEvent.objects.filter(
                event=event,
                integration=integration
            ).first()
            
            if not google_cal_event:
                logger.warning(f"No Google Calendar mapping found for Event {event.id}, creating new event")
                self.create_event(integration, event)
                return True
            
            credentials = self.get_credentials(integration)
            service = build('calendar', 'v3', credentials=credentials)
            
            # Build event body
            event_body = self._build_event_body(event)
            
            # Update event with sendUpdates to force immediate sync
            service.events().update(
                calendarId=integration.calendar_id,
                eventId=google_cal_event.google_event_id,
                body=event_body,
                sendUpdates='all'  # Force immediate notification and cache refresh
            ).execute()
            
            google_cal_event.last_synced_at = timezone.now()
            google_cal_event.save(update_fields=['last_synced_at'])
            
            integration.last_sync_at = timezone.now()
            integration.save(update_fields=['last_sync_at', 'updated_at'])
            
            logger.info(f"Updated Google Calendar event {google_cal_event.google_event_id} for Event {event.id}")
            return True
            
        except HttpError as e:
            logger.error(f"Failed to update Google Calendar event for Event {event.id}: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error updating Google Calendar event for Event {event.id}: {e}")
            return False
    
    def delete_event(self, integration: GoogleCalendarIntegration, event: Event) -> bool:
        """
        Delete an event from Google Calendar.
        
        Args:
            integration: GoogleCalendarIntegration instance
            event: Event instance that was deleted
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Get mapping
            google_cal_event = GoogleCalendarEvent.objects.filter(
                event=event,
                integration=integration
            ).first()
            
            if not google_cal_event:
                logger.warning(f"No Google Calendar mapping found for Event {event.id}")
                return True  # Already doesn't exist
            
            google_event_id = google_cal_event.google_event_id
            
            # Use the new method that doesn't rely on Event instance
            return self.delete_event_by_id(integration, google_event_id)
            
        except Exception as e:
            logger.error(f"Unexpected error deleting Google Calendar event for Event {event.id}: {e}")
            return False
    
    def delete_event_by_id(self, integration: GoogleCalendarIntegration, google_event_id: str) -> bool:
        """
        Delete an event from Google Calendar by its Google event ID.
        This method is useful when the local Event is being deleted (CASCADE).
        
        Args:
            integration: GoogleCalendarIntegration instance
            google_event_id: Google Calendar event ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            credentials = self.get_credentials(integration)
            service = build('calendar', 'v3', credentials=credentials)
            
            # Delete event with sendUpdates to force immediate sync
            service.events().delete(
                calendarId=integration.calendar_id,
                eventId=google_event_id,
                sendUpdates='all'  # Force immediate notification and cache refresh
            ).execute()
            
            integration.last_sync_at = timezone.now()
            integration.save(update_fields=['last_sync_at', 'updated_at'])
            
            logger.info(f"Deleted Google Calendar event {google_event_id}")
            return True
            
        except HttpError as e:
            if e.resp.status == 410:  # Already deleted
                logger.info(f"Google Calendar event {google_event_id} already deleted")
                return True
            logger.error(f"Failed to delete Google Calendar event {google_event_id}: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error deleting Google Calendar event {google_event_id}: {e}")
            return False
    
    def _build_event_body(self, event: Event) -> Dict[str, Any]:
        """
        Build Google Calendar event body from Event instance.
        
        Args:
            event: Event instance
            
        Returns:
            Dictionary formatted for Google Calendar API
        """
        # Determine who is assigned
        assigned_name = "Unknown"
        assigned_email = None
        
        if event.assigned_to_owner:
            assigned_name = event.assigned_to_owner.get_full_name()
            assigned_email = event.assigned_to_owner.email
        elif event.assigned_to_team_member:
            assigned_name = event.assigned_to_team_member.name
            assigned_email = event.assigned_to_team_member.email
        
        # Build description
        description_parts = []
        if event.description:
            description_parts.append(event.description)
        
        description_parts.append(f"\nHost: {assigned_name}")
        description_parts.append(f"Type: {event.get_event_type_display()}")
        description_parts.append(f"Capacity: {'Unlimited' if event.capacity == -1 else event.capacity}")
        
        # Add attendees info
        attendee_count = event.attendees.count()
        if attendee_count > 0:
            description_parts.append(f"Attendees: {attendee_count}")
        
        # Build attendees list for Google Calendar
        attendees = []
        if assigned_email:
            attendees.append({'email': assigned_email, 'responseStatus': 'accepted'})
        
        # Add booked clients as attendees
        for client in event.attendees.all():
            if client.email:
                attendees.append({'email': client.email, 'responseStatus': 'accepted'})
        
        event_body = {
            'summary': event.title,
            'description': '\n'.join(description_parts),
            'start': {
                'dateTime': event.start_time.isoformat(),
                'timeZone': 'Europe/Warsaw',
            },
            'end': {
                'dateTime': event.end_time.isoformat(),
                'timeZone': 'Europe/Warsaw',
            },
            'attendees': attendees,
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                    {'method': 'popup', 'minutes': 60},  # 1 hour before
                ],
            },
        }
        
        return event_body
    
    def sync_all_events(self, integration: GoogleCalendarIntegration) -> Dict[str, int]:
        """
        Sync all events for a site to Google Calendar.
        Useful for initial sync or manual re-sync.
        
        Args:
            integration: GoogleCalendarIntegration instance
            
        Returns:
            Dictionary with sync statistics
        """
        stats = {'created': 0, 'updated': 0, 'failed': 0}
        
        if not integration.sync_enabled or not integration.is_active:
            logger.warning(f"Sync disabled for integration {integration.id}")
            return stats
        
        # Get all events for the site
        events = Event.objects.filter(site=integration.site)
        
        for event in events:
            # Check if already synced
            existing = GoogleCalendarEvent.objects.filter(
                event=event,
                integration=integration
            ).exists()
            
            if existing:
                success = self.update_event(integration, event)
                if success:
                    stats['updated'] += 1
                else:
                    stats['failed'] += 1
            else:
                google_event_id = self.create_event(integration, event)
                if google_event_id:
                    stats['created'] += 1
                else:
                    stats['failed'] += 1
        
        logger.info(f"Synced events for integration {integration.id}: {stats}")
        return stats


# Singleton instance
google_calendar_service = GoogleCalendarService()
