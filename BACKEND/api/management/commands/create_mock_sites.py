# api/management/commands/create_mock_sites.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction, connection
from django.utils import timezone
import json
import os
from datetime import datetime, timedelta
from pathlib import Path
import uuid

from api.models import Site, Template, Event, AvailabilityBlock, TeamMember
from api.signals import suppress_signal_logging

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates mock sites and adds mock events. Automatically manages ID sequence for bulletproof operation.'

    def handle(self, *args, **options):
        """
        BULLETPROOF BUILD PROCESS:
        1. Clear all mock sites (is_mock=True) and reset sequence to 1
        2. Create showcase site (ID=1)
        3. Create mock sites (IDs 2-99)
        4. Find last user site ID and set sequence to continue after it (or 100 if no user sites)
        5. Print distribution summary
        """
        user_email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        if not user_email:
            self.stdout.write(self.style.ERROR('DJANGO_SUPERUSER_EMAIL environment variable not set. Cannot create mock sites.'))
            return

        try:
            admin_user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Superuser with email {user_email} not found.'))
            return

        # Create random user for third site (Maria Wiśniewska)
        random_user_email = 'maria.wisniewski@example.com'
        random_user, created = User.objects.get_or_create(
            email=random_user_email,
            defaults={
                'first_name': 'Maria',
                'last_name': 'Wiśniewska'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created random user: {random_user_email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Using existing user: {random_user_email}'))

        # Load site configurations from JSON files
        current_dir = Path(__file__).parent
        
        # ====================================================================================
        # ID RANGE CONVENTION:
        # - ID 1: Reserved for "YourEasySite Demo" (showcase/preview site)
        # - IDs 2-99: Mock/demo sites for development and testing
        # - IDs 100+: Real user sites (auto-incremented by Django/PostgreSQL)
        # ====================================================================================
        
        demo_sites = [
            {
                'name': 'Pracownia Jogi',
                'json_file': 'mock_pracownia_jogi_new.json',
                'owner': admin_user,
            },
            {
                'name': 'Studio Oddechu',
                'json_file': 'mock_studio_oddechu_new.json',
                'owner': admin_user,
            },
            {
                'name': 'Gabinet Psychoterapii',
                'json_file': 'mock_gabinet_psychoterapii.json',
                'owner': random_user,  # This site will invite admin as contributor
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
                        'template_config': template_config,
                        'owner': site_info['owner'],
                    })
                    self.stdout.write(self.style.SUCCESS(f'Loaded config from {site_info["json_file"]}'))
            except FileNotFoundError:
                self.stdout.write(self.style.ERROR(f'JSON file not found: {json_path}'))
            except json.JSONDecodeError as e:
                self.stdout.write(self.style.ERROR(f'Invalid JSON in {json_path}: {e}'))

        with transaction.atomic(), suppress_signal_logging():
            # ====================================================================================
            # STEP 1: Clear all mock sites (including showcase) and reset sequence to 1
            # ====================================================================================
            Site.objects.filter(is_mock=True).delete()
            self.stdout.write(self.style.SUCCESS('✓ Step 1: Cleared all existing mock sites (including showcase)'))
            
            with connection.cursor() as cursor:
                cursor.execute("SELECT setval('api_site_id_seq', 1, false);")
            self.stdout.write(self.style.SUCCESS('✓ Step 1: Reset sequence to 1'))
            
            # ====================================================================================
            # STEP 2: Create showcase site (ID=1) - using create_default_site command
            # ====================================================================================
            from django.core.management import call_command
            call_command('create_default_site')
            self.stdout.write(self.style.SUCCESS('✓ Step 2: Created showcase site (ID=1)'))
            
            # After creating showcase with ID=1, set sequence to 2 for mock sites
            with connection.cursor() as cursor:
                cursor.execute("SELECT setval('api_site_id_seq', 2, false);")
            
            # ====================================================================================
            # STEP 3: Create mock sites (will get IDs 2, 3, 4...)
            # ====================================================================================
            created_sites = []
            for idx, site_data in enumerate(loaded_sites):
                # Set color_index: different color for each site
                color_index = (idx + 1) % 12  # Cycle through 12 available colors, starting from 1
                
                # Create fresh mock site - Django will auto-assign ID from sequence (2, 3, 4...)
                site = Site.objects.create(
                    owner=site_data['owner'],
                    name=site_data['name'],
                    template_config=site_data['template_config'],
                    color_index=color_index,
                    team_size=1,  # Initially only owner
                    is_mock=True  # Mark as mock site
                )
                
                created_sites.append(site)
                
                self.stdout.write(self.style.SUCCESS(f'✓ Step 3: Created mock site "{site.name}" (ID={site.id}) for {site_data["owner"].email}'))
            
            # Create team member invitation for third site (Gabinet Psychoterapii)
            # Random user invites admin as contributor
            if len(created_sites) >= 3:
                psychotherapy_site = created_sites[2]  # Gabinet Psychoterapii (ID=4)
                
                # Build full name from user fields
                full_name = f"{admin_user.first_name or 'Admin'} {admin_user.last_name or 'User'}".strip()
                
                # Check if team member already exists
                team_member, tm_created = TeamMember.objects.get_or_create(
                    site=psychotherapy_site,
                    email=admin_user.email,
                    defaults={
                        'name': full_name,
                        'role_description': 'Współpracownik techniczny',
                        'permission_role': 'contributor',
                        'invitation_status': 'pending',
                        'invitation_token': uuid.uuid4(),
                        'invited_at': timezone.now(),
                        'linked_user': None  # Don't link until invitation is accepted
                    }
                )
                
                # If invitation already exists and is still pending, don't link the user
                # User should accept the invitation first
                
                if tm_created:
                    # Update team_size
                    psychotherapy_site.team_size = 2
                    psychotherapy_site.save(update_fields=['team_size'])
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Created team member invitation for {admin_user.email} '
                            f'to "{psychotherapy_site.name}" as contributor (status: pending)'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Team member for {admin_user.email} already exists in "{psychotherapy_site.name}"'
                        )
                    )

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
                owner=admin_user,
                name=template_data['name'],
                defaults={
                    'description': template_data['description'],
                    'template_config': template_data['template_config'],
                    'thumbnail_url': template_data['thumbnail_url']
                }
            )

        # Create mock events and availability blocks
        # Include the showcase site (ID=1) and all mock sites
        with suppress_signal_logging():
            try:
                showcase_site = Site.objects.get(id=1)
                sites = [showcase_site] + list(Site.objects.filter(owner__in=[admin_user, random_user]).exclude(id=1))
            except Site.DoesNotExist:
                # If showcase site doesn't exist yet, just use mock sites
                sites = Site.objects.filter(owner__in=[admin_user, random_user])
            
            for site in sites:
                # Clear existing events and availability blocks for this site
                Event.objects.filter(site=site).delete()
                AvailabilityBlock.objects.filter(site=site).delete()
                
                # Determine who is the owner for this site
                site_owner = site.owner
                
                # For third site (Gabinet Psychoterapii), create some events assigned to team member (admin)
                is_third_site = (site.name == 'Gabinet Psychoterapii')
                
                # Get team member if exists
                team_member = None
                if is_third_site:
                    try:
                        team_member = TeamMember.objects.get(site=site, email=admin_user.email)
                    except TeamMember.DoesNotExist:
                        pass
                
                # Create availability blocks for the next 30 days
                today = timezone.now().date()
                for day_offset in range(0, 30, 4):  # Every 4th day
                    target_date = today + timedelta(days=day_offset)
                    
                    # Skip weekends for some variety
                    if target_date.weekday() >= 5:  # Saturday = 5, Sunday = 6
                        continue
                    
                    # Different meeting length patterns for each site
                    if site.id == 1:  # Pokazowa (showcase site - YourEasySite Demo)
                        morning_length = 60
                        afternoon_length = 60
                    elif site.name == 'Pracownia Jogi':
                        # Site: Single duration (60 min)
                        morning_length = 60
                        afternoon_length = 90
                    elif site.name == 'Studio Oddechu':
                        # Site: Different duration
                        morning_length = 45
                        afternoon_length = 60
                    else:
                        # Gabinet Psychoterapii: Different duration
                        morning_length = 30
                        afternoon_length = 45
                    
                    # Morning availability block
                    morning_block = AvailabilityBlock.objects.create(
                        site=site,
                        creator=site_owner,
                        title='Dostępny rano',
                        date=target_date,
                        start_time='09:00',
                        end_time='12:00',
                        meeting_length=morning_length,
                        time_snapping=30,
                        buffer_time=15
                    )
                    
                    # Afternoon availability block
                    afternoon_block = AvailabilityBlock.objects.create(
                        site=site,
                        creator=site_owner,
                        title='Dostępny po południu',
                        date=target_date,
                        start_time='14:00',
                        end_time='17:00',
                        meeting_length=afternoon_length,
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
                
                if site.id == 1:  # Pokazowa (showcase site - YourEasySite Demo)
                    event_titles = [
                        'Demo platformy',
                        'Prezentacja funkcji',
                        'Konsultacja wdrożeniowa',
                        'Sesja Q&A',
                        'Workshop YourEasySite'
                    ]
                elif is_third_site:  # Gabinet Psychoterapii
                    event_titles = [
                        'Sesja terapeutyczna',
                        'Terapia par',
                        'Konsultacja psychologiczna',
                        'Interwencja kryzysowa',
                        'Sesja indywidualna'
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
                        
                        # For third site, alternate between owner and team member
                        # 60% owner, 40% team member
                        assign_to_team_member = is_third_site and team_member and random.random() < 0.4
                        
                        event = Event.objects.create(
                            site=site,
                            creator=site_owner,
                            title=random.choice(event_titles),
                            description=f'Sesja {random.choice(["online", "stacjonarna"])} dla {site.name}',
                            start_time=start_datetime,
                            end_time=end_datetime,
                            capacity=random.choice([1, 1, 1, 8, 12]),  # Mostly individual sessions
                            event_type=random.choice(['individual', 'individual', 'individual', 'group']),
                            assigned_to_owner=None if assign_to_team_member else site_owner,
                            assigned_to_team_member=team_member if assign_to_team_member else None
                        )
                
                # Log summary for this site
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Added mock data for "{site.name}": '
                        f'{AvailabilityBlock.objects.filter(site=site).count()} availability blocks, '
                        f'{Event.objects.filter(site=site).count()} events'
                    )
                )
        
        # ====================================================================================
        # STEP 4: Fix sequence to continue after last user site (or start at 100)
        # ====================================================================================
        with connection.cursor() as cursor:
            # Find the max ID among user sites (is_mock=False)
            cursor.execute("SELECT MAX(id) FROM api_site WHERE is_mock = false;")
            max_user_id = cursor.fetchone()[0] or 0
            
            # Next sequence value should be max(100, max_user_id + 1)
            next_val = max(100, max_user_id + 1)
            
            # Set sequence to next_val
            cursor.execute(f"SELECT setval('api_site_id_seq', {next_val}, false);")
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Step 4: Set sequence to {next_val} (next user site will have ID: {next_val})'
                )
            )
        
        # ====================================================================================
        # STEP 5: Print distribution summary
        # ====================================================================================
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM api_site WHERE id = 1;")
            has_showcase = cursor.fetchone()[0] > 0
            
            cursor.execute("SELECT COUNT(*) FROM api_site WHERE id >= 2 AND id < 100;")
            mock_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM api_site WHERE id >= 100;")
            user_count = cursor.fetchone()[0]
        
        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS('SITE DISTRIBUTION SUMMARY:'))
        self.stdout.write('='*70)
        self.stdout.write(f'  ID 1 (Showcase): {"Yes" if has_showcase else "No"}')
        self.stdout.write(f'  IDs 2-99 (Mocks): {mock_count} sites')
        self.stdout.write(f'  IDs 100+ (Users): {user_count} sites')
        self.stdout.write('='*70)