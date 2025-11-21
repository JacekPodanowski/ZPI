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
    cf_zone_id = getattr(settings, 'CLOUDFLARE_ZONE_ID', None)
    
    if not cf_api_token or not cf_zone_id:
        logger.warning(f"[Celery] Cloudflare credentials not configured - skipping cache purge")
        return {
            "status": "skipped",
            "message": "Cloudflare credentials not configured"
        }
    
    try:
        # Purge cache for specific files/URLs related to this domain
        # We purge the API endpoint that Worker calls
        purge_url = f"https://youreasysite.com/api/v1/domains/resolve/{domain_name}"
        
        url = f"https://api.cloudflare.com/client/v4/zones/{cf_zone_id}/purge_cache"
        headers = {
            "Authorization": f"Bearer {cf_api_token}",
            "Content-Type": "application/json"
        }
        data = {
            "files": [purge_url]
        }
        
        response = requests.post(url, json=data, headers=headers, timeout=10)
        response.raise_for_status()
        
        result = response.json()
        
        if result.get('success'):
            logger.info(f"[Celery] Successfully purged cache for {domain_name}")
            return {
                "status": "success",
                "domain": domain_name,
                "purged_url": purge_url
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
    from .ai_services import get_flash_service, AIServiceException
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
        flash_service = get_flash_service()
        
        # Generate public summary (short, for site visitors)
        public_prompt = f"""Na podstawie poniższych {total_count} opinii napisz krótkie podsumowanie (2-3 zdania) w formie stwierdzenia.
Skoncentruj się na tym, co klienci najbardziej podkreślają i cenią. Odpowiedź ma być konkretna i pozytywna.

Przykład: "Klienci szczególnie cenią profesjonalizm i indywidualne podejście. Recenzenci podkreślają atmosferę oraz widoczne efekty po sesjach."

Opinie:
{testimonials_text}

Odpowiedz tylko samym podsumowaniem, bez wstępów i komentarzy."""
        
        public_result = flash_service.process_task(
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
        
        detailed_result = flash_service.process_task(
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


@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def send_event_newsletters(self):
    """
    Periodic task to send event newsletters based on subscription frequency.
    Checks all active subscriptions and sends newsletters with events from template_config.
    """
    from datetime import timedelta, datetime
    from .models import NewsletterSubscription, Site
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags
    
    try:
        logger.info("[Celery] Starting event newsletter sending task")
        
        now = timezone.now()
        sent_count = 0
        error_count = 0
        
        # Get all active subscriptions
        subscriptions = NewsletterSubscription.objects.filter(
            is_active=True,
            is_confirmed=True  # Only send to confirmed subscriptions
        ).select_related('site')
        
        for subscription in subscriptions:
            try:
                # Determine if it's time to send based on frequency
                should_send = False
                
                if subscription.last_sent_at is None:
                    # Never sent - send immediately
                    should_send = True
                else:
                    time_since_last = now - subscription.last_sent_at
                    
                    if subscription.frequency == 'daily' and time_since_last >= timedelta(days=1):
                        should_send = True
                    elif subscription.frequency == 'weekly' and time_since_last >= timedelta(weeks=1):
                        should_send = True
                    elif subscription.frequency == 'monthly' and time_since_last >= timedelta(days=30):
                        should_send = True
                
                if not should_send:
                    continue
                
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
                    # No upcoming events - skip but update last_sent_at to avoid checking too often
                    subscription.last_sent_at = now
                    subscription.save(update_fields=['last_sent_at'])
                    continue
                
                # Prepare email context
                from .models import NewsletterAnalytics
                
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
                }
                
                # Render email
                html_content = render_to_string('emails/event_newsletter.html', context)
                text_content = strip_tags(html_content)
                
                # Send email
                subject = f"Nowe wydarzenia - {subscription.site.name}"
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=text_content,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[subscription.email]
                )
                email.attach_alternative(html_content, "text/html")
                email.send()
                
                # Update last_sent_at and increment counter
                subscription.last_sent_at = now
                subscription.emails_sent += 1
                subscription.save(update_fields=['last_sent_at', 'emails_sent'])
                
                sent_count += 1
                logger.info(f"[Celery] Newsletter sent to {subscription.email} for site {subscription.site.identifier}")
                
            except Exception as e:
                error_count += 1
                logger.error(f"[Celery] Failed to send newsletter to {subscription.email}: {e}")
                continue
        
        result = {
            "status": "success",
            "sent_count": sent_count,
            "error_count": error_count,
            "total_checked": subscriptions.count()
        }
        
        logger.info(f"[Celery] Newsletter task completed: {result}")
        return result
        
    except Exception as exc:
        logger.exception(f"[Celery] Newsletter task failed: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        return {"status": "error", "message": str(exc)}


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_confirmation_email(self, subscription_id):
    """
    Send confirmation email for newsletter subscription (double opt-in).
    """
    from .models import NewsletterSubscription
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags
    from django.conf import settings
    
    try:
        logger.info(f"[Celery] Sending confirmation email for subscription {subscription_id}")
        
        try:
            subscription = NewsletterSubscription.objects.select_related('site').get(id=subscription_id)
        except NewsletterSubscription.DoesNotExist:
            logger.error(f"[Celery] Subscription {subscription_id} not found")
            return {"status": "error", "message": "Subscription not found"}
        
        # Build confirmation URL
        confirmation_url = f"{settings.FRONTEND_URL}/newsletter/confirm/{subscription.confirmation_token}"
        
        # Render email template
        html_content = render_to_string('emails/newsletter_confirmation.html', {
            'site_name': subscription.site.name,
            'confirmation_url': confirmation_url,
            'frequency': subscription.get_frequency_display()
        })
        text_content = strip_tags(html_content)
        
        # Send email
        msg = EmailMultiAlternatives(
            subject=f'Potwierdź subskrypcję newslettera - {subscription.site.name}',
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[subscription.email]
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        
        logger.info(f"[Celery] Confirmation email sent to {subscription.email}")
        return {
            "status": "success", 
            "subscription_id": subscription_id,
            "email": subscription.email
        }
        
    except Exception as exc:
        logger.exception(f"[Celery] Confirmation email task failed: {exc}")
        if self.request.retries < self.max_retries:
            raise self.retry(exc=exc)
        return {"status": "error", "message": str(exc)}


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
        html_content = render_to_string('emails/event_newsletter.html', context)
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

