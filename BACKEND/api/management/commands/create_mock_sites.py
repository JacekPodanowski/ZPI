# api/management/commands/create_mock_sites.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
import json
import os
from datetime import datetime, timedelta
from pathlib import Path

from api.models import Site, Template, Event, AvailabilityBlock

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates mock sites and templates for the superuser defined in environment variables.'

    def handle(self, *args, **options):
        user_email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        if not user_email:
            self.stdout.write(self.style.ERROR('DJANGO_SUPERUSER_EMAIL environment variable not set. Cannot create mock sites.'))
            return

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Superuser with email {user_email} not found.'))
            return

        # Load site configurations from JSON files
        current_dir = Path(__file__).parent
        demo_sites = [
            {
                'name': 'Pracownia Jogi',
                'json_file': 'pracownia_jogi_new.json'
            },
            {
                'name': 'Studio Oddechu',
                'json_file': 'studio_oddechu_new.json'
            }
        ]

        loaded_sites = []
        for site_info in demo_sites:
            json_path = current_dir / site_info['json_file']
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    template_config = json.load(f)
                    loaded_sites.append({
                        'name': site_info['name'],
                        'template_config': template_config
                    })
                    self.stdout.write(self.style.SUCCESS(f'Loaded config from {site_info["json_file"]}'))
            except FileNotFoundError:
                self.stdout.write(self.style.ERROR(f'JSON file not found: {json_path}'))
            except json.JSONDecodeError as e:
                self.stdout.write(self.style.ERROR(f'Invalid JSON in {json_path}: {e}'))

        with transaction.atomic():
            for idx, site_data in enumerate(loaded_sites):
                # Set color_index: 0 for first site (red), 1 for second site (blue)
                color_index = idx % 12  # Cycle through 12 available colors
                
                site, created = Site.objects.get_or_create(
                    owner=user,
                    name=site_data['name'],
                    defaults={
                        'template_config': site_data['template_config'],
                        'color_index': color_index
                    }
                )
                if not created:
                    Site.objects.filter(pk=site.pk).update(
                        template_config=site_data['template_config'],
                        color_index=color_index
                    )
                
                # Simplified log: Created/Updated mock site
                action = "Updated" if not created else "Created"
                self.stdout.write(self.style.SUCCESS(f'{action} mock site "{site.name}" for {user.email}'))

        template_catalog = [
            {
                'name': 'Wellness Starter',
                'description': 'Elegancki szablon dla instruktorów wellness i studiów jogi.',
                'template_config': loaded_sites[0]['template_config'] if len(loaded_sites) > 0 else {},
                'thumbnail_url': None
            },
            {
                'name': 'Mindfulness Studio',
                'description': 'Delikatny motyw dla studiów oddechu i pracy z uważnością.',
                'template_config': loaded_sites[1]['template_config'] if len(loaded_sites) > 1 else {},
                'thumbnail_url': None
            }
        ]

        # Create/update templates in catalog
        for template_data in template_catalog:
            template, created = Template.objects.update_or_create(
                name=template_data['name'],
                defaults={
                    'description': template_data['description'],
                    'template_config': template_data['template_config'],
                    'thumbnail_url': template_data['thumbnail_url']
                }
            )

        # Create mock events and availability blocks
        sites = Site.objects.filter(owner=user)
        
        for site in sites:
            # Clear existing events and availability blocks for this site
            Event.objects.filter(site=site).delete()
            AvailabilityBlock.objects.filter(site=site).delete()
            
            # Create availability blocks for the next 30 days
            today = timezone.now().date()
            for day_offset in range(0, 30, 4):  # Every 4th day
                target_date = today + timedelta(days=day_offset)
                
                # Skip weekends for some variety
                if target_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
                    continue
                
                # Morning availability block
                morning_block = AvailabilityBlock.objects.create(
                    site=site,
                    creator=user,
                    title='Dostępny rano',
                    date=target_date,
                    start_time='09:00',
                    end_time='12:00',
                    meeting_lengths=[30, 45, 60],
                    time_snapping=30,
                    buffer_time=15
                )
                
                # Afternoon availability block
                afternoon_block = AvailabilityBlock.objects.create(
                    site=site,
                    creator=user,
                    title='Dostępny po południu',
                    date=target_date,
                    start_time='14:00',
                    end_time='17:00',
                    meeting_lengths=[30, 60, 90],
                    time_snapping=30,
                    buffer_time=10
                )
            
            # Create some scheduled events
            event_titles = [
                'Sesja indywidualna jogi',
                'Warsztat oddechowy',
                'Konsultacja wellness',
                'Zajęcia grupowe',
                'Sesja relaksacyjna'
            ]
            
            for day_offset in range(1, 15, 3):  # Every 3rd day for next 2 weeks
                target_date = today + timedelta(days=day_offset)
                
                # Skip weekends
                if target_date.weekday() >= 5:
                    continue
                
                # Create 1-2 events per day
                import random
                num_events = random.randint(1, 2)
                
                for i in range(num_events):
                    hour = 10 + i * 3  # 10:00, 13:00, etc.
                    if hour >= 18:  # Don't schedule after 6 PM
                        break
                        
                    start_datetime = timezone.make_aware(
                        datetime.combine(target_date, datetime.min.time().replace(hour=hour))
                    )
                    end_datetime = start_datetime + timedelta(hours=1)
                    
                    event = Event.objects.create(
                        site=site,
                        creator=user,
                        title=random.choice(event_titles),
                        description=f'Sesja {random.choice(["online", "stacjonarna"])} dla {site.name}',
                        start_time=start_datetime,
                        end_time=end_datetime,
                        capacity=random.choice([1, 1, 1, 8, 12]),  # Mostly individual sessions
                        event_type=random.choice(['individual', 'individual', 'individual', 'group'])
                    )
            
            # Log summary for this site
            self.stdout.write(
                self.style.SUCCESS(
                    f'Added mock data for "{site.name}": '
                    f'{AvailabilityBlock.objects.filter(site=site).count()} availability blocks, '
                    f'{Event.objects.filter(site=site).count()} events'
                )
            )