# api/management/commands/create_mock_sites.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
import json
import os
from datetime import datetime, timedelta

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

        demo_sites = [
            {
                'name': 'Pracownia Jogi',
                'template_config': {
                    'name': 'Pracownia Jogi',
                    'themeId': 'modernWellness',
                    'pageOrder': [
                        'home',
                        'about',
                        'services',
                        'calendar',
                        'pricing',
                        'contact'
                    ],
                    'pages': {
                        'home': {
                            'id': 'home',
                            'name': 'Strona główna',
                            'path': '/',
                            'modules': [
                                {
                                    'id': 'hero',
                                    'name': 'Strona Główna',
                                    'type': 'hero',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Pracownia Jogi Jacek',
                                        'subtitle': 'Znajdź balans ciała i umysłu',
                                        'bgColor': 'rgb(228, 229, 218)',
                                        'textColor': 'rgb(30, 30, 30)',
                                        'backgroundImage': ''
                                    }
                                }
                            ]
                        },
                        'about': {
                            'id': 'about',
                            'name': 'O Mnie',
                            'path': '/o-mnie',
                            'modules': [
                                {
                                    'id': 'about',
                                    'name': 'O Mnie',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Poznaj mnie',
                                        'description': 'Instruktor jogi z 10-letnim doświadczeniem w pracy z ciałem i oddechem.',
                                        'imageUrl': '',
                                        'avatar': '',
                                        'bgColor': 'rgb(255, 255, 255)'
                                    }
                                }
                            ]
                        },
                        'services': {
                            'id': 'services',
                            'name': 'Usługi',
                            'path': '/uslugi',
                            'modules': [
                                {
                                    'id': 'services_cards',
                                    'type': 'services',
                                    'name': 'Oferta usług',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Usługi dopasowane do Ciebie',
                                        'subtitle': 'Wybierz formę pracy, która najlepiej wspiera Twoją praktykę',
                                        'bgColor': '#FFFFFF',
                                        'textColor': 'rgb(30, 30, 30)',
                                        'accentColor': 'rgb(146, 0, 32)',
                                        'items': [
                                            {
                                                'id': 'service-1',
                                                'name': 'Sesje indywidualne',
                                                'category': '1:1',
                                                'description': '<p>Spotkanie dostosowane do Twoich celów i potrzeb ciała.</p>',
                                                'image': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=900&q=60'
                                            },
                                            {
                                                'id': 'service-2',
                                                'name': 'Warsztaty weekendowe',
                                                'category': 'Grupowe',
                                                'description': '<p>Dwudniowe zanurzenie w praktyce jogi, oddechu i relaksacji.</p>',
                                                'image': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=60'
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        'calendar': {
                            'id': 'calendar',
                            'name': 'Kalendarz',
                            'path': '/kalendarz',
                            'modules': [
                                {
                                    'id': 'calendar',
                                    'name': 'Kalendarz',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Zarezerwuj zajęcia',
                                        'color': 'rgb(146, 0, 32)',
                                        'bgColor': 'rgb(255, 255, 255)',
                                        'minInterval': 15,
                                        'allowIndividual': True,
                                        'allowGroup': True
                                    }
                                }
                            ]
                        },
                        'pricing': {
                            'id': 'pricing',
                            'name': 'Cennik',
                            'path': '/cennik',
                             'modules': [
                                {
                                    'id': 'pricing_cards',
                                    'type': 'pricing',
                                    'name': 'Pakiety cenowe',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Przejrzyste pakiety',
                                        'subtitle': 'Wybierz plan, który najlepiej współgra z Twoim rytmem',
                                        'bgColor': '#FFFFFF',
                                        'textColor': 'rgb(30, 30, 30)',
                                        'accentColor': 'rgb(146, 0, 32)',
                                        'currency': 'PLN',
                                        'items': [
                                            {
                                                'id': 'pricing-1',
                                                'name': 'Sesja indywidualna',
                                                'price': '180',
                                                'description': '<ul><li>60 minut pracy 1:1</li></ul>',
                                                'image': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=60'
                                            },
                                            {
                                                'id': 'pricing-2',
                                                'name': 'Karnet miesięczny',
                                                'price': '520',
                                                'description': '<ul><li>8 spotkań grupowych</li></ul>',
                                                'image': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=900&q=60'
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        'contact': {
                            'id': 'contact',
                            'name': 'Kontakt',
                            'path': '/kontakt',
                            'modules': [
                                {
                                    'id': 'contact',
                                    'name': 'Kontakt',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'email': 'kontakt@pracowniajogi.pl',
                                        'phone': '+48 600 000 001',
                                        'bgColor': 'rgb(228, 229, 218)'
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            {
                'name': 'Studio Oddechu',
                'template_config': {
                    'name': 'Studio Oddechu',
                    'themeId': 'modernWellness',
                    'pages': {
                        'home': {
                            'id': 'home',
                            'name': 'Strona główna',
                            'path': '/',
                            'modules': [
                                {
                                    'id': 'hero',
                                    'name': 'Strona Główna',
                                    'type': 'hero',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Studio Oddechu',
                                        'subtitle': 'Sesje uważności i oddechu online',
                                        'bgColor': 'rgb(228, 229, 218)',
                                        'textColor': 'rgb(30, 30, 30)',
                                        'backgroundImage': ''
                                    }
                                }
                            ]
                        },
                        'calendar': {
                            'id': 'calendar',
                            'name': 'Kalendarz',
                            'path': '/kalendarz',
                            'modules': [
                                {
                                    'id': 'calendar',
                                    'name': 'Kalendarz',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'title': 'Zaplanuj sesję',
                                        'color': 'rgb(146, 0, 32)',
                                        'bgColor': 'rgb(255, 255, 255)',
                                        'minInterval': 30,
                                        'allowIndividual': True,
                                        'allowGroup': False
                                    }
                                }
                            ]
                        },
                        'contact': {
                            'id': 'contact',
                            'name': 'Kontakt',
                            'path': '/kontakt',
                            'modules': [
                                {
                                    'id': 'contact',
                                    'name': 'Kontakt',
                                    'enabled': True,
                                    'order': 0,
                                    'config': {
                                        'email': 'hello@studiooddechu.pl',
                                        'phone': '+48 600 000 002',
                                        'bgColor': 'rgb(255, 255, 255)'
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        ]

        with transaction.atomic():
            for idx, site_data in enumerate(demo_sites):
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
                'template_config': demo_sites[0]['template_config'],
                'thumbnail_url': None
            },
            {
                'name': 'Mindfulness Studio',
                'description': 'Delikatny motyw dla studiów oddechu i pracy z uważnością.',
                'template_config': demo_sites[1]['template_config'],
                'thumbnail_url': None
            }
        ]

        # Removed verbose template logs - templates created/updated silently
        for template_data in template_catalog:
            config_copy = json.loads(json.dumps(template_data['template_config']))
            config_copy['name'] = template_data['name']
            
            template, created = Template.objects.update_or_create(
                name=template_data['name'],
                defaults={
                    'description': template_data['description'],
                    'template_config': config_copy,
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