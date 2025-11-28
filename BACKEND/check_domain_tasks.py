#!/usr/bin/env python
"""Check domain tasks"""
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_config.settings')
django.setup()

from django.conf import settings
import ovh

ovh_client = ovh.Client(
    endpoint=settings.OVH_ENDPOINT,
    application_key=settings.OVH_APPLICATION_KEY,
    application_secret=settings.OVH_APPLICATION_SECRET,
    consumer_key=settings.OVH_CONSUMER_KEY,
)

domain = 'dronecomponentsfpv.online'

print("="*70)
print("Checking domain tasks...")
print("="*70)

try:
    # Get all tasks for this domain
    tasks = ovh_client.get(f'/domain/{domain}/task')
    print(f"\nFound {len(tasks)} tasks for domain")
    
    # Get details of recent tasks
    for task_id in tasks[-3:]:  # Last 3 tasks
        task = ovh_client.get(f'/domain/{domain}/task/{task_id}')
        print(f"\nTask ID: {task_id}")
        print(f"  Function: {task.get('function')}")
        print(f"  Status: {task.get('status')}")
        print(f"  Created: {task.get('creationDate')}")
        
        if task.get('canAccelerate'):
            print(f"  ⚡ Can be accelerated!")
            # Accelerate it
            ovh_client.post(f'/domain/{domain}/task/{task_id}/accelerate')
            print(f"  ✓ Acceleration requested")
    
    # Check current nameservers
    print("\n" + "="*70)
    print("Current nameservers:")
    ns_list = ovh_client.get(f'/domain/{domain}/nameServer')
    for ns_id in ns_list:
        ns_info = ovh_client.get(f'/domain/{domain}/nameServer/{ns_id}')
        print(f"  • {ns_info.get('host')}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print("="*70)
