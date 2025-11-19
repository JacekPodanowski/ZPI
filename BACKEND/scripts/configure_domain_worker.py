#!/usr/bin/env python
"""
Script to manually configure DNS for existing domain order using Cloudflare Worker.

Usage:
    docker exec site777_django_app python scripts/configure_domain_worker.py dronecomponentsfpv.online
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'site_project.settings')
django.setup()

from api.models import DomainOrder
from api.tasks import configure_domain_dns_cloudflare


def configure_domain(domain_name):
    """Configure DNS for a domain to use Cloudflare Worker."""
    try:
        # Find the domain order
        order = DomainOrder.objects.get(domain_name=domain_name)
        print(f"✓ Found order #{order.id} for {domain_name}")
        print(f"  Status: {order.status}")
        print(f"  Site: {order.site.name} (ID: {order.site.id})")
        print(f"  Target: {order.target or 'Not set (will use site subdomain)'}")
        print()
        
        # Trigger DNS configuration task
        print(f"🔄 Starting DNS configuration with Cloudflare Worker...")
        print(f"   This will:")
        print(f"   1. Create/update Cloudflare zone for {domain_name}")
        print(f"   2. Change OVH nameservers to Cloudflare")
        print(f"   3. Add DNS records (A @ and www → proxied)")
        print(f"   4. Configure Worker Routes for domain proxy")
        print()
        
        result = configure_domain_dns_cloudflare.delay(
            order.id,
            order.domain_name,
            order.site.id,
            None,  # google_cloud_ip - not used with Worker
            None   # google_cloud_domain - not used with Worker
        )
        
        print(f"✓ DNS configuration task started: {result.id}")
        print(f"  Task will run in background via Celery")
        print(f"  Check logs: docker logs site777_celery_worker")
        print()
        print(f"⏱  DNS propagation may take 1-2 hours (up to 48h)")
        print()
        print(f"🧪 Test after propagation:")
        print(f"   curl -L http://{domain_name}")
        print(f"   curl -L http://www.{domain_name}")
        print()
        
    except DomainOrder.DoesNotExist:
        print(f"❌ Domain order not found: {domain_name}")
        print()
        print(f"Available domains:")
        for order in DomainOrder.objects.all()[:10]:
            print(f"  - {order.domain_name} (Status: {order.status})")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python configure_domain_worker.py <domain_name>")
        print()
        print("Example:")
        print("  python configure_domain_worker.py dronecomponentsfpv.online")
        sys.exit(1)
    
    domain_name = sys.argv[1]
    configure_domain(domain_name)
