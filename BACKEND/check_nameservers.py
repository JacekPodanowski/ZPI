#!/usr/bin/env python
"""Check current nameservers for domain"""
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_config.settings')
django.setup()

from django.conf import settings
import ovh

# Initialize OVH client
ovh_client = ovh.Client(
    endpoint=settings.OVH_ENDPOINT,
    application_key=settings.OVH_APPLICATION_KEY,
    application_secret=settings.OVH_APPLICATION_SECRET,
    consumer_key=settings.OVH_CONSUMER_KEY,
)

domain = 'dronecomponentsfpv.online'

print("="*70)
print(f"Checking nameservers for: {domain}")
print("="*70)

# Get current domain info
try:
    domain_info = ovh_client.get(f'/domain/{domain}')
    print(f"\nDomain Status: {domain_info.get('nameServerType', 'N/A')}")
    
    # Get nameservers
    ns_list = ovh_client.get(f'/domain/{domain}/nameServer')
    print(f"\nCurrent Nameservers ({len(ns_list)}):")
    for ns_id in ns_list:
        ns_info = ovh_client.get(f'/domain/{domain}/nameServer/{ns_id}')
        print(f"  • {ns_info.get('host', 'N/A')} (ID: {ns_id})")
    
    print("\n" + "="*70)
    print("Expected Cloudflare nameservers:")
    print("  • linda.ns.cloudflare.com")
    print("  • norman.ns.cloudflare.com")
    print("="*70)
    
except Exception as e:
    print(f"Error: {e}")
