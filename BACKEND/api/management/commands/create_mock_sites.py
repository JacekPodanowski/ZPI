# api/management/commands/create_mock_sites.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
import json
import os
from datetime import datetime, timedelta
from pathlib import Path
import uuid

from api.models import Site, Template, Event, AvailabilityBlock, TeamMember

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates mock sites and templates for the superuser defined in environment variables.'

    def handle(self, *args, **options):
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
        demo_sites = [
            {
                'name': 'Pracownia Jogi',
                'json_file': 'pracownia_jogi_new.json',
                'owner': admin_user
            },
            {
                'name': 'Studio Oddechu',
                'json_file': 'studio_oddechu_new.json',
                'owner': admin_user
            },
            {
                'name': 'Gabinet Psychoterapii',
                'json_file': 'gabinet_psychoterapii.json',
                'owner': random_user  # This site will invite admin as contributor
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
                        'owner': site_info['owner']
                    })
                    self.stdout.write(self.style.SUCCESS(f'Loaded config from {site_info["json_file"]}'))
            except FileNotFoundError:
                self.stdout.write(self.style.ERROR(f'JSON file not found: {json_path}'))
            except json.JSONDecodeError as e:
                self.stdout.write(self.style.ERROR(f'Invalid JSON in {json_path}: {e}'))

        with transaction.atomic():
            created_sites = []
            for idx, site_data in enumerate(loaded_sites):
                # Set color_index: 0 for first site (red), 1 for second site (blue)
                color_index = idx % 12  # Cycle through 12 available colors
                
                site, created = Site.objects.get_or_create(
                    owner=site_data['owner'],
                    name=site_data['name'],
                    defaults={
                        'template_config': site_data['template_config'],
                        'color_index': color_index,
                        'team_size': 1  # Initially only owner
                    }
                )
                if not created:
                    Site.objects.filter(pk=site.pk).update(
                        template_config=site_data['template_config'],
                        color_index=color_index
                    )
                
                created_sites.append(site)
                
                # Simplified log: Created/Updated mock site
                action = "Updated" if not created else "Created"
                self.stdout.write(self.style.SUCCESS(f'{action} mock site "{site.name}" for {site_data["owner"].email}'))
            
            # Create team member invitation for third site (Gabinet Psychoterapii)
            # Random user invites admin as contributor
            if len(created_sites) >= 3:
                psychotherapy_site = created_sites[2]  # Gabinet Psychoterapii
                
                # Check if team member already exists
                team_member, tm_created = TeamMember.objects.get_or_create(
                    site=psychotherapy_site,
                    email=admin_user.email,
                    defaults={
                        'first_name': admin_user.first_name or 'Admin',
                        'last_name': admin_user.last_name or 'User',
                        'role_description': 'Współpracownik techniczny',
                        'permission_role': 'contributor',
                        'invitation_status': 'pending',
                        'invitation_token': str(uuid.uuid4()),
                        'invited_at': timezone.now(),
                        'linked_user': admin_user
                    }
                )
                if not tm_created and team_member.linked_user is None:
                    team_member.linked_user = admin_user
                    team_member.save(update_fields=['linked_user'])
                
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
                name=template_data['name'],
                defaults={
                    'description': template_data['description'],
                    'template_config': template_data['template_config'],
                    'thumbnail_url': template_data['thumbnail_url']
                }
            )

        # Create mock events and availability blocks
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
                
                # Morning availability block
                morning_block = AvailabilityBlock.objects.create(
                    site=site,
                    creator=site_owner,
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
                    creator=site_owner,
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
            
            if is_third_site:
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