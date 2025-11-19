"""Celery tasks for asynchronous media processing and notifications."""

import base64
import json
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


@shared_task(bind=True, max_retries=2, default_retry_delay=60)
def execute_complex_ai_task(self, user_prompt: str, site_config: dict, user_id: int, context: dict = None):
    """
    Execute complex AI task using Claude in background.
    Sends complete modified site config via WebSocket when done.
    
    Args:
        self: Celery task instance
        user_prompt: User's command/request
        site_config: Current FULL site configuration
        user_id: ID of the user who initiated the request
        context: Optional additional context
        
    Returns:
        dict: Task result with status
    """
    from .ai_services import get_flash_service, AIServiceException
    from django.core.cache import cache
    import json
    
    logger.info(f"[Celery] Starting AI task for user {user_id}: {user_prompt[:50]}...")
    logger.info(f"[Celery] Task ID: {self.request.id}")
    
    cache_key = f'ai_task_result_{user_id}_{self.request.id}'
    logger.info(f"[Celery] Cache key will be: {cache_key}")
    
    try:
        # Use Flash for all tasks
        flash_service = get_flash_service()
        result = flash_service.process_task(user_prompt, site_config, context)
        
        status = result.get('status', 'success')
        logger.info(f"[Celery] Flash result status: {status}")
        
        # CLARIFICATION NEEDED - ask user for more details
        if status == 'clarification':
            question = result.get('question', 'Proszę doprecyzuj co chcesz zmienić')
            logger.info(f"[Celery] Clarification needed: {question}")
            
            result_data = {
                'status': 'clarification',
                'question': question,
                'prompt': user_prompt,
                'task_id': self.request.id
            }
            cache.set(cache_key, json.dumps(result_data), timeout=300)
            
            return {
                "status": "clarification",
                "question": question,
                "prompt": user_prompt,
                "user_id": user_id,
                "task_id": self.request.id
            }
        
        logger.info(f"[Celery] Flash returned result with keys: {list(result.keys())}")
        logger.info(f"[Celery] Site config present: {('site' in result)}, Explanation: {result.get('explanation', 'N/A')[:100]}")
        
        # Store result in cache for frontend to poll (5 minutes TTL)
        result_data = {
            'status': 'success',
            'site': result.get('site'),
            'explanation': result.get('explanation', 'Zmiany wprowadzone pomyślnie'),
            'prompt': user_prompt,
            'task_id': self.request.id
        }
        
        cache.set(cache_key, json.dumps(result_data), timeout=300)
        logger.info(f"[Celery] Result stored in cache with key: {cache_key}")
        
        return {
            "status": "success",
            "prompt": user_prompt,
            "user_id": user_id,
            "task_id": self.request.id
        }
        
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
            # Change nameservers to Cloudflare
            ovh_client.post(
                f'/domain/{domain_name}/nameServers/update',
                nameServers=[
                    {'host': cf_nameservers[0], 'toDelete': False},
                    {'host': cf_nameservers[1], 'toDelete': False}
                ]
            )
            logger.info(f"[Celery] OVH nameservers updated to Cloudflare: {cf_nameservers}")
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
        
        # Add DNS records
        if google_cloud_ip:
            # Use A record pointing to Google Cloud IP
            for subdomain in ['@', 'www']:
                record_name = domain_name if subdomain == '@' else f'www.{domain_name}'
                cf_dns = requests.post(
                    f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/dns_records',
                    headers=cf_headers,
                    json={
                        'type': 'A',
                        'name': subdomain,
                        'content': google_cloud_ip,
                        'ttl': 1,  # Auto
                        'proxied': True  # Enable Cloudflare proxy (SSL, caching, DDoS protection)
                    }
                )
                if cf_dns.status_code == 200:
                    dns_records.append({
                        'type': 'A',
                        'name': record_name,
                        'content': google_cloud_ip,
                        'proxied': True
                    })
                    logger.info(f"[Celery] Created A record: {record_name} -> {google_cloud_ip}")
        else:
            # Use CNAME for www subdomain pointing to site-specific subdomain
            cf_dns = requests.post(
                f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/dns_records',
                headers=cf_headers,
                json={
                    'type': 'CNAME',
                    'name': 'www',
                    'content': actual_target,
                    'ttl': 1,
                    'proxied': True
                }
            )
            if cf_dns.status_code == 200:
                dns_records.append({
                    'type': 'CNAME',
                    'name': f'www.{domain_name}',
                    'content': actual_target,
                    'proxied': True
                })
                logger.info(f"[Celery] Created CNAME record: www.{domain_name} -> {actual_target}")
            
            # For root domain, use CNAME flattening or redirect
            logger.warning(f"[Celery] Root domain CNAME not supported, using Cloudflare redirect rule")
        
        # STEP 4: (Optional) Add redirect rule from root to www if using CNAME
        if not google_cloud_ip and google_cloud_domain:
            logger.info(f"[Celery] Step 4: Creating redirect rule from @ to {actual_target}")
            # Cloudflare Page Rules API to redirect both root and www to target domain
            for pattern in [f'{domain_name}/*', f'www.{domain_name}/*']:
                cf_page_rule = requests.post(
                    f'https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/pagerules',
                    headers=cf_headers,
                    json={
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
                                    'url': f'https://{actual_target}/$1',
                                    'status_code': 301
                                }
                            }
                        ],
                        'priority': 1,
                        'status': 'active'
                    }
                )
                if cf_page_rule.status_code == 200:
                    source = pattern.replace('/*', '')
                    logger.info(f"[Celery] Created redirect rule: {source} -> {actual_target}")
                    dns_records.append({
                        'type': 'PAGE_RULE',
                        'description': f'Redirect {source} to {actual_target}'
                    })
        
        # Update order status
        order.status = DomainOrder.OrderStatus.ACTIVE
        order.dns_configuration = {
            'method': 'cloudflare',
            'cloudflare_zone_id': cf_zone_id,
            'nameservers': cf_nameservers,
            'records': dns_records,
            'target': actual_target,
            'configured_at': str(time.time()),
            'message': 'Domain configured with Cloudflare DNS pointing to Google Cloud'
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
            "target": actual_target
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

