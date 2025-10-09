from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import TimeSlot, Meeting
from .utils import recalculate_daily_summary_for_date

@receiver(post_save, sender=Meeting)
def meeting_post_save_receiver(sender, instance, created, **kwargs):
    if instance.time_slot and instance.time_slot.tutor_id and instance.time_slot.start_time:
        recalculate_daily_summary_for_date(instance.time_slot.tutor_id, instance.time_slot.start_time.date())

@receiver(post_delete, sender=Meeting)
def meeting_post_delete_receiver(sender, instance, **kwargs):
    if instance.time_slot and instance.time_slot.tutor_id and instance.time_slot.start_time:
        recalculate_daily_summary_for_date(instance.time_slot.tutor_id, instance.time_slot.start_time.date())