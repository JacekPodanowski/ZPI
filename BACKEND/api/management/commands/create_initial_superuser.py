# api/management/commands/create_initial_superuser.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import os

import json

from api.models import Site, Template

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a superuser if none exist, using environment variables for credentials.'

    def handle(self, *args, **options):
        superuser_email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        superuser_username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        superuser_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        superuser_first_name = os.environ.get('DJANGO_SUPERUSER_FIRST_NAME', '')
        superuser_last_name = os.environ.get('DJANGO_SUPERUSER_LAST_NAME', '')

        if not all([superuser_email, superuser_username, superuser_password]):
            self.stdout.write(self.style.ERROR('Missing superuser environment variables (EMAIL, USERNAME, PASSWORD). Superuser not created.'))
            return

        defaults = {
            'username': superuser_username,
            'first_name': superuser_first_name,
            'last_name': superuser_last_name,
            'is_staff': True,
            'is_superuser': True,
        }

        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=superuser_email,
                defaults={**defaults, 'password': superuser_password}
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Creating superuser {superuser_username} ({superuser_email})'))
                user.set_password(superuser_password)
                user.save()
            else:
                updated_fields = []
                for field, value in defaults.items():
                    if getattr(user, field) != value and value is not None:
                        setattr(user, field, value)
                        updated_fields.append(field)

                if not user.check_password(superuser_password):
                    user.set_password(superuser_password)
                    updated_fields.append('password')

                if updated_fields:
                    user.save(update_fields=list(set(updated_fields)))
                    self.stdout.write(self.style.WARNING('Updated existing superuser credentials to match environment variables.'))
                else:
                    self.stdout.write(self.style.WARNING('Superuser already exists with matching credentials.'))

            # Ensure demo sites exist for the superuser
            demo_sites = [
                {
                    'name': 'Pracownia Jogi',
                    'template_config': {
                        'name': 'Pracownia Jogi',
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
                            'gallery': {
                                'id': 'gallery',
                                'name': 'Galeria',
                                'path': '/galeria',
                                'modules': [
                                    {
                                        'id': 'gallery_module_main',
                                        'type': 'gallery',
                                        'name': 'Nasze Prace',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'images': [],
                                            'columns': 3,
                                            'gap': '1rem',
                                            'style': 'masonry'
                                        }
                                    }
                                ]
                            },
                            'about': {
                                'id': 'about',
                                'name': 'O mnie',
                                'path': '/o-mnie',
                                'modules': [
                                    {
                                        'id': 'about',
                                        'name': 'O mnie',
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
                            'gallery': {
                                'id': 'gallery',
                                'name': 'Galeria',
                                'path': '/galeria',
                                'modules': [
                                    {
                                        'id': 'gallery_module_main',
                                        'type': 'gallery',
                                        'name': 'Nasze Prace',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'images': [],
                                            'columns': 4,
                                            'gap': '1rem',
                                            'style': 'grid'
                                        }
                                    }
                                ]
                            },
                            'about': {
                                'id': 'about',
                                'name': 'O mnie',
                                'path': '/o-mnie',
                                'modules': [
                                    {
                                        'id': 'about',
                                        'name': 'O mnie',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Trener oddechu',
                                            'description': 'Pomagam wrócić do spokojnego rytmu dnia dzięki pracy z oddechem.',
                                            'imageUrl': '',
                                            'avatar': '',
                                            'bgColor': 'rgb(255, 255, 255)'
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
                },
                {
                    'name': 'Fotograf Portfolio',
                    'template_config': {
                        'name': 'Fotograf Portfolio',
                        'themeId': 'oceanCalm',
                        'pages': {
                            'home': {
                                'id': 'home',
                                'name': 'Główna',
                                'path': '/',
                                'modules': [
                                    {
                                        'id': 'hero',
                                        'name': 'Hero',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Anna Nowak',
                                            'subtitle': 'Fotografia Portretowa',
                                            'bgColor': '#111111',
                                            'textColor': '#FFFFFF',
                                            'backgroundImage': 'https://via.placeholder.com/1500x800'
                                        }
                                    }
                                ]
                            },
                            'gallery': {
                                'id': 'gallery',
                                'name': 'Portfolio',
                                'path': '/portfolio',
                                'modules': [
                                    {
                                        'id': 'gallery_module',
                                        'type': 'gallery',
                                        'name': 'Moje Prace',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'images': [],
                                            'columns': 3,
                                            'style': 'masonry'
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
                                            'email': 'anna.nowak@photo.pl',
                                            'phone': '+48 111 222 333',
                                            'bgColor': '#FFFFFF'
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            ]

            for site_data in demo_sites:
                site, site_created = Site.objects.get_or_create(
                    owner=user,
                    name=site_data['name'],
                    defaults={'template_config': site_data['template_config']}
                )
                if not site_created:
                    Site.objects.filter(pk=site.pk).update(template_config=site_data['template_config'])
                    self.stdout.write(self.style.WARNING(f'Updated demo site "{site.name}" configuration.'))
                else:
                    self.stdout.write(self.style.SUCCESS(f'Created demo site "{site.name}" for superuser.'))

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
                },
                {
                    'name': 'Fotograf Portfolio',
                    'description': 'Nowoczesny układ dla fotografów i twórców wizualnych.',
                    'template_config': demo_sites[2]['template_config'],
                    'thumbnail_url': None
                }
            ]

            for template_data in template_catalog:
                config_copy = json.loads(json.dumps(template_data['template_config']))
                config_copy['name'] = template_data['name']
                Template.objects.update_or_create(
                    name=template_data['name'],
                    defaults={
                        'description': template_data['description'],
                        'template_config': config_copy,
                        'thumbnail_url': template_data['thumbnail_url']
                    }
                )