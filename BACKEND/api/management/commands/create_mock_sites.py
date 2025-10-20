# api/management/commands/create_mock_sites.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import json
import os

from api.models import Site, Template

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

        self.stdout.write(self.style.SUCCESS(f'Creating mock sites for user: {user.username} ({user.email})'))

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
                    self.stdout.write(self.style.WARNING(f'Updated demo site "{site.name}" for {user.email} with color_index={color_index}.'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Created demo site "{site.name}" for {user.email} with color_index={color_index}.'))

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

        self.stdout.write(self.style.SUCCESS('Creating or updating global templates...'))
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
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created template "{template.name}".'))
            else:
                self.stdout.write(self.style.WARNING(f'Updated template "{template.name}".'))