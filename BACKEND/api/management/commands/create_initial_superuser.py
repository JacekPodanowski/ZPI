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
                        'pageOrder': [
                            'home',
                            'about',
                            'services',
                            'calendar',
                            'pricing',
                            'events',
                            'faq',
                            'team',
                            'blog',
                            'gallery',
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
                                                    'description': '<p>Spotkanie dostosowane do Twoich celów i potrzeb ciała. Pracujemy w spokojnym tempie, budując uważność i siłę.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'service-2',
                                                    'name': 'Warsztaty weekendowe',
                                                    'category': 'Grupowe',
                                                    'description': '<p>Dwudniowe zanurzenie w praktyce jogi, oddechu i relaksacji. Idealne, jeśli chcesz odnowić energię i motywację.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'service-3',
                                                    'name': 'Terapia ruchem',
                                                    'category': 'Wellness',
                                                    'description': '<p>Łagodne sekwencje wspierające regenerację i redukcję napięcia. Polecane osobom po kontuzjach oraz pracującym siedząco.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1552196520-42176f8d8125?auto=format&fit=crop&w=900&q=60'
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
                            'blog': {
                                'id': 'blog',
                                'name': 'Blog',
                                'path': '/blog',
                                'modules': [
                                    {
                                        'id': 'team_blog',
                                        'type': 'blog',
                                        'name': 'Aktualności',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Aktualności zespołu',
                                            'subtitle': 'Historie, inspiracje i ogłoszenia prosto ze studia',
                                            'bgColor': '#FFFFFF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'posts': [
                                                {
                                                    'id': 'blog-1',
                                                    'title': 'Nowa instruktorka w zespole',
                                                    'author': 'Jacek',
                                                    'date': '2025-02-10',
                                                    'excerpt': 'Poznaj Kasię, ekspertkę od relaksacji somatycznej. Jej zajęcia startują już w przyszłym tygodniu.',
                                                    'image': 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'blog-2',
                                                    'title': 'Weekendowy warsztat w górach',
                                                    'author': 'Anna',
                                                    'date': '2025-03-05',
                                                    'excerpt': 'Zabieramy praktykę na świeże powietrze. Zadbaliśmy o transport, nocleg oraz pyszną kuchnię jogiczną.',
                                                    'image': 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'blog-3',
                                                    'title': 'Nowy cykl medytacji porannych',
                                                    'author': 'Marta',
                                                    'date': '2025-04-01',
                                                    'excerpt': 'Codziennie o 7:30 spotykamy się na krótką medytację i planowanie dnia w uważności.',
                                                    'image': 'https://images.unsplash.com/photo-1517343318677-f9c11d0cb3fb?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
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
                                                    'description': '<ul><li>60 minut pracy 1:1</li><li>Personalizowane wskazówki</li><li>Materiały do praktyki domowej</li></ul>',
                                                    'image': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'pricing-2',
                                                    'name': 'Karnet miesięczny',
                                                    'price': '520',
                                                    'description': '<ul><li>8 spotkań grupowych</li><li>Dostęp do nagrań</li><li>Zniżki na warsztaty</li></ul>',
                                                    'image': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'pricing-3',
                                                    'name': 'Weekend regeneracyjny',
                                                    'price': '820',
                                                    'description': '<ul><li>2 dni w kameralnej grupie</li><li>Pełne wyżywienie</li><li>Sesje oddechowe i relaksacyjne</li></ul>',
                                                    'image': 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'faq': {
                                'id': 'faq',
                                'name': 'FAQ',
                                'path': '/faq',
                                'modules': [
                                    {
                                        'id': 'faq_main',
                                        'type': 'faq',
                                        'name': 'Najczęstsze pytania',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Masz pytania? Mamy odpowiedzi',
                                            'intro': 'Zebraliśmy najważniejsze informacje dotyczące rozpoczęcia praktyki i organizacji zajęć.',
                                            'bgColor': '#F5F3EF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'items': [
                                                {
                                                    'id': 'faq-item-1',
                                                    'question': 'Jak przygotować się do pierwszych zajęć?',
                                                    'answer': '<p>Przyjdź w wygodnym stroju, weź ze sobą matę (na miejscu również mamy maty do wypożyczenia) oraz butelkę wody. Postaraj się nie jeść ciężkiego posiłku na 2h przed praktyką.</p>'
                                                },
                                                {
                                                    'id': 'faq-item-2',
                                                    'question': 'Czy zajęcia są odpowiednie dla początkujących?',
                                                    'answer': '<p>Tak. Każda sekwencja ma warianty dostosowane do Twojego poziomu. Instruktor prowadzi Cię krok po kroku i pomaga znaleźć komfortowe ustawienia.</p>'
                                                },
                                                {
                                                    'id': 'faq-item-3',
                                                    'question': 'Co jeśli nie mogę wziąć udziału w spotkaniu?',
                                                    'answer': '<p>Wystarczy, że odwołasz rezerwację minimum 12h wcześniej. Wtedy termin wróci do puli, a Ty możesz wykorzystać wejście w innym terminie.</p>'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'team': {
                                'id': 'team',
                                'name': 'Zespół',
                                'path': '/zespol',
                                'modules': [
                                    {
                                        'id': 'team_cards',
                                        'type': 'team',
                                        'name': 'Instruktorzy',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Poznaj nasz zespół',
                                            'subtitle': 'Doświadczeni prowadzący, którzy wspierają Cię na macie i poza nią',
                                            'bgColor': '#FFFFFF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'accentColor': 'rgb(146, 0, 32)',
                                            'members': [
                                                {
                                                    'id': 'team-member-1',
                                                    'name': 'Anna Kowalska',
                                                    'role': 'Instruktorka yin jogi',
                                                    'bio': '<p>Specjalizuje się w łagodnych sekwencjach rozciągających, automasażu i uważności oddechu.</p>',
                                                    'focus': '<p>Prowadzi: zajęcia wieczorne, warsztaty regeneracyjne, sesje indywidualne.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'team-member-2',
                                                    'name': 'Michał Nowak',
                                                    'role': 'Instruktor vinyasy',
                                                    'bio': '<p>Łączy dynamiczną pracę z ciałem z budowaniem stabilności i siły. W każdej sekwencji kładzie nacisk na świadomy oddech.</p>',
                                                    'focus': '<p>Prowadzi: poranne flow, treningi funkcjonalne, przygotowanie motoryczne.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'team-member-3',
                                                    'name': 'Marta Zielińska',
                                                    'role': 'Specjalistka oddechu',
                                                    'bio': '<p>Tworzy kameralne sesje skupione na regulacji układu nerwowego poprzez oddech i relaksację.</p>',
                                                    'focus': '<p>Prowadzi: warsztaty oddechowe, sesje relaksacji, wsparcie dla osób w stresie.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'events': {
                                'id': 'events',
                                'name': 'Wydarzenia',
                                'path': '/wydarzenia',
                                'modules': [
                                    {
                                        'id': 'events_showcase',
                                        'type': 'events',
                                        'name': 'Lista wydarzeń',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Nadchodzące wydarzenia',
                                            'subtitle': 'Rezerwuj miejsce na unikalne warsztaty i sesje specjalne',
                                            'bgColor': '#FFFFFF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'accentColor': 'rgb(146, 0, 32)',
                                            'events': [
                                                {
                                                    'id': 'event-1',
                                                    'title': 'Weekend yin & oddech',
                                                    'date': '2025-11-15',
                                                    'summary': '<p>Dwa dni praktyki yin jogi, automasażu i głębokiej relaksacji prowadzone w kameralnej grupie.</p>',
                                                    'fullDescription': '<p>Podczas weekendu zanurzymy się w praktyce yin oraz nauczymy się technik automasażu powięziowego z elementami pracy z oddechem. Zapewnione posiłki roślinne i czas w strefie wellness.</p>',
                                                    'location': 'Dom Praktyki, Beskidy',
                                                    'images': [
                                                        'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=900&q=60',
                                                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=60'
                                                    ]
                                                },
                                                {
                                                    'id': 'event-2',
                                                    'title': 'Wieczór regeneracyjny',
                                                    'date': '2025-12-02',
                                                    'summary': '<p>Łagodne sekwencje rozciągające z dźwiękami mis i aromaterapią.</p>',
                                                    'fullDescription': '<p>Spotykamy się o 19:00. Zaczynamy od krótkiej medytacji, następnie przechodzimy do sekwencji regeneracyjnej zakończonej koncertem mis tybetańskich.</p>',
                                                    'location': 'Studio Pracownia Jogi',
                                                    'images': [
                                                        'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=900&q=60'
                                                    ]
                                                }
                                            ]
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
                            },
                            'services': {
                                'id': 'services',
                                'name': 'Usługi',
                                'path': '/uslugi',
                                'modules': [
                                    {
                                        'id': 'services_breathwork',
                                        'type': 'services',
                                        'name': 'Oferta usług',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Praktyki, które pomagają złapać oddech',
                                            'subtitle': 'Znajdź rytuał dopasowany do Twojego tempa dnia',
                                            'bgColor': '#FFFFFF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'accentColor': 'rgb(146, 0, 32)',
                                            'items': [
                                                {
                                                    'id': 'breath-service-1',
                                                    'name': 'Sesje oddechu indywidualne',
                                                    'category': '1:1',
                                                    'description': '<p>Spotkanie online, podczas którego wspólnie uczymy się technik wydłużania i pogłębiania oddechu. Otrzymasz plan ćwiczeń na kolejne dni.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1526674183561-3a54354ceaba?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'breath-service-2',
                                                    'name': 'Poranne kręgi oddechowe',
                                                    'category': 'Grupa',
                                                    'description': '<p>Krótkie, 30-minutowe spotkania w kameralnej grupie. Uczysz się prostych technik na start dnia i wzmacniasz regularność praktyki.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'breath-service-3',
                                                    'name': 'Warsztaty redukcji stresu',
                                                    'category': 'Program',
                                                    'description': '<p>4-tygodniowy program łączący praktykę oddechu, mikro-przerwy w ciągu dnia oraz prowadzone relaksacje audio.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1506126279643-8182b892c8e9?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
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
                                        'id': 'pricing_breathwork',
                                        'type': 'pricing',
                                        'name': 'Pakiety cenowe',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Wybierz tempo pracy z oddechem',
                                            'subtitle': 'Elastyczne pakiety dla osób praktykujących solo i w grupie',
                                            'bgColor': '#FFFFFF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'accentColor': 'rgb(146, 0, 32)',
                                            'currency': 'PLN',
                                            'items': [
                                                {
                                                    'id': 'breath-pricing-1',
                                                    'name': 'Sesja indywidualna',
                                                    'price': '220',
                                                    'description': '<ul><li>60 minut pracy 1:1</li><li>Analiza wzorca oddechowego</li><li>Nagranie audio do pracy własnej</li></ul>',
                                                    'image': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'breath-pricing-2',
                                                    'name': 'Pakiet 4 spotkań',
                                                    'price': '760',
                                                    'description': '<ul><li>4 spotkania 1:1</li><li>Plan praktyki na 30 dni</li><li>Dostęp do biblioteki audio</li></ul>',
                                                    'image': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'breath-pricing-3',
                                                    'name': 'Kręgi poranne na miesiąc',
                                                    'price': '260',
                                                    'description': '<ul><li>12 spotkań grupowych live</li><li>Nagrania z zajęć</li><li>Materiały PDF</li></ul>',
                                                    'image': 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'faq': {
                                'id': 'faq',
                                'name': 'FAQ',
                                'path': '/faq',
                                'modules': [
                                    {
                                        'id': 'faq_breathwork',
                                        'type': 'faq',
                                        'name': 'Najczęstsze pytania',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Najczęstsze pytania o praktykę oddechu',
                                            'intro': 'Zebraliśmy najważniejsze wskazówki przed startem programu i w trakcie praktyki.',
                                            'bgColor': '#F5F3EF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'items': [
                                                {
                                                    'id': 'breath-faq-1',
                                                    'question': 'Czy potrzebuję wcześniejszego doświadczenia?',
                                                    'answer': '<p>Nie. Zaczynamy od podstaw i stopniowo wprowadzamy bardziej zaawansowane techniki. Wszystko dostosowujemy do Twojego samopoczucia.</p>'
                                                },
                                                {
                                                    'id': 'breath-faq-2',
                                                    'question': 'Jak przygotować się do sesji online?',
                                                    'answer': '<p>Zadbaj o spokojne miejsce, połącz się przez słuchawki i miej pod ręką wodę. Najlepiej praktykować na siedząco, z prostym kręgosłupem.</p>'
                                                },
                                                {
                                                    'id': 'breath-faq-3',
                                                    'question': 'Czy mogę praktykować w ciąży?',
                                                    'answer': '<p>Jeśli nie ma przeciwwskazań medycznych – tak. Pracujemy wówczas na delikatnych teknikach i konsultujemy tempo oddechu z lekarzem prowadzącym.</p>'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'team': {
                                'id': 'team',
                                'name': 'Zespół',
                                'path': '/zespol',
                                'modules': [
                                    {
                                        'id': 'team_breathwork',
                                        'type': 'team',
                                        'name': 'Zespół',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Poznaj osoby prowadzące Studio Oddechu',
                                            'subtitle': 'Instruktorzy i specjalistki, którzy tworzą spokojną przestrzeń do praktyki',
                                            'bgColor': '#FFFFFF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'accentColor': 'rgb(146, 0, 32)',
                                            'members': [
                                                {
                                                    'id': 'breath-team-1',
                                                    'name': 'Aleksandra Wróbel',
                                                    'role': 'Trenerka oddechu',
                                                    'bio': '<p>Prowadzi spotkania indywidualne oraz grupowe. Łączy wiedzę somatyczną z pracą z głosem.</p>',
                                                    'focus': '<p>Specjalizuje się w redukcji napięcia i pracy z układem nerwowym.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'breath-team-2',
                                                    'name': 'Karol Grzyb',
                                                    'role': 'Instruktor mindfulness',
                                                    'bio': '<p>Łączy praktykę oddechu z krótkimi medytacjami ukierunkowanymi na autorefleksję.</p>',
                                                    'focus': '<p>Prowadzi poranne kręgi i sesje oddechowe w firmach.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'events': {
                                'id': 'events',
                                'name': 'Wydarzenia',
                                'path': '/wydarzenia',
                                'modules': [
                                    {
                                        'id': 'events_breathwork',
                                        'type': 'events',
                                        'name': 'Nadchodzące wydarzenia',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Sesje specjalne i wyjazdy',
                                            'subtitle': 'Rezerwuj miejsce na wydarzenia rozszerzające codzienną praktykę',
                                            'bgColor': '#FFFFFF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'accentColor': 'rgb(146, 0, 32)',
                                            'events': [
                                                {
                                                    'id': 'breath-event-1',
                                                    'title': 'Wieczór z relaksacją oddechową',
                                                    'date': '2025-11-18',
                                                    'summary': '<p>Spotkanie live z muzyką na żywo i spokojnym prowadzeniem oddechu.</p>',
                                                    'fullDescription': '<p>Podczas spotkania wykonamy serię ćwiczeń pogłębiających oddech, skierowanych na uspokojenie układu nerwowego. W finale – prowadzone relaksacje z dźwiękami gongów.</p>',
                                                    'location': 'Online na platformie Zoom',
                                                    'images': [
                                                        'https://images.unsplash.com/photo-1523875194681-bedd468c58bf?auto=format&fit=crop&w=900&q=60'
                                                    ]
                                                },
                                                {
                                                    'id': 'breath-event-2',
                                                    'title': 'Retreat nad morzem',
                                                    'date': '2026-04-05',
                                                    'summary': '<p>Weekend z praktyką oddechu, poranną jogą i spacerami brzegiem morza.</p>',
                                                    'fullDescription': '<p>3 dni pracy w grupie, warsztaty z automasażu i poranne medytacje. W cenie nocleg, posiłki oraz materiały edukacyjne.</p>',
                                                    'location': 'Jastarnia, Baltic Retreat',
                                                    'images': [
                                                        'https://images.unsplash.com/photo-1523875194681-bedd468c58bf?auto=format&fit=crop&w=900&q=60'
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'blog': {
                                'id': 'blog',
                                'name': 'Blog',
                                'path': '/blog',
                                'modules': [
                                    {
                                        'id': 'blog_breathwork',
                                        'type': 'blog',
                                        'name': 'Aktualności',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Najnowsze artykuły i nagrania',
                                            'subtitle': 'Doświadczaj praktyki również między sesjami',
                                            'bgColor': '#FFFFFF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'posts': [
                                                {
                                                    'id': 'breath-blog-1',
                                                    'title': 'Jak wrócić do spokojnego oddechu w pracy?',
                                                    'author': 'Aleksandra',
                                                    'date': '2025-02-22',
                                                    'excerpt': 'Poznaj 3 krótkie ćwiczenia, które możesz wykonać przy biurku – nawet jeśli masz tylko 5 minut przerwy.',
                                                    'image': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'breath-blog-2',
                                                    'title': 'Poranna rutyna dla spokojnego startu dnia',
                                                    'author': 'Karol',
                                                    'date': '2025-03-14',
                                                    'excerpt': 'Krótka sekwencja oddech + uważność, którą możesz wykonywać codziennie po przebudzeniu.',
                                                    'image': 'https://images.unsplash.com/photo-1526674183561-3a54354ceaba?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
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
                                        'name': 'Strona Główna',
                                        'type': 'hero',
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
                            },
                            'services': {
                                'id': 'services',
                                'name': 'Usługi',
                                'path': '/uslugi',
                                'modules': [
                                    {
                                        'id': 'services_photography',
                                        'type': 'services',
                                        'name': 'Oferta',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Zakres usług fotograficznych',
                                            'subtitle': 'Tworzę portrety, które opowiadają historię Twojej marki',
                                            'bgColor': '#FFFFFF',
                                            'textColor': '#111111',
                                            'accentColor': '#FF3366',
                                            'items': [
                                                {
                                                    'id': 'photo-service-1',
                                                    'name': 'Portrety biznesowe',
                                                    'category': 'Sesje',
                                                    'description': '<p>Profesjonalne ujęcia do wykorzystania na stronie, LinkedIn i materiałach PR. Otrzymujesz 10 obrobionych kadrów.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'photo-service-2',
                                                    'name': 'Reportaż z wydarzenia',
                                                    'category': 'Event',
                                                    'description': '<p>Dokumentacja wizualna konferencji, warsztatu lub spotkania firmowego. 6-godzinne zlecenie z galerią online.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'photo-service-3',
                                                    'name': 'Sesja wizerunkowa',
                                                    'category': 'Marka osobista',
                                                    'description': '<p>Kreujemy spójną historię Twojej marki. W cenie moodboard, stylizacja oraz 15 kadrów w wysokiej rozdzielczości.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
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
                },
                {
                    'name': 'Minimalist Portfolio',
                    'description': 'Minimalistyczny szablon dla projektantów i twórców wizualnych.',
                    'template_config': {
                        'name': 'Minimalist Portfolio',
                        'themeId': 'oceanCalm',
                        'pages': {
                            'home': {
                                'id': 'home',
                                'name': 'Home',
                                'path': '/',
                                'modules': [
                                    {
                                        'id': 'hero_minimal',
                                        'name': 'Strona Główna',
                                        'type': 'hero',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Jane Doe',
                                            'subtitle': 'Visual Designer & Artist',
                                            'bgColor': '#FFFFFF',
                                            'textColor': '#111111'
                                        }
                                    }
                                ]
                            },
                            'portfolio': {
                                'id': 'portfolio',
                                'name': 'Portfolio',
                                'path': '/portfolio',
                                'modules': [
                                    {
                                        'id': 'portfolio_gallery',
                                        'name': 'Galeria',
                                        'type': 'gallery',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'images': [],
                                            'columns': 3,
                                            'gap': '2rem',
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
                                        'id': 'about_story',
                                        'name': 'Historia',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<h2>Spotkajmy się</h2><p>Tworzę estetyczne doświadczenia cyfrowe i fizyczne.</p>',
                                            'align': 'center',
                                            'fontSize': '18px',
                                            'textColor': '#1a2330'
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
                                        'id': 'services_minimal',
                                        'name': 'Zakres usług',
                                        'type': 'services',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'W czym mogę pomóc',
                                            'subtitle': 'Projektuję spójne doświadczenia marek w świecie cyfrowym i fizycznym',
                                            'bgColor': '#FFFFFF',
                                            'textColor': '#111111',
                                            'accentColor': '#111111',
                                            'items': [
                                                {
                                                    'id': 'minimal-service-1',
                                                    'name': 'Strategia marki',
                                                    'category': 'Branding',
                                                    'description': '<p>Warsztaty, mapa wartości oraz system komunikacji w jednym projekcie.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'minimal-service-2',
                                                    'name': 'UX/UI produktów cyfrowych',
                                                    'category': 'Produkt',
                                                    'description': '<p>Makiety, prototypy i design system dla aplikacji lub strony internetowej.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'minimal-service-3',
                                                    'name': 'Ilustracje na zamówienie',
                                                    'category': 'Ilustracja',
                                                    'description': '<p>Autorskie grafiki wspierające identyfikację wizualną Twojej marki.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'testimonials': {
                                'id': 'testimonials',
                                'name': 'Opinie',
                                'path': '/opinie',
                                'modules': [
                                    {
                                        'id': 'minimal_quotes',
                                        'name': 'Referencje',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<blockquote>"Współpraca była intuicyjna i przyjemna." – Klient A</blockquote>',
                                            'align': 'center',
                                            'fontSize': '16px',
                                            'textColor': '#1a2330'
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
                                            'email': 'hello@janedoe.design',
                                            'phone': '+48 777 888 999',
                                            'bgColor': '#f5f7fa'
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    'thumbnail_url': None
                },
                {
                    'name': 'Urban Coach',
                    'description': 'Energetyczny motyw dla trenerów personalnych w mieście.',
                    'template_config': {
                        'name': 'Urban Coach',
                        'themeId': 'sunsetWarmth',
                        'pages': {
                            'home': {
                                'id': 'home',
                                'name': 'Home',
                                'path': '/',
                                'modules': [
                                    {
                                        'id': 'hero_urban',
                                        'name': 'Strona Główna',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Urban Coach',
                                            'subtitle': 'Treningi funkcjonalne w sercu miasta',
                                            'bgColor': '#f6eee6',
                                            'textColor': '#2a1a14'
                                        }
                                    }
                                ]
                            },
                            'programs': {
                                'id': 'programs',
                                'name': 'Programy',
                                'path': '/programy',
                                'modules': [
                                    {
                                        'id': 'programs_services',
                                        'name': 'Programy treningowe',
                                        'type': 'services',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Programy treningowe',
                                            'subtitle': 'Dobierz plan, który pasuje do Twojego trybu dnia',
                                            'bgColor': '#FFFFFF',
                                            'textColor': '#2a1a14',
                                            'accentColor': '#ff6b35',
                                            'items': [
                                                {
                                                    'id': 'urban-service-1',
                                                    'name': 'HIIT 45',
                                                    'category': 'Grupowy',
                                                    'description': '<p>Dynamiczny trening metaboliczny w kameralnej grupie. Idealny dla osób, które potrzebują dodatkowego kopa energii.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'urban-service-2',
                                                    'name': 'Mobility Flow',
                                                    'category': 'Mobilność',
                                                    'description': '<p>Praca nad zakresem ruchu i stabilnością. Wykorzystujemy taśmy, mini bandy i oddech.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'urban-service-3',
                                                    'name': 'Strength Coaching',
                                                    'category': '1:1',
                                                    'description': '<p>Indywidualne sesje nastawione na budowanie siły funkcjonalnej i poprawę techniki ćwiczeń.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1583454159588-0c18427f29dc?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'schedule': {
                                'id': 'schedule',
                                'name': 'Grafik',
                                'path': '/grafik',
                                'modules': [
                                    {
                                        'id': 'urban_schedule',
                                        'name': 'Plan zajęć',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<p>Poniedziałek: Cardio Blast<br/>Środa: Mobilność<br/>Sobota: Outdoor Bootcamp</p>',
                                            'align': 'left',
                                            'fontSize': '16px',
                                            'textColor': '#2a1a14'
                                        }
                                    }
                                ]
                            },
                            'media': {
                                'id': 'media',
                                'name': 'Wideo',
                                'path': '/media',
                                'modules': [
                                    {
                                        'id': 'urban_video',
                                        'name': 'Sesja promocyjna',
                                        'type': 'video',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'videoUrl': 'https://www.youtube.com/watch?v=l482T0yNkeo',
                                            'caption': 'Zobacz jak wyglądają nasze treningi',
                                            'bgColor': '#f6eee6'
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
                                        'id': 'urban_pricing',
                                        'name': 'Pakiety',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<ul><li>Sesja indywidualna – 180 zł</li><li>Karnet 10 wejść – 850 zł</li></ul>',
                                            'align': 'left',
                                            'fontSize': '16px',
                                            'textColor': '#2a1a14'
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
                                            'email': 'urban@coach.pl',
                                            'phone': '+48 500 600 700',
                                            'bgColor': '#f6eee6'
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    'thumbnail_url': None
                },
                {
                    'name': 'Serene Spa',
                    'description': 'Delikatny motyw dla spa i gabinetów odnowy.',
                    'template_config': {
                        'name': 'Serene Spa',
                        'themeId': 'lavenderDream',
                        'pages': {
                            'home': {
                                'id': 'home',
                                'name': 'Home',
                                'path': '/',
                                'modules': [
                                    {
                                        'id': 'hero_serene',
                                        'name': 'Strona Główna',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Serene Spa',
                                            'subtitle': 'Rytuały relaksu i piękna',
                                            'bgColor': '#f2eef9',
                                            'textColor': '#211c2c'
                                        }
                                    }
                                ]
                            },
                            'treatments': {
                                'id': 'treatments',
                                'name': 'Zabiegi',
                                'path': '/zabiegi',
                                'modules': [
                                    {
                                        'id': 'spa_treatments',
                                        'name': 'Oferta zabiegów',
                                        'type': 'services',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Rytuały, które otulają zmysły',
                                            'subtitle': 'Wybierz zabieg dopasowany do potrzeb Twojego ciała',
                                            'bgColor': '#FFFFFF',
                                            'textColor': '#211c2c',
                                            'accentColor': '#a685e2',
                                            'items': [
                                                {
                                                    'id': 'spa-service-1',
                                                    'name': 'Aromaterapia balansująca',
                                                    'category': 'Relaks',
                                                    'description': '<p>60 minut masażu z olejkami lawendy i bergamotki, zakończone seansą w strefie odpoczynku.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1556228578-ecb7eb0198eb?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'spa-service-2',
                                                    'name': 'Masaż gorącymi kamieniami',
                                                    'category': 'Regeneracja',
                                                    'description': '<p>Głęboko relaksujący rytuał z kamieniami bazaltowymi, który rozluźnia mięśnie i uwalnia napięcia.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'spa-service-3',
                                                    'name': 'Rytuał glow dla twarzy',
                                                    'category': 'Beauty',
                                                    'description': '<p>Kompleksowy zabieg z masażem kobido, maską algową i aromatyczną świecą sojową.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
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
                                        'id': 'spa_gallery',
                                        'name': 'Wnętrza spa',
                                        'type': 'gallery',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'images': [],
                                            'columns': 2,
                                            'gap': '1.5rem',
                                            'style': 'grid'
                                        }
                                    }
                                ]
                            },
                            'wellness': {
                                'id': 'wellness',
                                'name': 'Wellness',
                                'path': '/wellness',
                                'modules': [
                                    {
                                        'id': 'wellness_tips',
                                        'name': 'Porady',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<h2>Porady dla Ciebie</h2><p>Dowiedz się jak zadbać o ciało i umysł między wizytami.</p>',
                                            'align': 'center',
                                            'fontSize': '18px',
                                            'textColor': '#211c2c'
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
                                            'email': 'kontakt@serenespa.pl',
                                            'phone': '+48 600 700 800',
                                            'bgColor': '#f2eef9'
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    'thumbnail_url': None
                },
                {
                    'name': 'Holistic Retreat',
                    'description': 'Szablon dla ośrodków holistycznych i warsztatów rozwojowych.',
                    'template_config': {
                        'name': 'Holistic Retreat',
                        'themeId': 'sereneForest',
                        'pages': {
                            'home': {
                                'id': 'home',
                                'name': 'Home',
                                'path': '/',
                                'modules': [
                                    {
                                        'id': 'hero_retreat',
                                        'name': 'Strona Główna',
                                        'type': 'hero',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Holistic Retreat',
                                            'subtitle': 'Przestrzeń dla ciała i ducha',
                                            'bgColor': '#edf2e6',
                                            'textColor': '#1a261d'
                                        }
                                    }
                                ]
                            },
                            'agenda': {
                                'id': 'agenda',
                                'name': 'Agenda',
                                'path': '/agenda',
                                'modules': [
                                    {
                                        'id': 'retreat_agenda',
                                        'name': 'Plan dnia',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<p>8:00 Medytacja<br/>10:00 Warsztaty<br/>18:00 Krąg dzielenia</p>',
                                            'align': 'center',
                                            'fontSize': '16px',
                                            'textColor': '#1a261d'
                                        }
                                    }
                                ]
                            },
                            'offerings': {
                                'id': 'offerings',
                                'name': 'Moduły',
                                'path': '/moduly',
                                'modules': [
                                    {
                                        'id': 'retreat_services',
                                        'name': 'Program pobytu',
                                        'type': 'services',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Elementy programu',
                                            'subtitle': 'Każde doświadczenie łączy pracę z ciałem, oddechem i przestrzeń na integrację',
                                            'bgColor': '#FFFFFF',
                                            'textColor': '#1a261d',
                                            'accentColor': '#6b705c',
                                            'items': [
                                                {
                                                    'id': 'retreat-service-1',
                                                    'name': 'Kręgi poranne',
                                                    'category': 'Ruch',
                                                    'description': '<p>Rozpoczynamy dzień od łagodnego rozruszania ciała i zakotwiczenia w oddechu.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'retreat-service-2',
                                                    'name': 'Warsztaty transformujące',
                                                    'category': 'Rozwój',
                                                    'description': '<p>Praca w kręgu z praktykami uważności, prowadzone przez doświadczonych mentorów.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'retreat-service-3',
                                                    'name': 'Strefa regeneracji',
                                                    'category': 'Regeneracja',
                                                    'description': '<p>Cisza, sauna, prowadzone relaksacje z dźwiękiem, aby w pełni odpuścić napięcia.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1523875194681-bedd468c58bf?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'facilitators': {
                                'id': 'facilitators',
                                'name': 'Prowadzący',
                                'path': '/prowadzacy',
                                'modules': [
                                    {
                                        'id': 'retreat_team',
                                        'name': 'Opiekunowie',
                                        'type': 'team',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Opiekunowie procesu',
                                            'subtitle': 'Mentorzy i terapeuci, którzy prowadzą program',
                                            'bgColor': '#FFFFFF',
                                            'textColor': '#1a261d',
                                            'accentColor': '#6b705c',
                                            'members': [
                                                {
                                                    'id': 'retreat-team-1',
                                                    'name': 'Karolina Borkowska',
                                                    'role': 'Mentorka mindfulness',
                                                    'bio': '<p>Prowadzi sesje medytacji i świadomego ruchu, łącząc neurobiologię z praktyką uważności.</p>',
                                                    'focus': '<p>Specjalizacja: redukcja stresu, budowanie rezyliencji, praca z oddechem.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'retreat-team-2',
                                                    'name': 'Jakub Lis',
                                                    'role': 'Terapeuta ruchu',
                                                    'bio': '<p>Łączy elementy jogi, tańca intuicyjnego i pracy z powięzią dla głębokiego uwolnienia napięć.</p>',
                                                    'focus': '<p>Specjalizacja: praca z ciałem, grounding, ekspresja emocji.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'retreat-team-3',
                                                    'name': 'Mira Ostrowska',
                                                    'role': 'Terapeutka dźwiękiem',
                                                    'bio': '<p>Tworzy przestrzenie do regeneracji poprzez dźwięki mis, gongów i instrumentów etnicznych.</p>',
                                                    'focus': '<p>Prowadzi: koncerty relaksacyjne, sesje indywidualne, wieczorne rytuały.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
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
                                        'id': 'retreat_gallery',
                                        'name': 'Miejsce',
                                        'type': 'gallery',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'images': [],
                                            'columns': 3,
                                            'gap': '1rem',
                                            'style': 'grid'
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
                                            'email': 'hello@holisticretreat.pl',
                                            'phone': '+48 660 123 456',
                                            'bgColor': '#edf2e6'
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    'thumbnail_url': None
                },
                {
                    'name': 'Digital Creator',
                    'description': 'Szablon dla twórców internetowych i edukatorów online.',
                    'template_config': {
                        'name': 'Digital Creator',
                        'themeId': 'modernWellness',
                        'pages': {
                            'home': {
                                'id': 'home',
                                'name': 'Home',
                                'path': '/',
                                'modules': [
                                    {
                                        'id': 'hero_creator',
                                        'name': 'Strona Główna',
                                        'type': 'hero',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Digital Creator',
                                            'subtitle': 'Buduj markę i społeczność z łatwością',
                                            'bgColor': 'rgb(228, 229, 218)',
                                            'textColor': 'rgb(30, 30, 30)'
                                        }
                                    }
                                ]
                            },
                            'courses': {
                                'id': 'courses',
                                'name': 'Kursy',
                                'path': '/kursy',
                                'modules': [
                                    {
                                        'id': 'creator_courses',
                                        'name': 'Oferta kursów',
                                        'type': 'services',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Programy dla twórców',
                                            'subtitle': 'Intensywne kursy i mastermindy, które przyspieszają rozwój Twojej marki',
                                            'bgColor': '#FFFFFF',
                                            'textColor': 'rgb(30, 30, 30)',
                                            'accentColor': 'rgb(146, 0, 32)',
                                            'items': [
                                                {
                                                    'id': 'creator-service-1',
                                                    'name': 'Budowa marki osobistej',
                                                    'category': 'Program 6-tyg.',
                                                    'description': '<p>Strategia, identyfikacja wizualna i plan komunikacji krok po kroku, z cotygodniowymi sesjami live.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'creator-service-2',
                                                    'name': 'Podcast od podstaw',
                                                    'category': 'Warsztat',
                                                    'description': '<p>Od pierwszego pomysłu, przez sprzęt, nagrania i promocję. Zawiera checklisty i szablony odcinków.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=60'
                                                },
                                                {
                                                    'id': 'creator-service-3',
                                                    'name': 'Monetyzacja treści',
                                                    'category': 'Mastermind',
                                                    'description': '<p>Grupowy mastermind z planem wdrożenia produktów cyfrowych i sponsorów.</p>',
                                                    'image': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=60'
                                                }
                                            ]
                                        }
                                    }
                                ]
                            },
                            'community': {
                                'id': 'community',
                                'name': 'Społeczność',
                                'path': '/spolecznosc',
                                'modules': [
                                    {
                                        'id': 'creator_community',
                                        'name': 'Dołącz',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<p>Dołącz do grupy mastermind i spotkań live.</p>',
                                            'align': 'center',
                                            'fontSize': '16px',
                                            'textColor': 'rgb(30, 30, 30)'
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
                                            'email': 'hi@digitalcreator.pl',
                                            'phone': '+48 530 440 330',
                                            'bgColor': 'rgb(228, 229, 218)'
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    'thumbnail_url': None
                },
                {
                    'name': 'Artisan Bakery',
                    'description': 'Przytulny motyw dla piekarni i kawiarni.',
                    'template_config': {
                        'name': 'Artisan Bakery',
                        'themeId': 'sunsetWarmth',
                        'pages': {
                            'home': {
                                'id': 'home',
                                'name': 'Home',
                                'path': '/',
                                'modules': [
                                    {
                                        'id': 'hero_bakery',
                                        'name': 'Strona Główna',
                                        'type': 'hero',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Artisan Bakery',
                                            'subtitle': 'Świeże wypieki każdego poranka',
                                            'bgColor': '#f6eee6',
                                            'textColor': '#2a1a14'
                                        }
                                    }
                                ]
                            },
                            'menu': {
                                'id': 'menu',
                                'name': 'Menu',
                                'path': '/menu',
                                'modules': [
                                    {
                                        'id': 'bakery_menu',
                                        'name': 'Menu',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<ul><li>Chleb na zakwasie</li><li>Rogale maślane</li><li>Kawa specialty</li></ul>',
                                            'align': 'left',
                                            'fontSize': '16px',
                                            'textColor': '#2a1a14'
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
                                        'id': 'bakery_gallery',
                                        'name': 'Nasze wypieki',
                                        'type': 'gallery',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'images': [],
                                            'columns': 3,
                                            'gap': '1rem',
                                            'style': 'grid'
                                        }
                                    }
                                ]
                            },
                            'story': {
                                'id': 'story',
                                'name': 'Nasza historia',
                                'path': '/historia',
                                'modules': [
                                    {
                                        'id': 'bakery_story',
                                        'name': 'Historia',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<p>Piekarnia rodzinna od trzech pokoleń.</p>',
                                            'align': 'center',
                                            'fontSize': '16px',
                                            'textColor': '#2a1a14'
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
                                            'email': 'hello@artisanbakery.pl',
                                            'phone': '+48 123 987 654',
                                            'bgColor': '#f6eee6'
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    'thumbnail_url': None
                },
                {
                    'name': 'Tech Freelancer',
                    'description': 'Czytelny układ dla programistów i konsultantów technologicznych.',
                    'template_config': {
                        'name': 'Tech Freelancer',
                        'themeId': 'oceanCalm',
                        'pages': {
                            'home': {
                                'id': 'home',
                                'name': 'Home',
                                'path': '/',
                                'modules': [
                                    {
                                        'id': 'hero_tech',
                                        'name': 'Strona Główna',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'title': 'Tech Freelancer',
                                            'subtitle': 'Buduję produkty SaaS i rozwiązania AI',
                                            'bgColor': '#e6eef5',
                                            'textColor': '#1a2330'
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
                                        'id': 'tech_services',
                                        'name': 'Usługi',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<ul><li>Architektura systemów</li><li>AI Consulting</li><li>Szkolenia zespołów</li></ul>',
                                            'align': 'left',
                                            'fontSize': '16px',
                                            'textColor': '#1a2330'
                                        }
                                    }
                                ]
                            },
                            'case_studies': {
                                'id': 'case_studies',
                                'name': 'Case studies',
                                'path': '/case-studies',
                                'modules': [
                                    {
                                        'id': 'tech_cases',
                                        'name': 'Realizacje',
                                        'type': 'text',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'content': '<p>Platforma e-commerce, chatbot AI, system analityczny.</p>',
                                            'align': 'left',
                                            'fontSize': '16px',
                                            'textColor': '#1a2330'
                                        }
                                    }
                                ]
                            },
                            'video': {
                                'id': 'video',
                                'name': 'Prezentacja',
                                'path': '/prezentacja',
                                'modules': [
                                    {
                                        'id': 'tech_video',
                                        'name': 'Intro video',
                                        'type': 'video',
                                        'enabled': True,
                                        'order': 0,
                                        'config': {
                                            'videoUrl': 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
                                            'caption': 'Poznaj podejście do pracy projektowej',
                                            'bgColor': '#e6eef5'
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
                                            'email': 'contact@techfreelancer.dev',
                                            'phone': '+48 888 222 111',
                                            'bgColor': '#e6eef5'
                                        }
                                    }
                                ]
                            }
                        }
                    },
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