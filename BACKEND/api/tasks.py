"""Celery tasks for asynchronous media processing and notifications."""

import base64
import json
import logging
from datetime import timezone as dt_timezone
from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.utils import timezone

logger = logging.getLogger(__name__)


def generate_ics_calendar_event(event, booking, site):
    """
    Generate iCalendar (.ics) file content for a booking event.
    This allows email clients to offer "Add to Calendar" functionality.
    
    Args:
        event: Event model instance
        booking: Booking model instance
        site: Site model instance
        
    Returns:
        str: iCalendar formatted string
    """
    from datetime import datetime
    import uuid
    
    # Format datetime in iCal format (YYYYMMDDTHHMMSSZ)
    def format_dt(dt):
        # Convert to UTC and format
        utc_dt = dt.astimezone(dt_timezone.utc)
        return utc_dt.strftime('%Y%m%dT%H%M%SZ')
    
    # Generate unique UID for the event
    uid = f"booking-{booking.id}@youreasysite.com"
    
    # Current timestamp for DTSTAMP
    now = timezone.now()
    dtstamp = format_dt(now)
    
    # Event times
    dtstart = format_dt(event.start_time)
    dtend = format_dt(event.end_time)
    
    # Escape special characters in text fields
    def escape_ics_text(text):
        if not text:
            return ''
        return text.replace('\\', '\\\\').replace(',', '\\,').replace(';', '\\;').replace('\n', '\\n')
    
    # Build description
    description = escape_ics_text(event.description or '')
    if booking.notes:
        description += f"\\n\\nNotatki: {escape_ics_text(booking.notes)}"
    
    # Get attendee info
    attendee_name = booking.client.name if booking.client else booking.guest_name
    attendee_email = booking.client.email if booking.client else booking.guest_email
    
    # Build iCalendar content
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourEasySite//Booking System//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:{uid}
DTSTAMP:{dtstamp}
DTSTART:{dtstart}
DTEND:{dtend}
SUMMARY:{escape_ics_text(event.title)}
DESCRIPTION:{description}
LOCATION:{escape_ics_text(site.name)}
ORGANIZER;CN={escape_ics_text(site.owner.first_name)}:mailto:{site.owner.email}
ATTENDEE;CN={escape_ics_text(attendee_name)};RSVP=TRUE:mailto:{attendee_email}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Przypomnienie: {escape_ics_text(event.title)} za 15 minut
END:VALARM
END:VEVENT
END:VCALENDAR"""
    
    return ics_content


def generate_ics_cancellation(event, booking, site):
    """
    Generate iCalendar (.ics) cancellation file.
    This tells calendar apps to remove or mark the event as cancelled.
    
    Args:
        event: Event model instance
        booking: Booking model instance
        site: Site model instance
        
    Returns:
        str: iCalendar formatted cancellation string
    """
    from datetime import datetime
    
    # Format datetime in iCal format (YYYYMMDDTHHMMSSZ)
    def format_dt(dt):
        utc_dt = dt.astimezone(dt_timezone.utc)
        return utc_dt.strftime('%Y%m%dT%H%M%SZ')
    
    # Same UID as original event for proper cancellation
    uid = f"booking-{booking.id}@youreasysite.com"
    
    # Current timestamp
    now = timezone.now()
    dtstamp = format_dt(now)
    
    # Event times
    dtstart = format_dt(event.start_time)
    dtend = format_dt(event.end_time)
    
    # Escape special characters
    def escape_ics_text(text):
        if not text:
            return ''
        return text.replace('\\', '\\\\').replace(',', '\\,').replace(';', '\\;').replace('\n', '\\n')
    
    # Get attendee info
    attendee_name = booking.client.name if booking.client else booking.guest_name
    attendee_email = booking.client.email if booking.client else booking.guest_email
    
    # Build cancellation iCalendar content
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourEasySite//Booking System//EN
CALSCALE:GREGORIAN
METHOD:CANCEL
BEGIN:VEVENT
UID:{uid}
DTSTAMP:{dtstamp}
DTSTART:{dtstart}
DTEND:{dtend}
SUMMARY:{escape_ics_text(event.title)}
DESCRIPTION:To wydarzenie zostało odwołane
LOCATION:{escape_ics_text(site.name)}
ORGANIZER;CN={escape_ics_text(site.owner.first_name)}:mailto:{site.owner.email}
ATTENDEE;CN={escape_ics_text(attendee_name)}:mailto:{attendee_email}
STATUS:CANCELLED
SEQUENCE:1
END:VEVENT
END:VCALENDAR"""
    
    return ics_content


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
            
            # For iCalendar files, use special handling to ensure compatibility
            if 'calendar' in attachment_mimetype.lower():
                from email.mime.base import MIMEBase
                from email import encoders
                
                # Create MIMEBase part for calendar
                part = MIMEBase('text', 'calendar', method=attachment_mimetype.split('method=')[1].split(';')[0] if 'method=' in attachment_mimetype else 'REQUEST')
                part.set_payload(decoded_content)
                encoders.encode_base64(part)
                part.add_header('Content-Disposition', f'attachment; filename="{attachment_filename}"')
                part.add_header('Content-Class', 'urn:content-classes:calendarmessage')
                
                # Attach to email
                email.attach(part)
                logger.info(
                    "[Celery] Attached calendar '%s' as MIME part to email '%s'",
                    attachment_filename,
                    subject,
                )
            else:
                # Regular attachment
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

    # Generate .ics calendar file
    ics_content = generate_ics_calendar_event(event, booking, site)
    ics_content_b64 = base64.b64encode(ics_content.encode('utf-8')).decode('utf-8')
    
    # 1. Wyślij e-mail do klienta z załącznikiem .ics
    client_subject = f'Potwierdzenie rezerwacji: {event.title}'
    client_context = {
        'guest_name': guest_name,
        'event_title': event.title,
        'start_time': event.start_time,
        'site_name': site.name,
        'cancellation_url': cancellation_url,
        'booking_id': booking.id,
    }
    client_html = render_to_string('emails/booking/booking_confirmation_to_client.html', client_context)
    
    send_custom_email_task_async.delay(
        recipient_list=[guest_email],
        subject=client_subject,
        html_content=client_html,
        attachment_content_b64=ics_content_b64,
        attachment_filename='event.ics',
        attachment_mimetype='text/calendar; method=REQUEST; charset=UTF-8'
    )

    # 2. Wyślij e-mail do właściciela witryny z załącznikiem .ics
    owner_subject = f'Nowa rezerwacja na Twojej stronie: {site.name}'
    owner_context = {
        'owner_name': owner.first_name,
        'guest_name': guest_name,
        'guest_email': guest_email,
        'event_title': event.title,
        'start_time': event.start_time,
    }
    owner_html = render_to_string('emails/booking/booking_confirmation_to_creator.html', owner_context)

    send_custom_email_task_async.delay(
        recipient_list=[owner.email],
        subject=owner_subject,
        html_content=owner_html,
        attachment_content_b64=ics_content_b64,
        attachment_filename='event.ics',
        attachment_mimetype='text/calendar; method=REQUEST; charset=UTF-8'
    )
    
    logger.info(f"Queued confirmation emails for booking {booking_id}.")
    return {"status": "success", "booking_id": booking_id}


@shared_task(bind=True, max_retries=2, default_retry_delay=60)
def execute_complex_ai_task(self, user_prompt: str, site_config: dict, user_id: int, context: dict = None):
    """
    Execute AI task using specialized agents:
    - studio_editor → SiteEditorAgent (edits site configuration)
    - studio_events → EventsManagerAgent (manages events via API)
    
    Args:
        self: Celery task instance
        user_prompt: User's command/request
        site_config: Current FULL site configuration
        user_id: ID of the user who initiated the request
        context: Optional context (context_type, site_id, agent_id, etc.)
        
    Returns:
        dict: Task result with status ('success', 'clarification', 'api_call')
    """
    from .ai_services_new import get_site_editor_agent, get_events_manager_agent, AIServiceException
    from django.core.cache import cache
    from .models import ChatHistory, PlatformUser, Site
    import json
    
    logger.info(f"[Celery] Starting AI task for user {user_id}: {user_prompt[:50]}...")
    logger.info(f"[Celery] Task ID: {self.request.id}")
    
    cache_key = f'ai_task_result_{user_id}_{self.request.id}'
    logger.info(f"[Celery] Cache key will be: {cache_key}")
    
    # Extract context information
    context = context or {}
    context_type = context.get('context_type', 'studio_editor')
    site_id = context.get('site_id')
    agent_id = context.get('agent_id')  # Get agent ID from context
    
    try:
        # Get user and site objects
        user = PlatformUser.objects.get(id=user_id)
        site = Site.objects.get(id=site_id) if site_id else None
        
        # Get or create agent
        from .models import Agent
        
        if agent_id:
            # Use existing agent
            try:
                agent = Agent.objects.get(id=agent_id, user=user)
            except Agent.DoesNotExist:
                logger.warning(f"[Celery] Agent {agent_id} not found, creating new one")
                agent = None
        else:
            agent = None
        
        # If no agent, create a new one
        if not agent:
            if not site:
                raise ValueError("site_id is required to create a new agent")
            
            # Auto-generate agent name
            count = Agent.objects.filter(user=user, site=site, context_type=context_type).count()
            context_label = dict(Agent.ContextType.choices).get(context_type, context_type)
            agent_name = f"Asystent {context_label} #{count + 1}"
            
            agent = Agent.objects.create(
                user=user,
                site=site,
                context_type=context_type,
                name=agent_name
            )
            logger.info(f"[Celery] Created new agent {agent.id} ({agent_name})")
        
        # Retrieve last 5 chat messages for this agent
        chat_history_qs = ChatHistory.objects.filter(
            agent=agent
        ).order_by('-created_at')[:5]
        
        # Convert to list of dicts for AI context
        chat_history_list = [
            {
                'user_message': msg.user_message,
                'ai_response': msg.ai_response,
                'created_at': msg.created_at.isoformat()
            }
            for msg in reversed(list(chat_history_qs))  # Reverse to get chronological order
        ]
        
        logger.info(f"[Celery] Retrieved {len(chat_history_list)} previous messages for context")
        
        # Choose specialized agent based on context_type
        if context_type == 'studio_events':
            logger.info("[Celery] Using EventsManagerAgent")
            
            # Get existing events for this site to help AI decide update vs create
            if site:
                from .models import BigEvent
                existing_events = BigEvent.objects.filter(site=site).values(
                    'id', 'title', 'start_date', 'end_date', 'status'
                ).order_by('-created_at')[:10]  # Last 10 events
                
                # Convert date objects to strings for JSON serialization
                existing_events_list = []
                for evt in existing_events:
                    evt_dict = dict(evt)
                    if evt_dict.get('start_date'):
                        evt_dict['start_date'] = evt_dict['start_date'].isoformat()
                    if evt_dict.get('end_date'):
                        evt_dict['end_date'] = evt_dict['end_date'].isoformat()
                    existing_events_list.append(evt_dict)
                
                context['existing_events'] = existing_events_list
                logger.info(f"[Celery] Found {len(existing_events_list)} existing events for context")
            
            agent_service = get_events_manager_agent()
            result = agent_service.process_task(user_prompt, context, chat_history=chat_history_list)
        else:
            logger.info("[Celery] Using SiteEditorAgent")
            
            # CREATE CHECKPOINT before AI changes (only for site editor)
            if site:
                import uuid
                checkpoint_id = str(uuid.uuid4())
                checkpoint = {
                    'id': checkpoint_id,
                    'timestamp': timezone.now().isoformat(),
                    'config': site.template_config,
                    'message': f'Przed zmianą: {user_prompt[:100]}'
                }
                
                # Get existing checkpoints
                checkpoints = site.ai_checkpoints or []
                checkpoints.insert(0, checkpoint)
                checkpoints = checkpoints[:20]  # Keep only last 20
                
                site.ai_checkpoints = checkpoints
                site.save(update_fields=['ai_checkpoints'])
                logger.info(f"[Celery] Created checkpoint {checkpoint_id} before AI changes")
            
            agent_service = get_site_editor_agent()
            result = agent_service.process_task(user_prompt, site_config, context, chat_history=chat_history_list)
        
        status = result.get('status', 'success')
        logger.info(f"[Celery] Agent result status: {status}")
        
        # Prepare AI response text for storage
        ai_response_text = ""
        if status == 'success':
            ai_response_text = result.get('explanation', 'Zmiany wprowadzone pomyślnie')
        elif status == 'clarification':
            ai_response_text = result.get('question', 'Proszę doprecyzuj co chcesz zmienić')
        elif status == 'api_call':
            # Store API instructions as AI response
            ai_response_text = result.get('explanation', 'Instrukcje API do wykonania')
        elif status == 'error':
            ai_response_text = result.get('error', 'Wystąpił błąd')
        
        # Save to chat history
        chat_entry = ChatHistory.objects.create(
            agent=agent,
            user=user,
            site=site,
            context_type=context_type,
            context_data=context,
            user_message=user_prompt,
            ai_response=ai_response_text,
            task_id=self.request.id,
            status=status
        )
        logger.info(f"[Celery] Saved chat history entry {chat_entry.id} for agent {agent.id}")
        
        # CLARIFICATION NEEDED - ask user for more details
        if status == 'clarification':
            question = result.get('question', 'Proszę doprecyzuj co chcesz zmienić')
            logger.info(f"[Celery] Clarification needed: {question}")
            
            result_data = {
                'status': 'clarification',
                'question': question,
                'agent_id': str(agent.id),
                'prompt': user_prompt,
                'task_id': self.request.id,
                'chat_history_id': chat_entry.id
            }
            cache.set(cache_key, json.dumps(result_data), timeout=300)
            
            return {
                "status": "clarification",
                "question": question,
                "prompt": user_prompt,
                "user_id": user_id,
                "task_id": self.request.id,
                "agent_id": str(agent.id),
                "chat_history_id": chat_entry.id
            }
        
        # API CALL NEEDED - return API instructions to frontend
        if status == 'api_call':
            logger.info(f"[Celery] API call needed: {result.get('endpoint')}")
            
            result_data = {
                'status': 'api_call',
                'endpoint': result.get('endpoint'),
                'method': result.get('method', 'POST'),
                'body': result.get('body', {}),
                'explanation': result.get('explanation', 'Instrukcje API'),
                'agent_id': str(agent.id),
                'prompt': user_prompt,
                'task_id': self.request.id,
                'chat_history_id': chat_entry.id
            }
            cache.set(cache_key, json.dumps(result_data), timeout=300)
            
            return {
                "status": "api_call",
                "endpoint": result.get('endpoint'),
                "method": result.get('method', 'POST'),
                "body": result.get('body', {}),
                "explanation": result.get('explanation', 'Instrukcje API'),
                "prompt": user_prompt,
                "user_id": user_id,
                "task_id": self.request.id,
                "agent_id": str(agent.id),
                "chat_history_id": chat_entry.id
            }
        
        logger.info(f"[Celery] Flash returned result with keys: {list(result.keys())}")
        logger.info(f"[Celery] Site config present: {('site' in result)}, Explanation: {result.get('explanation', 'N/A')[:100]}")
        
        # Store result in cache for frontend to poll (5 minutes TTL)
        result_data = {
            'status': 'success',
            'site': result.get('site'),
            'explanation': result.get('explanation', 'Zmiany wprowadzone pomyślnie'),
            'prompt': user_prompt,
            'task_id': self.request.id,
            'agent_id': str(agent.id),
            'chat_history_id': chat_entry.id
        }
        
        cache.set(cache_key, json.dumps(result_data), timeout=300)
        logger.info(f"[Celery] Result stored in cache with key: {cache_key}")
        
        return {
            "status": "success",
            "prompt": user_prompt,
            "user_id": user_id,
            "task_id": self.request.id,
            "agent_id": str(agent.id),
            "chat_history_id": chat_entry.id
        }
        
    except PlatformUser.DoesNotExist:
        logger.error(f"[Celery] User {user_id} not found")
        error_data = {
            'status': 'error',
            'error': 'User not found',
            'prompt': user_prompt,
            'task_id': self.request.id
        }
        cache.set(cache_key, json.dumps(error_data), timeout=300)
        return {"status": "error", "message": "User not found"}
        
    except Site.DoesNotExist:
        logger.error(f"[Celery] Site {site_id} not found")
        error_data = {
            'status': 'error',
            'error': 'Site not found',
            'prompt': user_prompt,
            'task_id': self.request.id
        }
        cache.set(cache_key, json.dumps(error_data), timeout=300)
        return {"status": "error", "message": "Site not found"}
        
    except AIServiceException as exc:
        logger.error(f"[Celery] AI service error for user {user_id}: {exc}")
        
        # Store error in cache
        error_data = {
            'status': 'error',
            'error': str(exc),
            'prompt': user_prompt,
            'task_id': self.request.id
        }
        cache.set(cache_key, json.dumps(error_data), timeout=300)
        
        return {
            "status": "error",
            "message": str(exc),
            "prompt": user_prompt,
            "user_id": user_id,
            "task_id": self.request.id
        }
        
    except Exception as exc:
        logger.exception(f"[Celery] Unexpected error in complex AI task for user {user_id}: {exc}")
        
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        
        # Store error in cache after final retry
        error_data = {
            'status': 'error',
            'error': f"Task failed after retries: {str(exc)}",
            'prompt': user_prompt,
            'task_id': self.request.id
        }
        cache.set(cache_key, json.dumps(error_data), timeout=300)
        
        return {
            "status": "error",
            "message": f"Task failed after retries: {str(exc)}",
            "prompt": user_prompt,
            "user_id": user_id
        }


@shared_task(bind=True, max_retries=10, default_retry_delay=60)
def configure_domain_dns(self, order_id: int):
    """
    Configure domain DNS using Cloudflare as DNS provider.
    
    Process:
    1. Change OVH domain nameservers to Cloudflare
    2. Create DNS zone in Cloudflare
    3. Add DNS records pointing to Google Cloud
    4. (Optional) Configure redirect rules
    
    NOTE: Only works for real OVH orders. Mock payments (without ovh_order_id) 
    will be marked as active without DNS configuration.
    
    Args:
        self: Celery task instance
        order_id: ID of the domain order to configure
        
    Returns:
        dict: Configuration result with status
    """
    from .models import DomainOrder
    from django.conf import settings
    import ovh
    import requests
    
    logger.info(f"[Celery] Starting DNS configuration for order {order_id}")
    
    try:
        order = DomainOrder.objects.select_related('user', 'site').get(id=order_id)
    except DomainOrder.DoesNotExist:
        logger.error(f"[Celery] Order {order_id} not found")
        return {"status": "error", "message": "Order not found"}
    
    # Check if this is a mock payment (no real OVH order)
    if not order.ovh_order_id:
        logger.warning(f"[Celery] Order {order_id} is mock payment - skipping DNS configuration")
        order.status = DomainOrder.OrderStatus.ACTIVE
        order.dns_configuration = {
            'mock': True,
            'message': 'Mock payment - DNS configuration skipped',
            'note': 'In production, real domains will be configured automatically'
        }
        order.save(update_fields=['status', 'dns_configuration'])
        return {
            "status": "success", 
            "message": "Mock order marked as active (no DNS configuration)",
            "mock": True
        }
    
    domain_name = order.domain_name
    
    # Get Google Cloud target from settings
    google_cloud_ip = getattr(settings, 'GOOGLE_CLOUD_IP', None)
    google_cloud_domain = getattr(settings, 'GOOGLE_CLOUD_DOMAIN', None)
    
    # Use the configured target directly (no subdomain generation)
    actual_target = google_cloud_ip or google_cloud_domain
    
    if not actual_target:
        logger.error(f"[Celery] No Google Cloud target configured")
        order.status = DomainOrder.OrderStatus.DNS_ERROR
        order.error_message = "Google Cloud target not configured (set GOOGLE_CLOUD_IP or GOOGLE_CLOUD_DOMAIN)"
        order.save(update_fields=['status', 'error_message'])
        return {"status": "error", "message": "Google Cloud target not configured"}
    
    # Initialize OVH client
    try:
        ovh_client = ovh.Client(
            endpoint=settings.OVH_ENDPOINT,
            application_key=settings.OVH_APPLICATION_KEY,
            application_secret=settings.OVH_APPLICATION_SECRET,
            consumer_key=settings.OVH_CONSUMER_KEY,
        )
    except Exception as e:
        logger.error(f'[Celery] Failed to initialize OVH client: {e}')
        order.status = DomainOrder.OrderStatus.DNS_ERROR
        order.error_message = f"Failed to initialize OVH client: {str(e)}"
        order.save(update_fields=['status', 'error_message'])
        return {"status": "error", "message": "OVH client initialization failed"}
    
    dns_records = []
    
    try:
        # Wait for domain to be fully provisioned in OVH system
        import time
        wait_time = 30 if self.request.retries == 0 else 10
        logger.info(f"[Celery] Waiting {wait_time}s for domain provisioning...")
        time.sleep(wait_time)
        
        # Verify domain exists in OVH system
        try:
            domain_info = ovh_client.get(f'/domain/{domain_name}')
            logger.info(f"[Celery] Domain {domain_name} found in OVH system: {domain_info.get('nameServerType', 'N/A')}")
        except ovh.exceptions.ResourceNotFoundError:
            logger.warning(f"[Celery] Domain {domain_name} not yet available in OVH API")
            raise  # Will trigger retry
        
        # STEP 1: Create Cloudflare zone and get nameservers
        logger.info(f"[Celery] Step 1: Creating Cloudflare zone for {domain_name}")
        cf_headers = {
            'Authorization': f'Bearer {settings.CLOUDFLARE_API_TOKEN}',
            'Content-Type': 'application/json',
        }
        
        # Create zone in Cloudflare
        cf_create_zone = requests.post(
            'https://api.cloudflare.com/client/v4/zones',
            headers=cf_headers,
            json={
                'name': domain_name,
                'account': {'id': settings.CLOUDFLARE_ACCOUNT_ID},
                'jump_start': True,  # Auto-scan existing DNS records
            }
        )
        
        if cf_create_zone.status_code == 200:
            cf_zone_data = cf_create_zone.json()['result']
            cf_zone_id = cf_zone_data['id']
            cf_nameservers = cf_zone_data['name_servers']
            logger.info(f"[Celery] Cloudflare zone created: {cf_zone_id}")
            logger.info(f"[Celery] Cloudflare nameservers: {cf_nameservers}")
        else:
            # Zone might already exist or other error - try to get existing zone
            logger.info(f"[Celery] Cloudflare zone creation returned {cf_create_zone.status_code}, checking for existing zone")
            cf_zones = requests.get(
                f'https://api.cloudflare.com/client/v4/zones?name={domain_name}',
                headers=cf_headers
            )
            
            if cf_zones.status_code == 200 and cf_zones.json()['result']:
                cf_zone_data = cf_zones.json()['result'][0]
                cf_zone_id = cf_zone_data['id']
                cf_nameservers = cf_zone_data['name_servers']
                logger.info(f"[Celery] Using existing zone: {cf_zone_id}")
            else:
                error_msg = cf_create_zone.json().get('errors', [{}])[0].get('message', 'Unknown error')
                raise Exception(f"Failed to create/find Cloudflare zone: {error_msg}")
        
        # STEP 2: Update OVH nameservers to Cloudflare
        logger.info(f"[Celery] Step 2: Updating OVH nameservers to Cloudflare")
        try:
            # Change nameservers to Cloudflare (OVH API doesn't need toDelete parameter)
            result = ovh_client.post(
                f'/domain/{domain_name}/nameServers/update',
                nameServers=[
                    {'host': cf_nameservers[0]},
                    {'host': cf_nameservers[1]}
                ]
            )
            task_id = result.get('id', 'N/A')
            logger.info(f"[Celery] OVH nameserver update task created: {task_id}")
            logger.info(f"[Celery] Nameservers will be changed to: {cf_nameservers}")
        except Exception as e:
            logger.warning(f"[Celery] Failed to update OVH nameservers (may already be set): {e}")
        
        # STEP 3: Configure DNS records in Cloudflare pointing to Google Cloud
        logger.info(f"[Celery] Step 3: Creating DNS records in Cloudflare")
        
        # Clear existing A/AAAA/CNAME records for @ and www
        cf_records = requests.get(
            f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/dns_records',
            headers=cf_headers
        )
        for record in cf_records.json().get('result', []):
            if record['name'] in [domain_name, f'www.{domain_name}'] and record['type'] in ['A', 'AAAA', 'CNAME']:
                requests.delete(
                    f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/dns_records/{record["id"]}',
                    headers=cf_headers
                )
                logger.info(f"[Celery] Deleted existing {record['type']} record: {record['name']}")
        
        # Add DNS records (dummy IPs for Worker proxy - actual routing handled by Worker)
        # When using Worker Routes, the actual IP doesn't matter because Cloudflare proxy intercepts all traffic
        dummy_ip = '192.0.2.1'  # Reserved IP for documentation/testing
        
        for subdomain in ['@', 'www']:
            record_name = domain_name if subdomain == '@' else f'www.{domain_name}'
            cf_dns = requests.post(
                f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/dns_records',
                headers=cf_headers,
                json={
                    'type': 'A',
                    'name': subdomain,
                    'content': dummy_ip,
                    'ttl': 1,  # Auto
                    'proxied': True  # MUST be proxied for Worker to intercept traffic
                }
            )
            if cf_dns.status_code == 200:
                dns_records.append({
                    'type': 'A',
                    'name': record_name,
                    'content': dummy_ip,
                    'proxied': True,
                    'note': 'Dummy IP - actual routing handled by Cloudflare Worker'
                })
                logger.info(f"[Celery] Created proxied A record: {record_name} -> {dummy_ip} (Worker routing)")
        
        # STEP 4: Get target URL from order.target or use default site subdomain
        logger.info(f"[Celery] Step 4: Determining redirect target")
        
        # Get the target from the order's target field
        redirect_target = order.target
        if not redirect_target:
            # If no target set, use site's subdomain as default
            redirect_target = f"{order.site.identifier}.youreasysite.com"
            logger.info(f"[Celery] No target set, using site subdomain: {redirect_target}")
        else:
            logger.info(f"[Celery] Using configured target: {redirect_target}")
        
        # STEP 5: Configure redirect using Cloudflare Page Rules
        # Page Rules work with basic API permissions and redirect to any URL
        logger.info(f"[Celery] Step 5: Creating/updating Cloudflare Page Rules for redirect")
        
        # Get existing page rules for this zone
        existing_rules_resp = requests.get(
            f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/pagerules',
            headers=cf_headers
        )
        existing_rules = {}
        if existing_rules_resp.status_code == 200:
            for rule in existing_rules_resp.json().get('result', []):
                pattern = rule.get('targets', [{}])[0].get('constraint', {}).get('value')
                if pattern:
                    existing_rules[pattern] = rule['id']
        
        page_rules_added = []
        # Create/update redirect rules for both root and www
        for pattern in [f'{domain_name}/*', f'www.{domain_name}/*']:
            try:
                # Ensure target has https://
                target_url = redirect_target if redirect_target.startswith('http') else f'https://{redirect_target}'
                
                page_rule_config = {
                    'targets': [
                        {
                            'target': 'url',
                            'constraint': {
                                'operator': 'matches',
                                'value': pattern
                            }
                        }
                    ],
                    'actions': [
                        {
                            'id': 'forwarding_url',
                            'value': {
                                'url': f'{target_url}/$1',
                                'status_code': 301
                            }
                        }
                    ],
                    'priority': 1,
                    'status': 'active'
                }
                
                # Check if rule already exists
                if pattern in existing_rules:
                    rule_id = existing_rules[pattern]
                    logger.info(f"[Celery] Updating existing Page Rule {rule_id} for {pattern}")
                    cf_page_rule = requests.patch(
                        f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/pagerules/{rule_id}',
                        headers=cf_headers,
                        json=page_rule_config
                    )
                else:
                    logger.info(f"[Celery] Creating new Page Rule for {pattern}")
                    cf_page_rule = requests.post(
                        f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/pagerules',
                        headers=cf_headers,
                        json=page_rule_config
                    )
                
                if cf_page_rule.status_code in [200, 201]:
                    rule_id = cf_page_rule.json()['result']['id']
                    page_rules_added.append({
                        'pattern': pattern,
                        'rule_id': rule_id,
                        'target': target_url,
                        'type': 'forwarding_url',
                        'action': 'updated' if pattern in existing_rules else 'created'
                    })
                    logger.info(f"[Celery] Page Rule configured: {pattern} -> {target_url}")
                else:
                    logger.warning(f"[Celery] Failed to configure Page Rule for {pattern}: {cf_page_rule.text}")
            except Exception as e:
                logger.error(f"[Celery] Error configuring Page Rule for {pattern}: {e}")
        
        # STEP 6: (Fallback) If Page Rules failed and google_cloud_domain provided, log warning
        if not page_rules_added and google_cloud_domain:
            logger.info(f"[Celery] Step 6: Creating redirect rules (Page Rules failed - using fallback)")
            # Legacy fallback - try basic redirect
            pass
        
        # Update order status
        order.status = DomainOrder.OrderStatus.ACTIVE
        order.dns_configuration = {
            'method': 'cloudflare',
            'cloudflare_zone_id': cf_zone_id,
            'nameservers': cf_nameservers,
            'records': dns_records,
            'page_rules': page_rules_added,
            'redirect_target': redirect_target,
            'configured_at': str(time.time()),
            'message': f'Domain configured with Cloudflare DNS and Page Rules redirect (rules: {len(page_rules_added)})'
        }
        order.error_message = None
        order.save(update_fields=['status', 'dns_configuration', 'error_message'])
        
        logger.info(f"[Celery] Domain DNS configuration completed for order {order_id}")
        logger.info(f"[Celery] DNS propagation may take 24-48 hours")
        
        return {
            "status": "success",
            "order_id": order_id,
            "domain": domain_name,
            "cloudflare_zone_id": cf_zone_id,
            "nameservers": cf_nameservers,
            "records_added": len(dns_records),
            "page_rules_added": len(page_rules_added),
            "redirect_target": redirect_target
        }
        
    except ovh.exceptions.ResourceNotFoundError as exc:
        logger.error(f"[Celery] DNS zone not found for {domain_name}: {exc}")
        
        # Domain might not be provisioned yet, retry with exponential backoff
        if self.request.retries < self.max_retries:
            # Increase wait time for later retries (up to 5 minutes)
            countdown = min(60 * (self.request.retries + 1), 300)
            logger.info(f"[Celery] Retrying DNS configuration for {domain_name} (attempt {self.request.retries + 1}/{self.max_retries}) in {countdown}s")
            logger.info(f"[Celery] Note: Fresh OVH domains can take 5-10 minutes to be fully provisioned")
            raise self.retry(exc=exc, countdown=countdown)
        
        order.status = DomainOrder.OrderStatus.DNS_ERROR
        order.error_message = f"Domain not provisioned in OVH system after {self.max_retries} retries. Please try manual configuration or contact support."
        order.save(update_fields=['status', 'error_message'])
        
        return {
            "status": "error",
            "message": "DNS zone not found after maximum retries",
            "order_id": order_id
        }
        
    except Exception as exc:
        logger.exception(f"[Celery] Failed to configure DNS for order {order_id}: {exc}")
        
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        
        order.status = DomainOrder.OrderStatus.DNS_ERROR
        order.error_message = f"DNS configuration failed: {str(exc)}"
        order.save(update_fields=['status', 'error_message'])
        
        return {
            "status": "error",
            "message": str(exc),
            "order_id": order_id
        }


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def reconfigure_domain_target(self, order_id: int):
    """
    Reconfigure domain DNS target and proxy mode in Cloudflare.
    This updates existing domain configuration when target or proxy_mode changes.
    
    Updates:
    - DNS records (A/CNAME) to point to new target
    - Page Rules for redirects
    - Worker routing (via DNS only - Worker handles actual routing)
    
    Args:
        self: Celery task instance
        order_id: ID of the domain order to reconfigure
        
    Returns:
        dict: Reconfiguration result with status
    """
    from .models import DomainOrder
    from django.conf import settings
    import requests
    import time
    
    logger.info(f"[Celery] Starting DNS reconfiguration for order {order_id}")
    
    try:
        order = DomainOrder.objects.select_related('user', 'site').get(id=order_id)
    except DomainOrder.DoesNotExist:
        logger.error(f"[Celery] Order {order_id} not found")
        return {"status": "error", "message": "Order not found"}
    
    domain_name = order.domain_name
    target = order.target
    proxy_mode = order.proxy_mode
    
    if not target:
        logger.error(f"[Celery] No target configured for {domain_name}")
        return {"status": "error", "message": "No target configured"}
    
    # Get Zone ID (from order or fetch from Cloudflare)
    cf_zone_id = order.cloudflare_zone_id
    if not cf_zone_id:
        try:
            cf_zone_id = get_cloudflare_zone_id(settings.CLOUDFLARE_API_TOKEN, domain_name)
            order.cloudflare_zone_id = cf_zone_id
            order.save(update_fields=['cloudflare_zone_id'])
        except Exception as e:
            logger.error(f"[Celery] Could not find Zone ID for {domain_name}: {e}")
            return {"status": "error", "message": f"Domain not in Cloudflare: {domain_name}"}
    
    cf_headers = {
        'Authorization': f'Bearer {settings.CLOUDFLARE_API_TOKEN}',
        'Content-Type': 'application/json',
    }
    
    try:
        # STEP 1: Update DNS records
        logger.info(f"[Celery] Step 1: Updating DNS records for {domain_name}")
        logger.info(f"[Celery] Target: {target}, Proxy Mode: {proxy_mode}")
        
        # Get existing DNS records
        cf_records_resp = requests.get(
            f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/dns_records',
            headers=cf_headers
        )
        existing_records = {}
        for record in cf_records_resp.json().get('result', []):
            if record['name'] in [domain_name, f'www.{domain_name}'] and record['type'] in ['A', 'CNAME']:
                existing_records[record['name']] = record
        
        # Clean target (remove protocol, port, path)
        clean_target = target.replace('http://', '').replace('https://', '').split('/')[0].split(':')[0]
        
        # Determine if target is IP address or domain
        import re
        is_ip = re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', clean_target)
        
        if is_ip:
            # Target is an IP address - use A record with that IP
            record_type = 'A'
            record_content = clean_target
            logger.info(f"[Celery] Detected IP address target: {clean_target}")
        elif '.' in clean_target and len(clean_target.split('.')) >= 2:
            # Target looks like a domain (e.g., youreasysite-production.up.railway.app)
            record_type = 'CNAME'
            record_content = clean_target
            logger.info(f"[Celery] Detected domain target: {clean_target}")
        else:
            # Fallback: use dummy IP for Worker routing
            record_type = 'A'
            record_content = '192.0.2.1'
            logger.info(f"[Celery] Using dummy IP for Worker routing (invalid target: {clean_target})")
        
        dns_updates = []
        for subdomain in ['@', 'www']:
            record_name = domain_name if subdomain == '@' else f'www.{domain_name}'
            
            record_data = {
                'type': record_type,
                'name': subdomain,
                'content': record_content,
                'ttl': 1,  # Auto
                'proxied': True  # Always proxied for Cloudflare features
            }
            
            if record_name in existing_records:
                # Update existing record
                record_id = existing_records[record_name]['id']
                logger.info(f"[Celery] Updating {record_type} record: {record_name} -> {record_content}")
                cf_dns = requests.put(
                    f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/dns_records/{record_id}',
                    headers=cf_headers,
                    json=record_data
                )
            else:
                # Create new record
                logger.info(f"[Celery] Creating {record_type} record: {record_name} -> {record_content}")
                cf_dns = requests.post(
                    f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/dns_records',
                    headers=cf_headers,
                    json=record_data
                )
            
            if cf_dns.status_code in [200, 201]:
                dns_updates.append(f"{record_name} -> {record_content}")
                logger.info(f"[Celery] DNS record updated successfully")
            else:
                logger.error(f"[Celery] Failed to update DNS record: {cf_dns.text}")
        
        # STEP 2: Update/Remove Page Rules based on proxy_mode
        logger.info(f"[Celery] Step 2: Configuring Page Rules (proxy_mode={proxy_mode})")
        
        # Get existing page rules
        existing_rules_resp = requests.get(
            f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/pagerules',
            headers=cf_headers
        )
        existing_rules = {}
        if existing_rules_resp.status_code == 200:
            for rule in existing_rules_resp.json().get('result', []):
                pattern = rule.get('targets', [{}])[0].get('constraint', {}).get('value')
                if pattern and domain_name in pattern:
                    existing_rules[pattern] = rule
        
        page_rules_result = []
        
        if not proxy_mode:
            # REDIRECT MODE: Create/update Page Rules for 301 redirect
            target_url = target if target.startswith('http') else f'https://{target}'
            
            for pattern in [f'{domain_name}/*', f'www.{domain_name}/*']:
                page_rule_config = {
                    'targets': [{
                        'target': 'url',
                        'constraint': {
                            'operator': 'matches',
                            'value': pattern
                        }
                    }],
                    'actions': [{
                        'id': 'forwarding_url',
                        'value': {
                            'url': f'{target_url}/$1',
                            'status_code': 301
                        }
                    }],
                    'priority': 1,
                    'status': 'active'
                }
                
                if pattern in existing_rules:
                    rule_id = existing_rules[pattern]['id']
                    logger.info(f"[Celery] Updating Page Rule for {pattern}")
                    cf_rule = requests.patch(
                        f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/pagerules/{rule_id}',
                        headers=cf_headers,
                        json=page_rule_config
                    )
                else:
                    logger.info(f"[Celery] Creating Page Rule for {pattern}")
                    cf_rule = requests.post(
                        f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/pagerules',
                        headers=cf_headers,
                        json=page_rule_config
                    )
                
                if cf_rule.status_code in [200, 201]:
                    page_rules_result.append(f"{pattern} -> {target_url} (301 redirect)")
                    logger.info(f"[Celery] Page Rule configured successfully")
                else:
                    logger.warning(f"[Celery] Failed to configure Page Rule: {cf_rule.text}")
        else:
            # PROXY MODE: Remove Page Rules (Worker handles routing)
            for pattern, rule in existing_rules.items():
                rule_id = rule['id']
                logger.info(f"[Celery] Removing Page Rule for {pattern} (proxy mode active)")
                requests.delete(
                    f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/pagerules/{rule_id}',
                    headers=cf_headers
                )
                page_rules_result.append(f"{pattern} - removed (proxy mode)")
        
        # STEP 3: Configure SSL/TLS settings for HTTPS
        logger.info(f"[Celery] Step 3: Configuring SSL/TLS settings")
        ssl_config_result = []
        
        # 3.1: Set SSL/TLS mode to "Full (strict)" for secure backend connection
        ssl_mode_data = {'value': 'full'}  # full = validates SSL cert on origin
        ssl_mode_resp = requests.patch(
            f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/settings/ssl',
            headers=cf_headers,
            json=ssl_mode_data
        )
        if ssl_mode_resp.status_code == 200:
            ssl_config_result.append("SSL mode: Full")
            logger.info(f"[Celery] SSL/TLS mode set to 'Full'")
        else:
            logger.warning(f"[Celery] Failed to set SSL mode: {ssl_mode_resp.text}")
        
        # 3.2: Enable "Always Use HTTPS" (HTTP → HTTPS redirect)
        https_redirect_data = {'value': 'on'}
        https_redirect_resp = requests.patch(
            f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/settings/always_use_https',
            headers=cf_headers,
            json=https_redirect_data
        )
        if https_redirect_resp.status_code == 200:
            ssl_config_result.append("Always Use HTTPS: enabled")
            logger.info(f"[Celery] Always Use HTTPS enabled")
        else:
            logger.warning(f"[Celery] Failed to enable Always Use HTTPS: {https_redirect_resp.text}")
        
        # 3.3: Enable "Automatic HTTPS Rewrites"
        https_rewrite_data = {'value': 'on'}
        https_rewrite_resp = requests.patch(
            f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/settings/automatic_https_rewrites',
            headers=cf_headers,
            json=https_rewrite_data
        )
        if https_rewrite_resp.status_code == 200:
            ssl_config_result.append("Automatic HTTPS Rewrites: enabled")
            logger.info(f"[Celery] Automatic HTTPS Rewrites enabled")
        else:
            logger.warning(f"[Celery] Failed to enable HTTPS Rewrites: {https_rewrite_resp.text}")
        
        # 3.4: Set minimum TLS version to 1.2
        tls_version_data = {'value': '1.2'}
        tls_version_resp = requests.patch(
            f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/settings/min_tls_version',
            headers=cf_headers,
            json=tls_version_data
        )
        if tls_version_resp.status_code == 200:
            ssl_config_result.append("Min TLS version: 1.2")
            logger.info(f"[Celery] Minimum TLS version set to 1.2")
        else:
            logger.warning(f"[Celery] Failed to set TLS version: {tls_version_resp.text}")
        
        # STEP 4: Purge Cloudflare cache
        logger.info(f"[Celery] Step 4: Purging Cloudflare cache")
        purge_cloudflare_cache.delay(domain_name)
        
        # Update order configuration
        order.dns_configuration = order.dns_configuration or {}
        order.dns_configuration.update({
            'last_reconfigured_at': str(time.time()),
            'target': target,
            'proxy_mode': proxy_mode,
            'dns_updates': dns_updates,
            'page_rules': page_rules_result,
            'ssl_config': ssl_config_result,
            'method': 'worker_routing' if proxy_mode else 'page_rule_redirect'
        })
        order.save(update_fields=['dns_configuration'])
        
        logger.info(f"[Celery] DNS reconfiguration completed for {domain_name}")
        
        return {
            "status": "success",
            "domain": domain_name,
            "target": target,
            "proxy_mode": proxy_mode,
            "dns_updates": dns_updates,
            "page_rules": page_rules_result,
            "ssl_config": ssl_config_result,
            "zone_id": cf_zone_id
        }
        
    except Exception as exc:
        logger.exception(f"[Celery] Failed to reconfigure DNS for {domain_name}: {exc}")
        
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        
        return {
            "status": "error",
            "message": str(exc),
            "domain": domain_name
        }


def get_cloudflare_zone_id(api_token, zone_name):
    """
    Get Cloudflare Zone ID for a given domain.
    This function caches the result to avoid repeated API calls.
    This is a HELPER FUNCTION, not a Celery task.
    
    Args:
        api_token: Cloudflare API token
        zone_name: Domain name (e.g., 'youreasysite.pl')
        
    Returns:
        str: Zone ID
        
    Raises:
        Exception: If zone not found or API error
    """
    import requests
    from django.core.cache import cache
    
    # Try to get from cache first (cache for 1 hour)
    cache_key = f"cf_zone_id_{zone_name}"
    cached_zone_id = cache.get(cache_key)
    if cached_zone_id:
        logger.info(f"[Cloudflare] Using cached Zone ID for {zone_name}: {cached_zone_id}")
        return cached_zone_id
    
    # Fetch from Cloudflare API
    logger.info(f"[Cloudflare] Fetching Zone ID for {zone_name}")
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"https://api.cloudflare.com/client/v4/zones?name={zone_name}",
        headers=headers,
        timeout=10
    )
    response.raise_for_status()
    
    result = response.json()
    
    if not result.get('success') or not result.get('result'):
        raise Exception(f"Zone not found for domain: {zone_name}")
    
    zone_id = result['result'][0]['id']
    
    # Cache for 1 hour
    cache.set(cache_key, zone_id, 3600)
    logger.info(f"[Cloudflare] Found Zone ID for {zone_name}: {zone_id}")
    
    return zone_id


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def purge_cloudflare_cache(self, domain_name: str):
    """
    Purge Cloudflare cache for a specific domain when configuration changes.
    This ensures Worker immediately sees updated target/proxy_mode settings.
    
    Args:
        self: Celery task instance
        domain_name: Domain to purge cache for (e.g., 'dronecomponentsfpv.online')
        
    Returns:
        dict: Purge result with status
    """
    import requests
    from django.conf import settings
    
    logger.info(f"[Celery] Purging Cloudflare cache for domain: {domain_name}")
    
    # Get Cloudflare credentials from settings
    cf_api_token = getattr(settings, 'CLOUDFLARE_API_TOKEN', None)
    
    if not cf_api_token:
        logger.warning(f"[Celery] Cloudflare API token not configured - skipping cache purge")
        return {
            "status": "skipped",
            "message": "Cloudflare API token not configured"
        }
    
    try:
        # Get Zone ID for the user's custom domain (e.g., dronecomponentsfpv.online)
        # This will work for ANY domain in your Cloudflare account
        try:
            cf_zone_id = get_cloudflare_zone_id(cf_api_token, domain_name)
            logger.info(f"[Celery] Found Zone ID for {domain_name}: {cf_zone_id}")
        except Exception as e:
            logger.error(f"[Celery] Could not find Zone ID for {domain_name}: {e}")
            # If user domain not in Cloudflare, try to purge main platform cache instead
            logger.info(f"[Celery] Trying to purge youreasysite.pl cache instead")
            try:
                cf_zone_id = get_cloudflare_zone_id(cf_api_token, 'youreasysite.pl')
            except:
                try:
                    cf_zone_id = get_cloudflare_zone_id(cf_api_token, 'youreasysite.com')
                except Exception as main_error:
                    logger.error(f"[Celery] Could not find any zone: {main_error}")
                    return {
                        "status": "error",
                        "message": f"Domain not found in Cloudflare account: {domain_name}"
                    }
        
        # Purge all cache for this domain (everything: *, www.*, etc.)
        purge_data = {
            "purge_everything": True
        }
        
        url = f"https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/purge_cache"
        headers = {
            "Authorization": f"Bearer {cf_api_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=purge_data, headers=headers, timeout=10)
        response.raise_for_status()
        
        result = response.json()
        
        if result.get('success'):
            logger.info(f"[Celery] Successfully purged all cache for {domain_name}")
            return {
                "status": "success",
                "domain": domain_name,
                "zone_id": cf_zone_id,
                "message": "All cache purged successfully"
            }
        else:
            logger.error(f"[Celery] Cloudflare API returned error: {result}")
            return {
                "status": "error",
                "message": result.get('errors', 'Unknown error'),
                "domain": domain_name
            }
            
    except requests.RequestException as e:
        logger.error(f"[Celery] Failed to purge cache for {domain_name}: {e}")
        # Retry with exponential backoff
        raise self.retry(exc=e)
    except Exception as e:
        logger.error(f"[Celery] Unexpected error purging cache for {domain_name}: {e}")
        return {
            "status": "error",
            "message": str(e),
            "domain": domain_name
        }


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def regenerate_testimonial_summary(self, site_id: int):
    """
    Regenerate AI summary for site testimonials.
    Triggered when testimonials are added or deleted.
    
    Args:
        self: Celery task instance
        site_id: ID of the site to generate summary for
        
    Returns:
        dict: Summary generation result
    """
    from .models import Site, Testimonial, TestimonialSummary
    from .ai_services_new import get_site_editor_agent, AIServiceException
    from django.db.models import Avg
    
    logger.info(f"[Celery] Generating testimonial summary for site {site_id}")
    
    try:
        site = Site.objects.get(id=site_id)
    except Site.DoesNotExist:
        logger.error(f"[Celery] Site {site_id} not found")
        return {"status": "error", "message": "Site not found"}
    
    # Get last 10 approved testimonials
    testimonials = Testimonial.objects.filter(
        site=site,
        is_approved=True
    ).order_by('-created_at')[:10]
    
    if not testimonials.exists():
        logger.info(f"[Celery] No testimonials found for site {site_id}")
        # Delete existing summary if no testimonials
        TestimonialSummary.objects.filter(site=site).delete()
        return {"status": "success", "message": "No testimonials to summarize"}
    
    # Calculate statistics
    total_count = testimonials.count()
    avg_rating = testimonials.aggregate(avg=Avg('rating'))['avg'] or 0
    
    # Prepare data for AI
    testimonials_text = "\n\n".join([
        f"Ocena: {t.rating}/5\nAutor: {t.author_name}\nTreść: {t.content}"
        for t in testimonials
    ])
    
    try:
        agent_service = get_site_editor_agent()
        
        # Generate public summary (short, for site visitors)
        public_prompt = f"""Na podstawie poniższych {total_count} opinii napisz krótkie podsumowanie (2-3 zdania) w formie stwierdzenia.
Skoncentruj się na tym, co klienci najbardziej podkreślają i cenią. Odpowiedź ma być konkretna i pozytywna.

Przykład: "Klienci szczególnie cenią profesjonalizm i indywidualne podejście. Recenzenci podkreślają atmosferę oraz widoczne efekty po sesjach."

Opinie:
{testimonials_text}

Odpowiedz tylko samym podsumowaniem, bez wstępów i komentarzy."""
        
        public_result = agent_service.process_task(
            public_prompt,
            {},
            {'task_type': 'text_generation'}
        )
        # Handle both explanation and needs_clarification responses
        public_summary = public_result.get('explanation') or public_result.get('needs_clarification') or 'Brak podsumowania'
        
        # Generate detailed summary (for admin panel)
        detailed_prompt = f"""Przeanalizuj {total_count} opinii klientów i napisz szczegółową analizę:

Opinie:
{testimonials_text}

Wygeneruj analizę w następującym formacie:

**Najczęstsze pozytywy:**
- [wymień 3-5 najważniejszych rzeczy, które klienci chwalą]

**Obszary do poprawy:**
- [wymień ewentualne uwagi krytyczne lub sugestie, jeśli są]

**Rekomendacje:**
- [2-3 konkretne sugestie dla właściciela jak wykorzystać te opinie]

**Sentyment:** [ogólna ocena nastawienia klientów w 1-2 zdaniach]"""
        
        detailed_result = agent_service.process_task(
            detailed_prompt,
            {},
            {'task_type': 'text_generation'}
        )
        # Handle both explanation and needs_clarification responses
        detailed_summary = detailed_result.get('explanation') or detailed_result.get('needs_clarification') or 'Nie udało się wygenerować szczegółowej analizy.'
        
        # Save or update summary
        summary, created = TestimonialSummary.objects.update_or_create(
            site=site,
            defaults={
                'summary': public_summary,
                'detailed_summary': detailed_summary,
                'total_count': total_count,
                'average_rating': round(avg_rating, 2)
            }
        )
        
        action = "created" if created else "updated"
        logger.info(f"[Celery] Testimonial summary {action} for site {site_id}")
        
        return {
            "status": "success",
            "site_id": site_id,
            "action": action,
            "testimonials_analyzed": total_count
        }
        
    except AIServiceException as exc:
        logger.error(f"[Celery] AI service error generating summary: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        return {"status": "error", "message": str(exc)}
    
    except Exception as exc:
        logger.exception(f"[Celery] Failed to generate summary for site {site_id}: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        return {"status": "error", "message": str(exc)}


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_big_event_notification_emails(self, event_id: int):
    """
    Send email notifications to all newsletter subscribers when a BigEvent is published.
    This task is triggered automatically when an event is published.
    
    Args:
        self: Celery task instance
        event_id: ID of the BigEvent that was published
        
    Returns:
        dict: Email sending result with status
    """
    from .models import BigEvent, NewsletterSubscription, NewsletterAnalytics
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags
    
    logger.info(f"[Celery] Sending BigEvent notification emails for event {event_id}")
    
    try:
        event = BigEvent.objects.select_related('site', 'creator').get(id=event_id)
    except BigEvent.DoesNotExist:
        logger.error(f"[Celery] BigEvent {event_id} not found")
        return {"status": "error", "message": "Event not found"}
    
    # Check if emails were already sent
    if event.email_sent:
        logger.info(f"[Celery] Emails already sent for event {event_id}, skipping")
        return {"status": "skipped", "message": "Emails already sent"}
    
    # Get active newsletter subscribers for this site
    subscribers = NewsletterSubscription.objects.filter(
        site=event.site,
        is_active=True,
        is_confirmed=True
    )
    
    if not subscribers.exists():
        logger.info(f"[Celery] No active subscribers for site {event.site.identifier}")
        event.email_sent = True
        event.email_sent_at = timezone.now()
        event.save(update_fields=['email_sent', 'email_sent_at'])
        return {"status": "success", "message": "No subscribers", "sent_count": 0}
    
    # Prepare event data for template
    subject = f'Nowe wydarzenie: {event.title}'
    sent_count = 0
    failed_count = 0
    
    for subscriber in subscribers:
        try:
            # Create analytics tracking for this email
            analytics = NewsletterAnalytics.objects.create(subscription=subscriber)
            
            # Build tracking URLs
            tracking_pixel_url = f"{settings.BACKEND_URL}/api/v1/newsletter/track/open/{analytics.tracking_token}/"
            unsubscribe_url = f"{settings.FRONTEND_URL}/newsletter/unsubscribe/{subscriber.unsubscribe_token}"
            
            # Prepare context with single event
            context = {
                'site_name': event.site.name,
                'events': [{
                    'title': event.title,
                    'date': event.start_date.strftime('%Y-%m-%d'),
                    'location': event.location,
                    'description': event.description,
                    'price': float(event.price) if event.price else None,
                    'max_participants': event.max_participants,
                    'current_participants': event.current_participants,
                    'image_url': event.image_url,
                    'summary': event.description,  # Add summary for template
                }],
                'frequency': subscriber.get_frequency_display(),  # Add frequency
                'unsubscribe_url': unsubscribe_url,
                'tracking_pixel_url': tracking_pixel_url,
                'tracking_token': analytics.tracking_token,
                'backend_url': settings.BACKEND_URL,
                'is_big_event': True,
            }
            
            # Render email template
            html_content = render_to_string('emails/newsletter/event_newsletter.html', context)
            text_content = strip_tags(html_content)
            
            # Send email via custom task
            send_custom_email_task_async.delay(
                recipient_list=[subscriber.email],
                subject=subject,
                message=text_content,
                html_content=html_content
            )
            
            # Update subscriber stats
            subscriber.last_sent_at = timezone.now()
            subscriber.emails_sent += 1
            subscriber.save(update_fields=['last_sent_at', 'emails_sent'])
            
            sent_count += 1
            logger.debug(f"[Celery] Queued BigEvent email to {subscriber.email}")
            
        except Exception as e:
            failed_count += 1
            logger.exception(f"[Celery] Failed to send BigEvent email to {subscriber.email}: {e}")
            continue
    
    # Mark event as email sent
    event.email_sent = True
    event.email_sent_at = timezone.now()
    event.save(update_fields=['email_sent', 'email_sent_at'])
    
    logger.info(f"[Celery] BigEvent notification complete: {sent_count} sent, {failed_count} failed")
    
    return {
        "status": "success",
        "event_id": event_id,
        "sent_count": sent_count,
        "failed_count": failed_count
    }


@shared_task(bind=True, max_retries=3)
def send_welcome_newsletter(self, subscription_id):
    """
    Send immediate welcome newsletter to a newly confirmed subscriber.
    Includes all upcoming events from their site.
    """
    from datetime import datetime
    from .models import NewsletterSubscription, NewsletterAnalytics, Site
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags
    from django.conf import settings
    
    try:
        logger.info(f"[Celery] Sending welcome newsletter for subscription {subscription_id}")
        
        # Get subscription
        try:
            subscription = NewsletterSubscription.objects.select_related('site').get(id=subscription_id)
        except NewsletterSubscription.DoesNotExist:
            logger.error(f"[Celery] Subscription {subscription_id} not found")
            return {"status": "error", "message": "Subscription not found"}
        
        if not subscription.is_confirmed or not subscription.is_active:
            logger.warning(f"[Celery] Subscription {subscription_id} is not confirmed or active")
            return {"status": "skipped", "message": "Not confirmed or not active"}
        
        # Extract events from site's template_config
        site = subscription.site
        template_config = site.template_config or {}
        
        # Support both old and new template_config structure
        pages = template_config.get('site', {}).get('pages', [])
        if not pages:
            # Fallback to old structure
            pages = template_config.get('pages', [])
        
        # Find all Events modules across all pages
        all_events = []
        for page in pages:
            modules = page.get('modules', [])
            for module in modules:
                if module.get('type') == 'events':
                    content = module.get('content', {})
                    module_events = content.get('events', [])
                    all_events.extend(module_events)
        
        # Filter upcoming events only
        now = timezone.now()
        upcoming_events = []
        for event in all_events:
            event_date_str = event.get('date')
            if event_date_str:
                try:
                    event_date = datetime.strptime(event_date_str, '%Y-%m-%d').replace(tzinfo=dt_timezone.utc)
                    if event_date >= now:
                        upcoming_events.append(event)
                except ValueError:
                    continue
        
        # Sort by date
        upcoming_events.sort(key=lambda e: e.get('date', ''))
        
        # Limit to 10 events
        upcoming_events = upcoming_events[:10]
        
        if not upcoming_events:
            logger.info(f"[Celery] No upcoming events for subscription {subscription_id}, skipping welcome email")
            return {"status": "skipped", "message": "No upcoming events"}
        
        # Create analytics tracking record
        analytics = NewsletterAnalytics.objects.create(subscription=subscription)
        
        # Build tracking URLs
        tracking_pixel_url = f"{settings.BACKEND_URL}/api/v1/newsletter/track/open/{analytics.tracking_token}/"
        unsubscribe_url = f"{settings.FRONTEND_URL}/newsletter/unsubscribe/{subscription.unsubscribe_token}"
        
        context = {
            'site_name': subscription.site.name,
            'events': upcoming_events,
            'unsubscribe_url': unsubscribe_url,
            'frequency': subscription.get_frequency_display(),
            'tracking_pixel_url': tracking_pixel_url,
            'tracking_token': analytics.tracking_token,
            'backend_url': settings.BACKEND_URL,
            'is_welcome': True,  # Flag for welcome email
        }
        
        # Render email
        html_content = render_to_string('emails/newsletter/event_newsletter.html', context)
        text_content = strip_tags(html_content)
        
        # Send email
        subject = f"Witaj w newsletterze - {subscription.site.name}"
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[subscription.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        # Update subscription counters
        subscription.last_sent_at = now
        subscription.emails_sent += 1
        subscription.save(update_fields=['last_sent_at', 'emails_sent'])
        
        logger.info(f"[Celery] Welcome newsletter sent to {subscription.email} for site {subscription.site.identifier}")
        
        return {
            "status": "success",
            "subscription_id": subscription_id,
            "email": subscription.email,
            "events_count": len(upcoming_events)
        }
        
    except Exception as exc:
        logger.exception(f"[Celery] Welcome newsletter task failed: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=60)
        return {"status": "error", "message": str(exc)}


@shared_task
def send_random_test_notification():
    """
    Send a random test notification to all platform users.
    This task runs every 15 minutes for testing purposes.
    """
    import random
    from .models import PlatformUser, Notification
    
    test_messages = [
        "🎉 Nowa rezerwacja na jutro o 10:00",
        "📧 Otrzymałeś nową wiadomość od klienta",
        "⏰ Przypomnienie: spotkanie za 30 minut",
        "✅ Twoja strona została zaktualizowana",
        "👤 Nowy użytkownik dołączył do zespołu",
        "📊 Raport miesięczny jest gotowy",
        "🔔 Masz 3 nowe powiadomienia",
        "💡 Sprawdź nowe funkcje w edytorze",
    ]
    
    try:
        users = PlatformUser.objects.all()
        message = random.choice(test_messages)
        
        for user in users:
            Notification.objects.create(
                user=user,
                message=message,
                is_read=False
            )
        
        logger.info(f"[Celery] Sent test notification to {users.count()} users: {message}")
        return {"status": "success", "users_count": users.count(), "message": message}
    
    except Exception as exc:
        logger.exception(f"[Celery] Failed to send test notification: {exc}")
        return {"status": "error", "message": str(exc)}


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def sync_cloudflare_domain_status(self):
    """
    Periodically sync domain statuses from Cloudflare API.
    Runs every 10 minutes to check domain activation status.
    
    - Updates domain status in database
    - Triggers DNS configuration when domain becomes active
    - Handles errors and status changes
    """
    from .models import DomainOrder
    import requests
    
    logger.info("[Celery] Starting Cloudflare domain status sync")
    
    try:
        # Get all domains that are not yet active
        pending_domains = DomainOrder.objects.filter(
            status__in=['free', 'pending', 'pending_payment']
        ).exclude(cloudflare_zone_id__isnull=True).exclude(cloudflare_zone_id='')
        
        cf_headers = {
            'Authorization': f'Bearer {settings.CLOUDFLARE_API_TOKEN}',
            'Content-Type': 'application/json',
        }
        
        synced_count = 0
        activated_count = 0
        error_count = 0
        
        for domain_order in pending_domains:
            try:
                # Query Cloudflare for zone status
                cf_response = requests.get(
                    f'https://api.cloudflare.com/client/v4/zones/{domain_order.cloudflare_zone_id}',
                    headers=cf_headers,
                    timeout=10
                )
                
                if cf_response.status_code != 200:
                    logger.warning(f"[Celery] Failed to get status for {domain_order.domain_name}: {cf_response.status_code}")
                    continue
                
                zone_data = cf_response.json()['result']
                zone_status = zone_data.get('status')
                nameservers = zone_data.get('name_servers', [])
                
                previous_status = domain_order.status
                
                # Update status based on Cloudflare response
                if zone_status == 'active' and previous_status != 'active':
                    domain_order.status = 'active'
                    domain_order.cloudflare_nameservers = nameservers
                    domain_order.save(update_fields=['status', 'cloudflare_nameservers'])
                    
                    # Trigger DNS configuration
                    configure_domain_dns.delay(domain_order.id)
                    logger.info(f"[Celery] Domain {domain_order.domain_name} activated - DNS config triggered")
                    activated_count += 1
                    
                elif zone_status == 'pending' and previous_status != 'pending':
                    domain_order.status = 'pending'
                    domain_order.cloudflare_nameservers = nameservers
                    domain_order.save(update_fields=['status', 'cloudflare_nameservers'])
                    logger.info(f"[Celery] Domain {domain_order.domain_name} still pending")
                    
                elif zone_status in ['moved', 'deleted']:
                    domain_order.status = 'error'
                    domain_order.error_message = f'Cloudflare zone status: {zone_status}'
                    domain_order.save(update_fields=['status', 'error_message'])
                    logger.error(f"[Celery] Domain {domain_order.domain_name} error: {zone_status}")
                    error_count += 1
                
                synced_count += 1
                
            except Exception as e:
                logger.error(f"[Celery] Error syncing domain {domain_order.domain_name}: {e}")
                error_count += 1
                continue
        
        logger.info(f"[Celery] Domain sync complete: {synced_count} synced, {activated_count} activated, {error_count} errors")
        
        return {
            "status": "success",
            "synced": synced_count,
            "activated": activated_count,
            "errors": error_count
        }
        
    except Exception as exc:
        logger.exception(f"[Celery] Domain sync task failed: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc, countdown=300)
        return {"status": "error", "message": str(exc)}


