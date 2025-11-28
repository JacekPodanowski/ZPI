"""
Testy jednostkowe dla backendu generatora stron osobistych (multi-tenant).

Te testy pokrywają reprezentatywne elementy platformy:
- Modele: PlatformUser, Site, Event, MagicLink, TeamMember
- Funkcje pomocnicze: generate_site_identifier, get_avatar_color, get_avatar_letter
- Serializery: CustomRegisterSerializer, EventSerializer, AvailabilityBlockSerializer
- Widoki API: uprawnienia oparte na rolach, logika biznesowa
"""

from datetime import date, time, timedelta
from decimal import Decimal
from unittest.mock import patch, MagicMock

from django.test import TestCase, RequestFactory
from django.utils import timezone
from django.db import IntegrityError
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.test import APIClient, APITestCase
from rest_framework import status

from .models import (
    PlatformUser,
    Site,
    SiteVersion,
    Event,
    AvailabilityBlock,
    Booking,
    Client,
    MagicLink,
    TeamMember,
    Testimonial,
    BigEvent,
)
from .serializers import (
    CustomRegisterSerializer,
    PlatformUserSerializer,
    SiteSerializer,
    EventSerializer,
    AvailabilityBlockSerializer,
    TeamMemberSerializer,
    TestimonialSerializer,
)
from .utils import generate_site_identifier, get_avatar_color, get_avatar_letter


# =============================================================================
# TESTY FUNKCJI POMOCNICZYCH (UTILS)
# =============================================================================

class GenerateSiteIdentifierTests(TestCase):
    """
    Testy funkcji generate_site_identifier.
    
    Ta funkcja generuje unikalny identyfikator strony w formacie '<id>-<slug>',
    który jest używany do tworzenia URL-i i subdomen stron użytkowników.
    """

    def test_basic_identifier_generation(self):
        """
        Sprawdza podstawowy format identyfikatora: id-slug.
        Oczekiwany wynik: '100-my-yoga-studio' dla nazwy 'My Yoga Studio'.
        """
        result = generate_site_identifier(100, "My Yoga Studio", "Jan", "Kowalski")
        self.assertEqual(result, "100-my-yoga-studio")

    def test_identifier_with_polish_characters(self):
        """
        Sprawdza czy polskie znaki są prawidłowo zamieniane na ASCII (slugify).
        Znaki takie jak ó, ę, ą powinny być usunięte lub zamienione.
        """
        result = generate_site_identifier(101, "Pracownia Jógi Świętej", "Józef", "Żółć")
        self.assertIn("101-", result)
        # Polskie znaki powinny być usunięte przez slugify
        self.assertNotIn("ó", result)
        self.assertNotIn("ę", result)

    def test_identifier_with_empty_name(self):
        """
        Sprawdza fallback gdy nazwa jest pustym stringiem.
        Powinien użyć domyślnego slugu 'site'.
        """
        result = generate_site_identifier(102, "", "Jan", "Kowalski")
        self.assertEqual(result, "102-site")

    def test_identifier_with_none_name(self):
        """
        Sprawdza fallback gdy nazwa jest None.
        Powinien użyć domyślnego slugu 'site'.
        """
        result = generate_site_identifier(103, None, "Jan", "Kowalski")
        self.assertEqual(result, "103-site")

    def test_showcase_site_identifier(self):
        """
        Sprawdza zarezerwowany ID 1 dla strony pokazowej (demo).
        Strona pokazowa ma specjalny identyfikator '1-youreasysite-demo'.
        """
        result = generate_site_identifier(1, "YourEasySite Demo", None, None)
        self.assertEqual(result, "1-youreasysite-demo")

    def test_identifier_max_length(self):
        """
        Sprawdza czy identyfikator jest obcinany do maksymalnie 255 znaków.
        Jest to limit pola SlugField w bazie danych.
        """
        long_name = "A" * 300
        result = generate_site_identifier(999, long_name, "Jan", "Kowalski")
        self.assertLessEqual(len(result), 255)


class AvatarUtilsTests(TestCase):
    """
    Testy funkcji generujących kolory i litery avatarów.
    
    Avatary są generowane deterministycznie na podstawie nazwy użytkownika,
    co zapewnia spójność wizualną bez konieczności przechowywania dodatkowych danych.
    """

    def test_get_avatar_color_deterministic(self):
        """
        Sprawdza czy ta sama nazwa zawsze zwraca ten sam kolor.
        Gwarantuje to spójność wizualną avatara użytkownika.
        """
        color1 = get_avatar_color("Jan Kowalski")
        color2 = get_avatar_color("Jan Kowalski")
        self.assertEqual(color1, color2)

    def test_get_avatar_color_different_names(self):
        """
        Sprawdza czy różne nazwy mogą zwracać różne kolory.
        Uwaga: Niektóre nazwy mogą przypadkowo trafić na ten sam kolor,
        ale większość powinna mieć różne kolory.
        """
        colors = set()
        names = ["Jan", "Anna", "Piotr", "Maria", "Krzysztof", "Ewa"]
        for name in names:
            colors.add(get_avatar_color(name))
        # Przynajmniej kilka kolorów powinno być różnych
        self.assertGreater(len(colors), 1)

    def test_get_avatar_color_empty_name(self):
        """
        Sprawdza fallback dla pustej nazwy.
        Powinien zwrócić domyślny kolor z palety (pierwszy).
        """
        color = get_avatar_color("")
        self.assertIsNotNone(color)
        self.assertTrue(color.startswith("#"))

    def test_get_avatar_letter_from_first_name(self):
        """
        Sprawdza ekstrakcję pierwszej litery z imienia.
        'Jan' powinno zwrócić 'J'.
        """
        letter = get_avatar_letter("Jan")
        self.assertEqual(letter, "J")

    def test_get_avatar_letter_lowercase_input(self):
        """
        Sprawdza czy litera jest zawsze wielka (uppercase).
        Nawet gdy imię jest z małej litery, avatar powinien pokazać wielką.
        """
        letter = get_avatar_letter("jan")
        self.assertEqual(letter, "J")

    def test_get_avatar_letter_email_fallback(self):
        """
        Sprawdza fallback na email gdy imię jest puste.
        Gdy brak imienia, używamy pierwszej litery adresu email.
        """
        letter = get_avatar_letter("", "jan@example.com")
        self.assertEqual(letter, "J")

    def test_get_avatar_letter_no_input(self):
        """
        Sprawdza fallback gdy brak jakichkolwiek danych wejściowych.
        Powinien zwrócić znak zapytania '?' jako placeholder.
        """
        letter = get_avatar_letter(None, None)
        self.assertEqual(letter, "?")


# =============================================================================
# TESTY MODELI BAZODANOWYCH
# =============================================================================

class PlatformUserModelTests(TestCase):
    """
    Testy modelu PlatformUser (użytkownik platformy).
    
    Model ten rozszerza AbstractBaseUser Django i reprezentuje twórców stron
    (właścicieli kont w systemie). Obsługuje różne typy kont (Free, Pro, Pro+)
    oraz źródła rejestracji (Web, Zaproszenie zespołowe).
    """

    def test_create_user(self):
        """
        Sprawdza podstawowe tworzenie użytkownika.
        Nowy użytkownik powinien mieć:
        - Poprawny email i imię
        - Brak uprawnień administratora (is_staff=False, is_superuser=False)
        - Domyślny typ konta FREE
        """
        user = PlatformUser.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Jan"
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.first_name, "Jan")
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.account_type, PlatformUser.AccountType.FREE)

    def test_create_superuser(self):
        """
        Sprawdza tworzenie superusera z podwyższonymi uprawnieniami.
        Superuser powinien mieć:
        - is_staff=True (dostęp do panelu admina)
        - is_superuser=True (pełne uprawnienia)
        - Typ konta PRO (automatycznie przyznawany adminom)
        """
        admin = PlatformUser.objects.create_superuser(
            email="admin@example.com",
            password="adminpass123",
            first_name="Admin"
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertEqual(admin.account_type, PlatformUser.AccountType.PRO)

    def test_get_full_name(self):
        """
        Sprawdza generowanie pełnego imienia i nazwiska.
        Metoda get_full_name() łączy first_name i last_name spacją.
        """
        user = PlatformUser.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Jan",
            last_name="Kowalski"
        )
        self.assertEqual(user.get_full_name(), "Jan Kowalski")

    def test_get_full_name_without_last_name(self):
        """
        Sprawdza generowanie pełnego imienia gdy brak nazwiska.
        Gdy last_name jest None, powinno zwrócić samo imię bez spacji.
        """
        user = PlatformUser.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Jan"
        )
        self.assertEqual(user.get_full_name(), "Jan")

    def test_email_uniqueness(self):
        """
        Sprawdza czy duplikaty emaili są odrzucane przez bazę danych.
        Każdy użytkownik musi mieć unikalny adres email (constraint UNIQUE).
        """
        PlatformUser.objects.create_user(
            email="unique@example.com",
            password="pass123",
            first_name="First"
        )
        with self.assertRaises(IntegrityError):
            PlatformUser.objects.create_user(
                email="unique@example.com",
                password="pass456",
                first_name="Second"
            )


class SiteModelTests(TestCase):
    """
    Testy modelu Site (strona użytkownika).
    
    Model Site reprezentuje pojedynczą stronę osobistą tworzoną przez użytkownika.
    Każdy użytkownik może mieć maksymalnie 3 strony (ograniczenie w logice biznesowej).
    Model automatycznie generuje identyfikator i subdomenę na podstawie nazwy.
    """

    def setUp(self):
        """Tworzy użytkownika-właściciela do testów."""
        self.owner = PlatformUser.objects.create_user(
            email="owner@example.com",
            password="pass123",
            first_name="Owner"
        )

    def test_site_creation(self):
        """
        Sprawdza podstawowe tworzenie strony.
        Nowa strona powinna mieć:
        - Podaną nazwę
        - Przypisanego właściciela
        - Domyślnie niepublikowana (is_published=False)
        """
        site = Site.objects.create(
            owner=self.owner,
            name="Test Site"
        )
        self.assertEqual(site.name, "Test Site")
        self.assertEqual(site.owner, self.owner)
        self.assertFalse(site.is_published)

    def test_site_identifier_auto_generation(self):
        """
        Sprawdza automatyczne generowanie identyfikatora przy zapisie.
        Identyfikator jest tworzony w formacie '<id>-<slug-nazwy>'
        i używany do budowy URL-i publicznych stron.
        """
        site = Site.objects.create(
            owner=self.owner,
            name="My Yoga Studio"
        )
        # Odświeżamy z bazy aby pobrać wygenerowany identyfikator
        site.refresh_from_db()
        self.assertIsNotNone(site.identifier)
        self.assertIn(str(site.id), site.identifier)
        self.assertIn("my-yoga-studio", site.identifier)

    def test_site_subdomain_auto_generation(self):
        """
        Sprawdza automatyczne generowanie subdomeny na podstawie identyfikatora.
        Subdomena ma format '<identyfikator>.youreasysite.pl'.
        """
        site = Site.objects.create(
            owner=self.owner,
            name="Test Site"
        )
        site.refresh_from_db()
        self.assertIsNotNone(site.subdomain)
        self.assertIn(".youreasysite.pl", site.subdomain)

    def test_site_color_index_default(self):
        """
        Sprawdza domyślny indeks koloru dla nowej strony.
        System obsługuje 12 kolorów (indeksy 0-11), domyślny to 0.
        Kolory są automatycznie przydzielane kolejnym stronom użytkownika.
        """
        site = Site.objects.create(
            owner=self.owner,
            name="Test Site"
        )
        self.assertEqual(site.color_index, 0)


class EventModelTests(TestCase):
    """
    Testy modelu Event (wydarzenie/sesja).
    
    Model Event reprezentuje pojedynczą sesję lub spotkanie w kalendarzu.
    Może być przypisany do właściciela lub członka zespołu.
    Obsługuje zarówno sesje indywidualne jak i grupowe z określoną pojemnością.
    """

    def setUp(self):
        """Tworzy właściciela i stronę do testów."""
        self.owner = PlatformUser.objects.create_user(
            email="owner@example.com",
            password="pass123",
            first_name="Owner"
        )
        self.site = Site.objects.create(
            owner=self.owner,
            name="Test Site"
        )

    def test_event_creation(self):
        """
        Sprawdza podstawowe tworzenie wydarzenia.
        Wydarzenie wymaga:
        - Powiązania ze stroną (site)
        - Twórcy (creator)
        - Tytułu, czasów rozpoczęcia/zakończenia
        - Pojemności (capacity)
        - Przypisania do osoby (owner lub team_member)
        """
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=2)
        
        event = Event.objects.create(
            site=self.site,
            creator=self.owner,
            title="Yoga Session",
            start_time=start,
            end_time=end,
            capacity=10,
            assigned_to_owner=self.owner
        )
        self.assertEqual(event.title, "Yoga Session")
        self.assertEqual(event.capacity, 10)
        self.assertEqual(event.event_type, Event.EventType.INDIVIDUAL)

    def test_event_end_after_start_constraint(self):
        """
        Sprawdza ograniczenie bazy danych: end_time musi być po start_time.
        Jest to CHECK constraint w PostgreSQL zapobiegający logicznym błędom.
        """
        start = timezone.now() + timedelta(hours=1)
        end = start - timedelta(hours=1)  # Koniec przed startem - błąd!
        
        event = Event(
            site=self.site,
            creator=self.owner,
            title="Invalid Event",
            start_time=start,
            end_time=end,
            capacity=5,
            assigned_to_owner=self.owner
        )
        with self.assertRaises(IntegrityError):
            event.save()

    def test_event_unlimited_capacity(self):
        """
        Sprawdza czy -1 oznacza nieograniczoną pojemność.
        Używane dla wydarzeń masowych bez limitu uczestników.
        """
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=2)
        
        event = Event.objects.create(
            site=self.site,
            creator=self.owner,
            title="Unlimited Event",
            start_time=start,
            end_time=end,
            capacity=-1,  # Nieograniczona pojemność
            assigned_to_owner=self.owner
        )
        self.assertEqual(event.capacity, -1)


class MagicLinkModelTests(TestCase):
    """
    Testy modelu MagicLink (link magiczny do logowania).
    
    Magic linki umożliwiają logowanie bez hasła poprzez kliknięcie w link
    wysłany na email. Są też używane do resetowania hasła i zaproszeń zespołowych.
    Linki mają ograniczony czas ważności i mogą być użyte tylko raz.
    """

    def setUp(self):
        """Tworzy użytkownika do testów."""
        self.user = PlatformUser.objects.create_user(
            email="test@example.com",
            password="pass123",
            first_name="Test"
        )

    def test_magic_link_creation(self):
        """
        Sprawdza tworzenie magic linka z prawidłowym czasem wygaśnięcia.
        Token powinien być:
        - 64 znaki długości (bezpieczny losowy string)
        - Nieużyty (used=False)
        - Ważny (is_valid() zwraca True)
        """
        magic_link = MagicLink.create_for_email(
            email=self.user.email,
            expiry_minutes=15
        )
        self.assertIsNotNone(magic_link.token)
        self.assertEqual(len(magic_link.token), 64)
        self.assertFalse(magic_link.used)
        self.assertTrue(magic_link.is_valid())

    def test_magic_link_expiration(self):
        """
        Sprawdza czy wygasły magic link jest nieprawidłowy.
        Po upływie czasu ważności is_valid() powinno zwracać False.
        """
        magic_link = MagicLink.create_for_email(
            email=self.user.email,
            expiry_minutes=15
        )
        # Ręcznie ustawiamy wygaśnięcie w przeszłości
        magic_link.expires_at = timezone.now() - timedelta(minutes=1)
        magic_link.save()
        
        self.assertFalse(magic_link.is_valid())

    def test_magic_link_mark_as_used(self):
        """
        Sprawdza oznaczanie magic linka jako użytego.
        Po użyciu:
        - used=True
        - used_at zawiera timestamp użycia
        - is_valid() zwraca False (nie można użyć ponownie)
        """
        magic_link = MagicLink.create_for_email(
            email=self.user.email,
            expiry_minutes=15
        )
        magic_link.mark_as_used()
        
        self.assertTrue(magic_link.used)
        self.assertIsNotNone(magic_link.used_at)
        self.assertFalse(magic_link.is_valid())

    def test_magic_link_action_types(self):
        """
        Sprawdza różne typy akcji magic linków.
        - LOGIN: logowanie bez hasła
        - PASSWORD_RESET: reset hasła
        - TEAM_INVITATION: zaproszenie do zespołu
        """
        login_link = MagicLink.create_for_email(
            email=self.user.email,
            expiry_minutes=15,
            action_type=MagicLink.ActionType.LOGIN
        )
        reset_link = MagicLink.create_for_email(
            email=self.user.email,
            expiry_minutes=30,
            action_type=MagicLink.ActionType.PASSWORD_RESET
        )
        
        self.assertEqual(login_link.action_type, MagicLink.ActionType.LOGIN)
        self.assertEqual(reset_link.action_type, MagicLink.ActionType.PASSWORD_RESET)


class TeamMemberModelTests(TestCase):
    """
    Testy modelu TeamMember (członek zespołu).
    
    Model reprezentuje członka zespołu strony z systemem zaproszeń i uprawnień.
    Członkowie mogą być:
    - MOCK: fikcyjni (tylko do wyświetlania)
    - INVITED: zaproszeni (mail wysłany, brak konta)
    - PENDING: oczekujący (mają konto, nie zaakceptowali)
    - LINKED: połączeni (aktywni członkowie zespołu)
    """

    def setUp(self):
        """Tworzy właściciela i stronę do testów."""
        self.owner = PlatformUser.objects.create_user(
            email="owner@example.com",
            password="pass123",
            first_name="Owner"
        )
        self.site = Site.objects.create(
            owner=self.owner,
            name="Test Site"
        )

    def test_team_member_creation(self):
        """
        Sprawdza podstawowe tworzenie członka zespołu.
        Nowy członek powinien mieć:
        - Podane dane (imię, email, opis roli)
        - Domyślny status MOCK (niezaproszony)
        - is_active=True (aktywny w systemie)
        """
        member = TeamMember.objects.create(
            site=self.site,
            name="Jan Kowalski",
            email="jan@example.com",
            role_description="Yoga Instructor",
            permission_role=TeamMember.PermissionRole.CONTRIBUTOR
        )
        self.assertEqual(member.name, "Jan Kowalski")
        self.assertEqual(member.invitation_status, TeamMember.InvitationStatus.MOCK)
        self.assertTrue(member.is_active)

    def test_team_member_invitation_token_unique(self):
        """
        Sprawdza czy tokeny zaproszeń są unikalne dla każdego członka.
        Token jest generowany automatycznie jako UUID i służy do
        weryfikacji linku zaproszenia.
        """
        member1 = TeamMember.objects.create(
            site=self.site,
            name="Member 1"
        )
        member2 = TeamMember.objects.create(
            site=self.site,
            name="Member 2"
        )
        self.assertNotEqual(member1.invitation_token, member2.invitation_token)

    def test_team_member_permission_roles(self):
        """
        Sprawdza różne uprawnienia członków zespołu.
        - VIEWER: tylko podgląd (read-only)
        - CONTRIBUTOR: może tworzyć własne wydarzenia
        - MANAGER: pełne zarządzanie kalendarzem
        """
        roles = [
            TeamMember.PermissionRole.VIEWER,
            TeamMember.PermissionRole.CONTRIBUTOR,
            TeamMember.PermissionRole.MANAGER,
        ]
        for role in roles:
            member = TeamMember.objects.create(
                site=self.site,
                name=f"Member {role}",
                permission_role=role
            )
            self.assertEqual(member.permission_role, role)


# =============================================================================
# TESTY SERIALIZERÓW (WALIDACJA I TRANSFORMACJA DANYCH)
# =============================================================================

class CustomRegisterSerializerTests(TestCase):
    """
    Testy serializera CustomRegisterSerializer (rejestracja użytkownika).
    
    Serializer obsługuje proces rejestracji nowych twórców stron.
    Waliduje dane wejściowe, sprawdza zgodność haseł i akceptację regulaminu,
    a następnie tworzy nieaktywnego użytkownika (aktywacja przez email).
    """

    def test_valid_registration_data(self):
        """
        Sprawdza czy serializer akceptuje prawidłowe dane rejestracji.
        Wymagane pola: imię, email, hasło, potwierdzenie hasła, akceptacja regulaminu.
        """
        data = {
            'first_name': 'Jan',
            'last_name': 'Kowalski',
            'email': 'jan@example.com',
            'password': 'securepass123',
            'password2': 'securepass123',
            'accept_terms': True
        }
        serializer = CustomRegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())

    def test_password_mismatch(self):
        """
        Sprawdza czy błędne hasła są odrzucane.
        password i password2 muszą być identyczne.
        """
        data = {
            'first_name': 'Jan',
            'email': 'jan@example.com',
            'password': 'password123',
            'password2': 'differentpass',
            'accept_terms': True
        }
        serializer = CustomRegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('detail', serializer.errors)

    def test_terms_not_accepted(self):
        """
        Sprawdza czy brak akceptacji regulaminu blokuje rejestrację.
        accept_terms=True jest wymagane ze względów prawnych (RODO).
        """
        data = {
            'first_name': 'Jan',
            'email': 'jan@example.com',
            'password': 'password123',
            'password2': 'password123',
            'accept_terms': False
        }
        serializer = CustomRegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_user_created_inactive(self):
        """
        Sprawdza czy utworzony użytkownik jest nieaktywny do weryfikacji email.
        is_active=False zapobiega logowaniu przed potwierdzeniem adresu email.
        """
        data = {
            'first_name': 'Jan',
            'last_name': 'Kowalski',
            'email': 'jan@example.com',
            'password': 'securepass123',
            'password2': 'securepass123',
            'accept_terms': True
        }
        serializer = CustomRegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        self.assertFalse(user.is_active)
        self.assertEqual(user.email, 'jan@example.com')


class EventSerializerTests(TestCase):
    """
    Testy serializera EventSerializer (wydarzenia/sesje).
    
    Serializer obsługuje tworzenie, edycję i wyświetlanie wydarzeń kalendarza.
    Zawiera walidację pojemności, czasów i przypisania do osoby prowadzącej.
    Dodaje też pola obliczeniowe jak assignment_type i assignment_label.
    """

    def setUp(self):
        """Przygotowuje dane testowe: właściciela i stronę."""
        self.owner = PlatformUser.objects.create_user(
            email="owner@example.com",
            password="pass123",
            first_name="Owner"
        )
        self.site = Site.objects.create(
            owner=self.owner,
            name="Test Site"
        )
        self.factory = RequestFactory()

    def test_event_serialization(self):
        """
        Sprawdza serializację istniejącego wydarzenia.
        Dane wyjściowe powinny zawierać wszystkie pola + pola obliczeniowe
        (assignment_type, assignment_label, bookings).
        """
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=2)
        
        event = Event.objects.create(
            site=self.site,
            creator=self.owner,
            title="Yoga Session",
            start_time=start,
            end_time=end,
            capacity=10,
            assigned_to_owner=self.owner
        )
        
        serializer = EventSerializer(event)
        data = serializer.data
        
        self.assertEqual(data['title'], "Yoga Session")
        self.assertEqual(data['capacity'], 10)
        self.assertEqual(data['assignment_type'], 'owner')

    def test_capacity_validation_positive(self):
        """
        Sprawdza walidację pojemności: musi być dodatnia lub -1.
        Wartość 0 jest nieprawidłowa (błąd logiczny).
        """
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=2)
        
        data = {
            'site': self.site.id,
            'title': 'Test Event',
            'start_time': start,
            'end_time': end,
            'capacity': 0,  # Nieprawidłowa wartość
            'assigned_to_owner': self.owner.id
        }
        serializer = EventSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('capacity', serializer.errors)

    def test_capacity_unlimited(self):
        """
        Sprawdza czy -1 jest akceptowane jako nieograniczona pojemność.
        Używane dla wydarzeń masowych bez limitu uczestników.
        """
        start = timezone.now() + timedelta(hours=1)
        end = start + timedelta(hours=2)
        
        data = {
            'site': self.site.id,
            'title': 'Unlimited Event',
            'start_time': start,
            'end_time': end,
            'capacity': -1,
            'assigned_to_owner': self.owner.id
        }
        serializer = EventSerializer(data=data)
        self.assertTrue(serializer.is_valid())


class AvailabilityBlockSerializerTests(TestCase):
    """
    Testy serializera AvailabilityBlockSerializer (bloki dostępności).
    
    Bloki dostępności definiują okna czasowe, w których klienci mogą
    rezerwować spotkania. Zawierają parametry takie jak długość spotkania,
    interwał czasowy (co ile minut można zacząć) i bufor między spotkaniami.
    """

    def setUp(self):
        """Przygotowuje dane testowe."""
        self.owner = PlatformUser.objects.create_user(
            email="owner@example.com",
            password="pass123",
            first_name="Owner"
        )
        self.site = Site.objects.create(
            owner=self.owner,
            name="Test Site"
        )
        self.factory = RequestFactory()

    def test_availability_block_serialization(self):
        """
        Sprawdza serializację bloku dostępności.
        Weryfikuje czy wszystkie pola konfiguracyjne (meeting_length,
        time_snapping, buffer_time) są prawidłowo zwracane.
        """
        block = AvailabilityBlock.objects.create(
            site=self.site,
            creator=self.owner,
            title="Dostępny",
            date=date.today() + timedelta(days=1),
            start_time=time(9, 0),
            end_time=time(17, 0),
            meeting_length=60,      # 60-minutowe spotkania
            time_snapping=30,       # Możliwość rezerwacji co 30 min
            buffer_time=15,         # 15 min przerwy między spotkaniami
            assigned_to_owner=self.owner
        )
        
        serializer = AvailabilityBlockSerializer(block)
        data = serializer.data
        
        self.assertEqual(data['title'], "Dostępny")
        self.assertEqual(data['meeting_length'], 60)
        self.assertEqual(data['time_snapping'], 30)
        self.assertEqual(data['buffer_time'], 15)

    def test_assignment_label_owner(self):
        """
        Sprawdza etykietę przypisania dla właściciela.
        assignment_type='owner' i assignment_label zawiera imię właściciela.
        """
        block = AvailabilityBlock.objects.create(
            site=self.site,
            creator=self.owner,
            date=date.today() + timedelta(days=1),
            start_time=time(9, 0),
            end_time=time(17, 0),
            assigned_to_owner=self.owner
        )
        
        serializer = AvailabilityBlockSerializer(block)
        data = serializer.data
        
        self.assertEqual(data['assignment_type'], 'owner')
        self.assertIn('Owner', data['assignment_label'])


class TestimonialSerializerTests(TestCase):
    """
    Testy serializera TestimonialSerializer (opinie klientów).
    
    Opinie są zbierane od klientów stron i mogą być wyświetlane publicznie.
    Zawierają ocenę (1-5 gwiazdek), treść i dane autora.
    """

    def setUp(self):
        """Przygotowuje dane testowe."""
        self.owner = PlatformUser.objects.create_user(
            email="owner@example.com",
            password="pass123",
            first_name="Owner"
        )
        self.site = Site.objects.create(
            owner=self.owner,
            name="Test Site"
        )

    def test_testimonial_serialization(self):
        """
        Sprawdza serializację opinii klienta.
        Weryfikuje czy dane autora, ocena i treść są prawidłowo zwracane.
        is_approved=True oznacza, że opinia jest zatwierdzona do publikacji.
        """
        testimonial = Testimonial.objects.create(
            site=self.site,
            author_name="Happy Client",
            author_email="client@example.com",
            rating=5,
            content="Great service!"
        )
        
        serializer = TestimonialSerializer(testimonial)
        data = serializer.data
        
        self.assertEqual(data['author_name'], "Happy Client")
        self.assertEqual(data['rating'], 5)
        self.assertTrue(data['is_approved'])


# =============================================================================
# TESTY ENDPOINTÓW API (WIDOKI)
# =============================================================================

class SiteAPITests(APITestCase):
    """
    Testy endpointów API dla stron użytkowników (/api/v1/sites/).
    
    Testują operacje CRUD na stronach oraz autoryzację dostępu.
    Użytkownicy mogą widzieć tylko własne strony i strony zespołów,
    do których należą.
    """

    def setUp(self):
        """Przygotowuje dwóch użytkowników do testów izolacji danych."""
        self.user = PlatformUser.objects.create_user(
            email="user@example.com",
            password="pass123",
            first_name="User",
            is_active=True
        )
        self.other_user = PlatformUser.objects.create_user(
            email="other@example.com",
            password="pass123",
            first_name="Other",
            is_active=True
        )
        self.client = APIClient()

    def test_list_sites_unauthenticated(self):
        """
        Sprawdza czy nieuwierzytelnieni użytkownicy nie mogą listować stron.
        Endpoint wymaga tokenu JWT - brak tokenu = 401 Unauthorized.
        """
        response = self.client.get('/api/v1/sites/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_own_sites(self):
        """
        Sprawdza czy uwierzytelniony użytkownik może listować swoje strony.
        Odpowiedź zawiera klucze 'owned_sites' (własne) i 'team_member_sites' (zespołowe).
        """
        self.client.force_authenticate(user=self.user)
        
        # Tworzymy stronę dla użytkownika
        Site.objects.create(owner=self.user, name="My Site")
        
        response = self.client.get('/api/v1/sites/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('owned_sites', response.data)
        self.assertEqual(len(response.data['owned_sites']), 1)

    def test_cannot_access_other_users_sites(self):
        """
        Sprawdza izolację danych: użytkownik nie może widzieć cudzych stron.
        Próba dostępu do strony innego użytkownika zwraca 404 Not Found
        (a nie 403 Forbidden - ze względów bezpieczeństwa nie ujawniamy istnienia zasobu).
        """
        other_site = Site.objects.create(owner=self.other_user, name="Other's Site")
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/v1/sites/{other_site.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_site(self):
        """
        Sprawdza tworzenie nowej strony przez API.
        Po utworzeniu strona powinna mieć:
        - Podaną nazwę
        - Automatycznie przypisanego właściciela (z tokenu)
        - Wygenerowany identyfikator i subdomenę
        """
        self.client.force_authenticate(user=self.user)
        
        data = {
            'name': 'New Site',
            'template_config': {'theme': 'dark'}
        }
        response = self.client.post('/api/v1/sites/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Site')

    def test_site_auto_color_assignment(self):
        """
        Sprawdza automatyczne przydzielanie kolorów kolejnym stronom.
        System obsługuje 12 kolorów (indeksy 0-11).
        Pierwsza strona dostaje kolor 0, druga 1, itd.
        """
        self.client.force_authenticate(user=self.user)
        
        # Tworzymy pierwszą stronę
        response1 = self.client.post('/api/v1/sites/', {'name': 'Site 1'}, format='json')
        self.assertEqual(response1.data['color_index'], 0)
        
        # Tworzymy drugą stronę
        response2 = self.client.post('/api/v1/sites/', {'name': 'Site 2'}, format='json')
        self.assertEqual(response2.data['color_index'], 1)


class PublicSiteAPITests(APITestCase):
    """
    Testy publicznych endpointów stron (/api/v1/public/sites/).
    
    Publiczne endpointy nie wymagają autoryzacji i służą do wyświetlania
    opublikowanych stron użytkowników na ich subdomenach.
    """

    def setUp(self):
        """Przygotowuje opublikowaną stronę do testów."""
        self.user = PlatformUser.objects.create_user(
            email="user@example.com",
            password="pass123",
            first_name="User"
        )
        self.site = Site.objects.create(
            owner=self.user,
            name="Public Site",
            is_published=True,
            template_config={'pages': []}
        )
        self.site.refresh_from_db()  # Pobieramy wygenerowany identyfikator

    def test_public_site_access(self):
        """
        Sprawdza czy publiczne strony są dostępne bez uwierzytelnienia.
        Publiczny endpoint używa identyfikatora (slug) zamiast ID.
        """
        response = self.client.get(f'/api/v1/public-sites/{self.site.identifier}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Public Site')

    def test_unpublished_site_hides_config(self):
        """
        Sprawdza czy nieopublikowane strony ukrywają konfigurację.
        Dla bezpieczeństwa template_config jest usuwany z odpowiedzi
        gdy is_published=False (zapobiega wyciekowi danych roboczych).
        """
        self.site.is_published = False
        self.site.save()
        
        response = self.client.get(f'/api/v1/public-sites/{self.site.identifier}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn('template_config', response.data)


class AuthAPITests(APITestCase):
    """
    Testy endpointów uwierzytelniania (/api/v1/auth/).
    
    System obsługuje:
    - Logowanie przez email/hasło (JWT)
    - Logowanie przez Google OAuth
    - Magic linki (logowanie bez hasła)
    - Reset hasła
    """

    def setUp(self):
        """Przygotowuje aktywnego użytkownika do testów."""
        self.user = PlatformUser.objects.create_user(
            email="user@example.com",
            password="pass123",
            first_name="User",
            is_active=True
        )

    def test_magic_link_request(self):
        """
        Sprawdza wysyłanie prośby o magic link.
        Po wysłaniu żądania:
        - Zwracany jest status 200
        - W bazie tworzony jest nowy MagicLink
        - Email z linkiem jest wysyłany (async przez Celery)
        """
        response = self.client.post('/api/v1/auth/magic-link/request/', {
            'email': self.user.email
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Weryfikujemy czy magic link został utworzony
        self.assertTrue(MagicLink.objects.filter(email=self.user.email).exists())

    def test_magic_link_request_nonexistent_email(self):
        """
        Sprawdza obsługę nieistniejącego emaila (bezpieczeństwo).
        Endpoint zawsze zwraca 200 OK - nie ujawnia czy email istnieje w systemie.
        Jest to standardowa praktyka zapobiegająca enumeracji użytkowników.
        """
        response = self.client.post('/api/v1/auth/magic-link/request/', {
            'email': 'nonexistent@example.com'
        })
        # Zwracamy 200 aby nie ujawnić czy email istnieje
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_magic_link_verify_invalid_token(self):
        """
        Sprawdza weryfikację z nieprawidłowym tokenem.
        Nieprawidłowy token zwraca 404 Not Found.
        """
        response = self.client.post('/api/v1/auth/magic-link/verify/', {
            'token': 'invalid-token'
        })
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_magic_link_verify_valid_token(self):
        """
        Sprawdza weryfikację z prawidłowym tokenem.
        Po weryfikacji:
        - Zwracany jest status 200
        - Odpowiedź zawiera tokeny JWT (access i refresh)
        - Magic link jest oznaczany jako użyty
        """
        magic_link = MagicLink.create_for_email(
            email=self.user.email,
            expiry_minutes=15
        )
        
        response = self.client.post('/api/v1/auth/magic-link/verify/', {
            'token': magic_link.token
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)


class TeamMemberAPITests(APITestCase):
    """
    Testy endpointów członków zespołu (/api/v1/team-members/).
    
    Właściciel strony może dodawać członków zespołu, którzy będą
    mogli prowadzić sesje i zarządzać kalendarzem (w zależności od roli).
    """

    def setUp(self):
        """Przygotowuje właściciela i stronę do testów."""
        self.owner = PlatformUser.objects.create_user(
            email="owner@example.com",
            password="pass123",
            first_name="Owner",
            is_active=True
        )
        self.site = Site.objects.create(owner=self.owner, name="Test Site")
        self.client = APIClient()

    def test_create_team_member(self):
        """
        Sprawdza dodawanie nowego członka zespołu.
        Właściciel może dodać członka z określoną rolą i opisem stanowiska.
        """
        self.client.force_authenticate(user=self.owner)
        
        data = {
            'site': self.site.id,
            'name': 'Jan Kowalski',
            'email': 'jan@example.com',
            'role_description': 'Instructor',
            'permission_role': 'contributor'
        }
        response = self.client.post('/api/v1/team-members/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Jan Kowalski')

    def test_list_team_members(self):
        """
        Sprawdza listowanie członków zespołu dla konkretnej strony.
        Parametr ?site=<id> filtruje członków po stronie.
        """
        self.client.force_authenticate(user=self.owner)
        
        TeamMember.objects.create(
            site=self.site,
            name='Member 1'
        )
        TeamMember.objects.create(
            site=self.site,
            name='Member 2'
        )
        
        response = self.client.get(f'/api/v1/team-members/?site={self.site.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)


class BigEventAPITests(APITestCase):
    """
    Testy endpointów dużych wydarzeń (/api/v1/big-events/).
    
    Duże wydarzenia to wyjazdy, warsztaty, retreaty - specjalne wydarzenia
    z datą rozpoczęcia/zakończenia, lokalizacją, ceną i możliwością
    wysyłania powiadomień do subskrybentów newslettera.
    """

    def setUp(self):
        """Przygotowuje właściciela i stronę do testów."""
        self.owner = PlatformUser.objects.create_user(
            email="owner@example.com",
            password="pass123",
            first_name="Owner",
            is_active=True
        )
        self.site = Site.objects.create(owner=self.owner, name="Test Site")
        self.client = APIClient()

    def test_create_big_event(self):
        """
        Sprawdza tworzenie dużego wydarzenia.
        Nowe wydarzenie powinno mieć status 'draft' (szkic) do momentu publikacji.
        """
        self.client.force_authenticate(user=self.owner)
        
        data = {
            'site': self.site.id,
            'title': 'Yoga Retreat',
            'description': 'A week-long yoga retreat',
            'location': 'Bali, Indonesia',
            'start_date': (date.today() + timedelta(days=30)).isoformat(),
            'end_date': (date.today() + timedelta(days=37)).isoformat(),
            'max_participants': 20,
            'price': '1500.00'
        }
        response = self.client.post('/api/v1/big-events/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Yoga Retreat')
        self.assertEqual(response.data['status'], 'draft')

    def test_big_event_status_transitions(self):
        """
        Sprawdza zmiany statusu dużego wydarzenia.
        Cykl życia: draft -> published -> completed lub cancelled.
        """
        self.client.force_authenticate(user=self.owner)
        
        big_event = BigEvent.objects.create(
            site=self.site,
            creator=self.owner,
            title='Workshop',
            start_date=date.today() + timedelta(days=30),
            max_participants=10,
            status=BigEvent.Status.DRAFT
        )
        
        # Publikujemy wydarzenie
        response = self.client.patch(f'/api/v1/big-events/{big_event.id}/', {
            'status': 'published'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'published')


# =============================================================================
# TESTY UPRAWNIEŃ I KONTROLI DOSTĘPU (RBAC)
# =============================================================================

class RoleBasedPermissionTests(APITestCase):
    """
    Testy kontroli dostępu opartej na rolach (Role-Based Access Control).
    
    System uprawnień definiuje trzy role dla członków zespołu:
    - VIEWER (obserwator): tylko podgląd kalendarza i wydarzeń
    - CONTRIBUTOR (współpracownik): może tworzyć i edytować własne wydarzenia
    - MANAGER (menedżer): pełne zarządzanie kalendarzem zespołu
    
    Właściciel strony (owner) ma zawsze pełne uprawnienia.
    """

    def setUp(self):
        """
        Przygotowuje scenariusz testowy:
        - Właściciel strony (owner)
        - Contributor połączony ze stroną
        - Viewer połączony ze stroną
        """
        self.owner = PlatformUser.objects.create_user(
            email="owner@example.com",
            password="pass123",
            first_name="Owner",
            is_active=True
        )
        self.contributor = PlatformUser.objects.create_user(
            email="contributor@example.com",
            password="pass123",
            first_name="Contributor",
            is_active=True
        )
        self.viewer = PlatformUser.objects.create_user(
            email="viewer@example.com",
            password="pass123",
            first_name="Viewer",
            is_active=True
        )
        
        self.site = Site.objects.create(owner=self.owner, name="Test Site")
        
        # Tworzymy członków zespołu z odpowiednimi rolami
        self.contributor_member = TeamMember.objects.create(
            site=self.site,
            name="Contributor",
            email=self.contributor.email,
            linked_user=self.contributor,  # Połączony z kontem użytkownika
            invitation_status=TeamMember.InvitationStatus.LINKED,
            permission_role=TeamMember.PermissionRole.CONTRIBUTOR
        )
        
        self.viewer_member = TeamMember.objects.create(
            site=self.site,
            name="Viewer",
            email=self.viewer.email,
            linked_user=self.viewer,  # Połączony z kontem użytkownika
            invitation_status=TeamMember.InvitationStatus.LINKED,
            permission_role=TeamMember.PermissionRole.VIEWER
        )
        
        self.client = APIClient()

    def test_owner_can_access_site(self):
        """
        Sprawdza czy właściciel może uzyskać dostęp do swojej strony.
        Owner ma zawsze pełny dostęp do wszystkich funkcji strony.
        """
        self.client.force_authenticate(user=self.owner)
        response = self.client.get(f'/api/v1/sites/{self.site.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_contributor_can_access_site(self):
        """
        Sprawdza czy contributor może uzyskać dostęp do strony.
        Contributor widzi stronę dzięki powiązaniu TeamMember -> linked_user.
        """
        self.client.force_authenticate(user=self.contributor)
        response = self.client.get(f'/api/v1/sites/{self.site.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_viewer_can_access_site(self):
        """
        Sprawdza czy viewer może uzyskać dostęp do strony.
        Viewer ma ograniczone uprawnienia, ale może przeglądać stronę.
        """
        self.client.force_authenticate(user=self.viewer)
        response = self.client.get(f'/api/v1/sites/{self.site.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_owner_can_update_site(self):
        """
        Sprawdza czy właściciel może aktualizować konfigurację strony.
        Tylko owner i manager mogą modyfikować ustawienia strony.
        """
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(f'/api/v1/sites/{self.site.id}/', {
            'name': 'Updated Site Name'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_contributor_cannot_update_site_config(self):
        """
        Sprawdza czy contributor NIE może aktualizować konfiguracji strony.
        Contributor może tylko tworzyć/edytować własne wydarzenia,
        nie ma uprawnień do modyfikacji ustawień strony (template_config).
        Oczekiwany wynik: 403 Forbidden.
        """
        self.client.force_authenticate(user=self.contributor)
        response = self.client.patch(f'/api/v1/sites/{self.site.id}/', {
            'name': 'Hacked Name'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# =============================================================================
# CUSTOM TEST RUNNER Z PODSUMOWANIEM
# =============================================================================

import unittest
from django.test.runner import DiscoverRunner


class VerboseTestResult(unittest.TextTestResult):
    """
    Rozszerzony wynik testów z kolorowym podsumowaniem.
    Zbiera statystyki i wyświetla ładne podsumowanie na końcu.
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.successes = []
    
    def addSuccess(self, test):
        super().addSuccess(test)
        self.successes.append(test)


class SummaryTestRunner(DiscoverRunner):
    """
    Custom Test Runner wyświetlający szczegółowe podsumowanie testów.
    
    Użycie:
        python manage.py test api.tests --testrunner=api.tests.SummaryTestRunner
    
    Lub ustaw w settings.py:
        TEST_RUNNER = 'api.tests.SummaryTestRunner'
    """
    
    def get_resultclass(self):
        return VerboseTestResult
    
    def run_suite(self, suite, **kwargs):
        """Uruchamia testy i wyświetla podsumowanie."""
        # Uruchom testy
        result = super().run_suite(suite, **kwargs)
        
        # Podsumowanie
        total = result.testsRun
        passed = len(result.successes) if hasattr(result, 'successes') else total - len(result.failures) - len(result.errors)
        failed = len(result.failures)
        errors = len(result.errors)
        skipped = len(result.skipped)
        
        print("\n" + "=" * 70)
        print("                    📊 PODSUMOWANIE TESTÓW")
        print("=" * 70)
        print(f"  ✅ Przeszło:    {passed}")
        print(f"  ❌ Nie przeszło: {failed}")
        print(f"  💥 Błędy:       {errors}")
        print(f"  ⏭️  Pominięto:   {skipped}")
        print("-" * 70)
        print(f"  📝 RAZEM:       {total}")
        print("=" * 70)
        
        if failed == 0 and errors == 0:
            print("  🎉 WSZYSTKIE TESTY PRZESZŁY POMYŚLNIE! 🎉")
        else:
            print("  ⚠️  NIEKTÓRE TESTY NIE PRZESZŁY!")
            if result.failures:
                print("\n  Nieprzechodzące testy:")
                for test, _ in result.failures:
                    print(f"    - {test}")
            if result.errors:
                print("\n  Testy z błędami:")
                for test, _ in result.errors:
                    print(f"    - {test}")
        
        print("=" * 70 + "\n")
        
        return result