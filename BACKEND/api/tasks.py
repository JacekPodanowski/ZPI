"""Celery tasks for asynchronous media processing and notifications."""

import base64
import logging
from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def cleanup_unused_media(self, older_than_hours: int = 24):
    """
    Clean up orphaned media files that are no longer referenced.
    
    Args:
        self: Celery task instance
        older_than_hours: Only clean up files older than this many hours
    
    Returns:
        dict: Cleanup statistics
    """
    from datetime import timedelta
    from .media_helpers import cleanup_asset_if_unused
    from .models import MediaAsset
    
    try:
        logger.info(f"[Celery] Starting media cleanup (older than {older_than_hours}h)")
        
        cutoff_time = timezone.now() - timedelta(hours=older_than_hours)
        orphaned_assets = MediaAsset.objects.filter(
            created_at__lt=cutoff_time,
            usage_records__isnull=True
        )
        
        removed_count = 0
        failed_count = 0
        
        for asset in orphaned_assets:
            try:
                if cleanup_asset_if_unused(asset):
                    removed_count += 1
                    logger.debug(f"[Celery] Removed orphaned asset {asset.id}")
            except Exception as e:
                failed_count += 1
                logger.warning(f"[Celery] Failed to remove asset {asset.id}: {e}")
        
        result = {
            'status': 'success',
            'removed': removed_count,
            'failed': failed_count,
            'checked': orphaned_assets.count(),
        }
        logger.info(f"[Celery] Cleanup complete: {result}")
        return result
        
    except Exception as exc:
        logger.exception(f"[Celery] Media cleanup failed: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def send_custom_email_task_async(
    self,
    recipient_list,
    subject: str,
    message: str | None = None,
    html_content: str | None = None,
    attachment_content_b64: str | None = None,
    attachment_filename: str | None = None,
    attachment_mimetype: str | None = None,
):
    """Send custom emails asynchronously, optionally including HTML body and attachment."""

    logger.info(
        "[Celery] Starting custom email task '%s' for recipients: %s",
        subject,
        recipient_list,
    )

    try:
        if isinstance(recipient_list, (str, bytes)):
            recipient_list = [recipient_list]
        elif not isinstance(recipient_list, (list, tuple, set)):
            recipient_list = list(recipient_list)

        if not recipient_list:
            logger.error("[Celery] Aborting custom email '%s' due to empty recipient list", subject)
            return {
                "status": "error",
                "reason": "empty_recipient_list",
                "subject": subject,
            }

        if not (html_content or message):
            raise ValueError('Either message or html_content must be provided for custom email.')

        if html_content:
            base_body = message or ''
            email = EmailMultiAlternatives(
                subject=subject,
                body=base_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=list(recipient_list),
            )
            email.attach_alternative(html_content, 'text/html')
        else:
            email = EmailMessage(
                subject=subject,
                body=message or '',
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=list(recipient_list),
            )

        if attachment_content_b64 and attachment_filename and attachment_mimetype:
            decoded_content = base64.b64decode(attachment_content_b64)
            email.attach(attachment_filename, decoded_content, attachment_mimetype)
            logger.info(
                "[Celery] Attached '%s' (%s) to custom email '%s'",
                attachment_filename,
                attachment_mimetype,
                subject,
            )

        email.send(fail_silently=False)
        logger.info(
            "[Celery] Successfully sent custom email '%s' to %s",
            subject,
            ", ".join(email.to),
        )
        return {
            "status": "success",
            "subject": subject,
            "recipients": list(email.to),
        }

    except Exception as exc:  # pragma: no cover - depends on mail backend
        logger.warning(
            "[Celery] Failed to send custom email '%s'. Retrying... (%s/%s)",
            subject,
            self.request.retries,
            self.max_retries,
            exc_info=True,
        )
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def send_booking_confirmation_emails(self, booking_id):
    """Send booking confirmation emails to both client and site owner."""
    from django.template.loader import render_to_string
    from .models import Booking, MagicLink
    
    try:
        booking = Booking.objects.select_related('site', 'event', 'client', 'site__owner').get(pk=booking_id)
    except Booking.DoesNotExist:
        logger.warning(f"[Celery] Booking with id={booking_id} not found. Cannot send emails.")
        return

    site = booking.site
    event = booking.event
    client = booking.client
    owner = site.owner
    guest_name = client.name if client else booking.guest_name
    guest_email = booking.guest_email

    # Create magic link for cancellation - link expires in 7 days
    magic_link = MagicLink.create_for_email(guest_email, expiry_minutes=60*24*7)  # 7 days
    frontend_url = settings.FRONTEND_URL.rstrip('/')
    # Link will redirect to cancellation page with booking_id
    cancellation_url = f"{frontend_url}/cancel-booking/{booking.id}?token={magic_link.token}"

    # 1. Wyślij e-mail do klienta
    client_subject = f'Potwierdzenie rezerwacji: {event.title}'
    client_context = {
        'guest_name': guest_name,
        'event_title': event.title,
        'start_time': event.start_time,
        'site_name': site.name,
        'cancellation_url': cancellation_url,
        'booking_id': booking.id,
    }
    client_html = render_to_string('emails/booking_confirmation_client.html', client_context)
    
    send_custom_email_task_async.delay(
        recipient_list=[guest_email],
        subject=client_subject,
        html_content=client_html
    )

    # 2. Wyślij e-mail do właściciela witryny
    owner_subject = f'Nowa rezerwacja na Twojej stronie: {site.name}'
    owner_context = {
        'owner_name': owner.first_name,
        'guest_name': guest_name,
        'guest_email': guest_email,
        'event_title': event.title,
        'start_time': event.start_time,
    }
    owner_html = render_to_string('emails/booking_notification_owner.html', owner_context)

    send_custom_email_task_async.delay(
        recipient_list=[owner.email],
        subject=owner_subject,
        html_content=owner_html
    )
    
    logger.info(f"Queued confirmation emails for booking {booking_id}.")
    return {"status": "success", "booking_id": booking_id}

