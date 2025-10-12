from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Booking


@receiver(post_save, sender=Booking)
def ensure_attendee_on_booking_save(sender, instance: Booking, created: bool, **kwargs):
    """Ensure the client is attached to the event attendee list whenever a booking exists."""
    if instance.client:
        instance.event.attendees.add(instance.client)


@receiver(post_delete, sender=Booking)
def cleanup_attendee_on_booking_delete(sender, instance: Booking, **kwargs):
    """Remove the attendee when their last booking for the event is deleted."""
    if instance.client:
        remaining = instance.event.bookings.filter(client=instance.client).exists()
        if not remaining:
            instance.event.attendees.remove(instance.client)