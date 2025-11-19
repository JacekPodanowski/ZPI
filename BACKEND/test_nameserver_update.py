#!/usr/bin/env python
"""Test OVH nameserver update with correct API format"""
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'site_project.settings')
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
new_nameservers = ['linda.ns.cloudflare.com', 'norman.ns.cloudflare.com']

print("="*70)
print(f"Testing nameserver update for: {domain}")
print("="*70)

try:
    # Method 1: Using POST with just host names (no toDelete parameter)
    print("\nMethod 1: Simple nameserver list")
    result = ovh_client.post(
        f'/domain/{domain}/nameServers/update',
        nameServers=[
            {'host': new_nameservers[0]},
            {'host': new_nameservers[1]}
        ]
    )
    print(f"✓ Success! Result: {result}")
    
except Exception as e:
    print(f"✗ Method 1 failed: {e}")
    
    # Method 2: Try with nameServer (singular) parameter  
    try:
        print("\nMethod 2: Using PUT to replace all nameservers")
        # First, get current nameservers
        current_ns = ovh_client.get(f'/domain/{domain}/nameServer')
        print(f"Current nameservers: {current_ns}")
        
        # Delete old nameservers
        for ns_id in current_ns:
            try:
                ovh_client.delete(f'/domain/{domain}/nameServer/{ns_id}')
                print(f"Deleted nameserver ID: {ns_id}")
            except Exception as del_err:
                print(f"Failed to delete {ns_id}: {del_err}")
        
        # Add new nameservers
        for ns_host in new_nameservers:
            try:
                result = ovh_client.post(
                    f'/domain/{domain}/nameServer',
                    nameServer=ns_host
                )
                print(f"✓ Added nameserver: {ns_host} - ID: {result}")
            except Exception as add_err:
                print(f"✗ Failed to add {ns_host}: {add_err}")
                
    except Exception as e2:
        print(f"✗ Method 2 also failed: {e2}")

print("\n" + "="*70)
