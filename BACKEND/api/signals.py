from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.conf import settings
import os

from .media_helpers import cleanup_asset_if_unused
from .models import Booking, MediaUsage, TermsOfService


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