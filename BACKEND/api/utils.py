# site_backend/api/utils.py

import logging
import datetime
from django.utils import timezone
from .models import User, TimeSlot, Meeting, DailyActivitySummary

logger = logging.getLogger(__name__)

def recalculate_daily_summary_for_date(tutor_id, date_obj):
    """
    Centralna funkcja do przeliczania i aktualizacji podsumowania dnia dla danego tutora i daty.
    Sprawdza, czy istnieją jeszcze dostępne, połączone sloty (min. 1h) do rezerwacji.
    """
    if not isinstance(date_obj, datetime.date):
        date_obj = date_obj.date()
    
    try:
        tutor = User.objects.get(id=tutor_id)
    except User.DoesNotExist:
        logger.error(f"Nie znaleziono tutora o ID {tutor_id} podczas przeliczania podsumowania.")
        return False
    
    # Pobierz wszystkie dostępne sloty na dany dzień, posortowane
    available_slots = TimeSlot.objects.filter(
        tutor=tutor, 
        start_time__date=date_obj, 
        is_available=True
    ).order_by('start_time')
    
    has_bookable_slots = False
    MIN_NOTICE_MINUTES = 20
    earliest_bookable_time = timezone.now() + datetime.timedelta(minutes=MIN_NOTICE_MINUTES)
    
    # Sprawdź, czy istnieją co najmniej dwa następujące po sobie wolne sloty (co daje min. 1h)
    if available_slots.count() >= 2:
        for i in range(len(available_slots) - 1):
            slot1 = available_slots[i]
            slot2 = available_slots[i+1]
            
            is_not_too_soon = slot1.start_time >= earliest_bookable_time
            is_consecutive = slot1.end_time == slot2.start_time
            
            if is_not_too_soon and is_consecutive:
                has_bookable_slots = True
                break
    
    has_booked_activity = Meeting.objects.filter(
        tutor=tutor,
        time_slot__start_time__date=date_obj
    ).exists()

    summary, created = DailyActivitySummary.objects.update_or_create(
        tutor=tutor,
        date=date_obj,
        defaults={
            'has_available_slots': has_bookable_slots,
            'has_booked_slots': has_booked_activity,
        }
    )
    
    action = "Created" if created else "Updated"
    logger.info(f"({action}) DailySummary for {tutor.email} on {date_obj}: has_available_slots={has_bookable_slots}")
    return True