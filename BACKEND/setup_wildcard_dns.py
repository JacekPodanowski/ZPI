"""
Cloudflare Wildcard DNS Setup Script

This script creates a wildcard DNS record (*.youreasysite.pl) in Cloudflare
to automatically route all subdomains to the main site frontend.

Run this ONCE to set up the wildcard DNS:
    python manage.py shell < setup_wildcard_dns.py
"""

import os
import requests
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_config.settings')
django.setup()

from django.conf import settings

def get_cloudflare_zone_id(api_token, zone_name):
    """Get Cloudflare Zone ID for a domain."""
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json',
    }
    
    response = requests.get(
        f'https://api.cloudflare.com/client/v4/zones?name={zone_name}',
        headers=headers
    )
    
    if response.status_code == 200:
        zones = response.json().get('result', [])
        if zones:
            return zones[0]['id']
    
    raise Exception(f"Zone not found for {zone_name}")


def create_wildcard_dns_record(api_token, zone_id, base_domain, target):
    """Create wildcard DNS record (*.youreasysite.pl) pointing to target."""
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json',
    }
    
    # Get existing records
    response = requests.get(
        f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records?type=CNAME&name=*.{base_domain}',
        headers=headers
    )
    
    existing_records = response.json().get('result', [])
    
    if existing_records:
        record_id = existing_records[0]['id']
        print(f"✓ Wildcard DNS record already exists (ID: {record_id})")
        print(f"  Current target: {existing_records[0]['content']}")
        
        # Update if target changed
        if existing_records[0]['content'] != target:
            update_response = requests.put(
                f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records/{record_id}',
                headers=headers,
                json={
                    'type': 'CNAME',
                    'name': f'*.{base_domain}',
                    'content': target,
                    'ttl': 1,  # Auto (fastest propagation)
                    'proxied': True  # Use Cloudflare proxy for SSL, DDoS protection
                }
            )
            if update_response.status_code == 200:
                print(f"✓ Updated wildcard DNS to point to: {target}")
            else:
                print(f"✗ Failed to update: {update_response.json()}")
        return record_id
    
    # Create new wildcard record
    create_response = requests.post(
        f'https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records',
        headers=headers,
        json={
            'type': 'CNAME',
            'name': f'*.{base_domain}',
            'content': target,
            'ttl': 1,  # Auto (fastest propagation)
            'proxied': True  # Use Cloudflare proxy
        }
    )
    
    if create_response.status_code == 200:
        result = create_response.json()['result']
        print(f"✓ Created wildcard DNS record:")
        print(f"  Name: *.{base_domain}")
        print(f"  Target: {target}")
        print(f"  Proxied: Yes (SSL enabled)")
        print(f"  Record ID: {result['id']}")
        return result['id']
    else:
        error = create_response.json()
        print(f"✗ Failed to create wildcard DNS: {error}")
        return None


def main():
    """Main setup function."""
    print("=" * 60)
    print("Cloudflare Wildcard DNS Setup for YourEasySite Subdomains")
    print("=" * 60)
    print()
    
    # Configuration
    api_token = settings.CLOUDFLARE_API_TOKEN
    base_domain = 'youreasysite.pl'
    target_domain = 'youreasysite.pl'  # Main frontend domain
    
    if not api_token:
        print("✗ Error: CLOUDFLARE_API_TOKEN not set in environment")
        return
    
    print(f"Base domain: {base_domain}")
    print(f"Target: {target_domain}")
    print()
    
    try:
        # Get Zone ID
        print("Step 1: Getting Cloudflare Zone ID...")
        zone_id = get_cloudflare_zone_id(api_token, base_domain)
        print(f"✓ Zone ID: {zone_id}")
        print()
        
        # Create wildcard DNS
        print("Step 2: Creating/updating wildcard DNS record...")
        record_id = create_wildcard_dns_record(api_token, zone_id, base_domain, target_domain)
        print()
        
        if record_id:
            print("=" * 60)
            print("✓ SUCCESS!")
            print("=" * 60)
            print()
            print("All subdomains (*.youreasysite.pl) will now automatically route to:")
            print(f"  → {target_domain}")
            print()
            print("Examples:")
            print("  • 101-test.youreasysite.pl")
            print("  • 1234-moja-pracownia.youreasysite.pl")
            print("  • any-subdomain.youreasysite.pl")
            print()
            print("These will all work immediately (no DNS propagation delay)!")
            print()
            print("Note: Make sure your frontend (Vercel/hosting) is configured to:")
            print("  1. Accept requests from *.youreasysite.pl")
            print("  2. Route to SiteApp based on subdomain")
            print()
        else:
            print("✗ Failed to set up wildcard DNS")
            
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
