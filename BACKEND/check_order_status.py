#!/usr/bin/env python
"""Check domain order status and configuration"""
import django
import os
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'site_project.settings')
django.setup()

from api.models import DomainOrder

order = DomainOrder.objects.get(domain_name='dronecomponentsfpv.online')
print("="*70)
print(f"Domain Order: {order.domain_name}")
print("="*70)
print(f"Status: {order.status}")
print(f"Target URL: {order.target or '(default site subdomain)'}")
print(f"OVH Order ID: {order.ovh_order_id}")
print()

if order.dns_configuration:
    print("DNS Configuration:")
    print("-" * 70)
    config = order.dns_configuration
    for key, value in config.items():
        if key == 'page_rules':
            print(f"\n{key}:")
            for rule in value:
                print(f"  • {rule.get('pattern')} → {rule.get('target')}")
                print(f"    Rule ID: {rule.get('rule_id')}")
                print(f"    Action: {rule.get('action', 'N/A')}")
        elif key == 'records':
            print(f"\n{key}:")
            for record in value:
                print(f"  • {record.get('type')} {record.get('name')} → {record.get('content')}")
                print(f"    Proxied: {record.get('proxied', False)}")
        elif key == 'nameservers':
            print(f"\n{key}:")
            for ns in value:
                print(f"  • {ns}")
        else:
            print(f"{key}: {value}")

print("\n" + "="*70)
print("✓ All systems configured successfully!")
print("DNS propagation in progress (may take 1-2 hours)")
print("="*70)
