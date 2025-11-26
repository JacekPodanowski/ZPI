from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.conf import settings
import os
import logging

from .media_helpers import cleanup_asset_if_unused
from .models import Booking, MediaUsage, TermsOfService, Event, GoogleCalendarIntegration

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Booking)
def ensure_attendee_on_booking_save(sender, instance: Booking, created: bool, **kwargs):
    """Ensure the client is attached to the event attendee list whenever a booking exists."""
    if instance.client:
        instance.event.attendees.add(instance.client)


@receiver(post_delete, sender=Booking)
def cleanup_attendee_on_booking_delete(sender, instance: Booking, **kwargs):
    """Remove the attendee when their last booking for the event is deleted."""
    try:
        if instance.client:
            remaining = instance.event.bookings.filter(client=instance.client).exists()
            if not remaining:
                instance.event.attendees.remove(instance.client)
    except Exception:
        # Client may have been deleted or doesn't exist - skip cleanup
        pass


@receiver(post_delete, sender=MediaUsage)
def cleanup_media_on_usage_delete(sender, instance: MediaUsage, **kwargs):
    """Remove media files that are no longer referenced anywhere."""
    cleanup_asset_if_unused(instance.asset)


def ensure_initial_terms_exist():
    """Ensure at least one Terms of Service version exists by loading from REGULAMIN.md"""
    if TermsOfService.objects.exists():
        return
    
    terms_file_path = os.path.join(settings.BASE_DIR, 'media', 'terms', 'REGULAMIN.md')
    
    if not os.path.exists(terms_file_path):
        # Create with placeholder content if file doesn't exist
        content = "# Regulamin\n\nRegulamin serwisu będzie dostępny wkrótce."
    else:
        try:
            with open(terms_file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            if not content.strip():
                content = "# Regulamin\n\nRegulamin serwisu będzie dostępny wkrótce."
        except Exception:
            content = "# Regulamin\n\nRegulamin serwisu będzie dostępny wkrótce."
    
    TermsOfService.objects.create(
        version='1.0',
        content_md=content
    )


@receiver(post_save, sender=Event)
def sync_event_to_google_calendar_on_save(sender, instance: Event, created: bool, **kwargs):
    """
    Automatically sync Event to Google Calendar when created or updated.
    Only syncs if the site has an active Google Calendar integration.
    """
    try:
        integration = GoogleCalendarIntegration.objects.filter(
            site=instance.site,
            is_active=True,
            sync_enabled=True
        ).first()
        
        if not integration:
            return  # No active integration
        
        # Import here to avoid circular import
        from .google_calendar_service import google_calendar_service
        
        if created:
            # Create new event in Google Calendar
            google_calendar_service.create_event(integration, instance)
            logger.info(f"Created Google Calendar event for new Event {instance.id}")
        else:
            # Update existing event in Google Calendar
            google_calendar_service.update_event(integration, instance)
            logger.info(f"Updated Google Calendar event for Event {instance.id}")
            
    except Exception as e:
        logger.error(f"Failed to sync Event {instance.id} to Google Calendar: {e}")


@receiver(post_delete, sender=Event)
def sync_event_to_google_calendar_on_delete(sender, instance: Event, **kwargs):
    """
    Automatically delete Event from Google Calendar when deleted locally.
    Only syncs if the site has an active Google Calendar integration.
    """
    try:
        integration = GoogleCalendarIntegration.objects.filter(
            site=instance.site,
            is_active=True,
            sync_enabled=True
        ).first()
        
        if not integration:
            return  # No active integration
        
        # Import here to avoid circular import
        from .google_calendar_service import google_calendar_service
        
        google_calendar_service.delete_event(integration, instance)
        logger.info(f"Deleted Google Calendar event for Event {instance.id}")
        
    except Exception as e:
        logger.error(f"Failed to delete Event {instance.id} from Google Calendar: {e}")