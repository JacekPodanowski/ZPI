# api/views.py

import logging
import datetime
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.dateparse import parse_date
from rest_framework import viewsets, permissions, status, filters, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, MethodNotAllowed
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import django_filters
from django_filters.rest_framework import DjangoFilterBackend
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

from .models import User, TimeSlot, Meeting, Notification, DailyActivitySummary
from .serializers import (
    UserSerializer, TimeSlotSerializer, MeetingSerializer, NotificationSerializer, 
    DailyActivitySummarySerializer, CustomRegisterSerializer
)
from .utils import recalculate_daily_summary_for_date

logger = logging.getLogger(__name__)

def get_subject_from_html(html_content, default_subject="Powiadomienie"):
    """Pomocnicza funkcja do wyciągania tematu z tagu <title> w HTML."""
    try:
        title_start = html_content.lower().find('<title>') + len('<title>')
        title_end = html_content.lower().find('</title>')
        return html_content[title_start:title_end].strip()
    except Exception:
        return default_subject

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.FRONTEND_URL 
    client_class = OAuth2Client

class CustomRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = CustomRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        logger.info(f"Użytkownik '{user.email}' został pomyślnie utworzony. E-mail weryfikacyjny zostanie wysłany przez allauth.")
        refresh = RefreshToken.for_user(user)
        tokens = {'refresh': str(refresh), 'access': str(refresh.access_token)}
        return Response(tokens, status=status.HTTP_201_CREATED)

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_authenticated and request.user.is_staff:
            return True
        if isinstance(obj, User): return obj == request.user
        if hasattr(obj, 'student'): return obj.student == request.user
        if hasattr(obj, 'user'): return obj.user == request.user
        return False

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_permissions(self):
        if self.action == 'me': return [IsAuthenticated()]
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']: return [IsOwnerOrAdmin()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request, *args, **kwargs):
        return Response(self.get_serializer(request.user).data)

class TimeSlotFilter(django_filters.FilterSet):
    date = django_filters.DateFilter(field_name='start_time', lookup_expr='date')
    class Meta:
        model = TimeSlot
        fields = ['tutor', 'is_available']

class TimeSlotViewSet(viewsets.ModelViewSet):
    serializer_class = TimeSlotSerializer
    queryset = TimeSlot.objects.select_related('tutor').all().order_by('start_time')
    filter_backends = [DjangoFilterBackend]
    filterset_class = TimeSlotFilter
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_create_slots', 'bulk_delete_slots']:
            return [permissions.IsAdminUser()]
        return [AllowAny()]
        
    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if not (user.is_authenticated and user.is_staff):
            qs = qs.filter(is_available=True, start_time__gte=timezone.now() + datetime.timedelta(minutes=20))
        return qs

    @action(detail=False, methods=['post'], url_path='bulk-create')
    @transaction.atomic
    def bulk_create_slots(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        admin_tutor = request.user
        slots_to_create = []
        dates_to_recalculate = set()
        for slot_data in serializer.validated_data:
            slot_data.pop('tutor', None)
            slots_to_create.append(TimeSlot(tutor=admin_tutor, **slot_data))
            dates_to_recalculate.add(slot_data['start_time'].date())
        if slots_to_create:
            created_slots = TimeSlot.objects.bulk_create(slots_to_create)
            logger.info(f"Masowo utworzono {len(created_slots)} slotów dla tutora {admin_tutor.email}.")
            for date_to_update in dates_to_recalculate:
                recalculate_daily_summary_for_date(admin_tutor.id, date_to_update)
            queryset = TimeSlot.objects.filter(id__in=[s.id for s in created_slots]).select_related('tutor')
            return Response(self.get_serializer(queryset, many=True).data, status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='bulk-delete')
    @transaction.atomic
    def bulk_delete_slots(self, request, *args, **kwargs):
        slot_ids = request.data.get('ids', [])
        if not isinstance(slot_ids, list): return Response({"error": "Oczekiwano listy ID slotów."}, status=status.HTTP_400_BAD_REQUEST)
        if not slot_ids: return Response(status=status.HTTP_204_NO_CONTENT)
        admin_tutor = request.user
        slots_to_delete = TimeSlot.objects.filter(id__in=slot_ids, tutor=admin_tutor)
        dates_to_recalculate = {slot.start_time.date() for slot in slots_to_delete.iterator()}
        deleted_count, _ = slots_to_delete.delete()
        logger.info(f"Masowo usunięto {deleted_count} slotów dla tutora {admin_tutor.email}.")
        if dates_to_recalculate:
            for date_to_update in dates_to_recalculate:
                recalculate_daily_summary_for_date(admin_tutor.id, date_to_update)
        return Response({"status": "success", "deleted_count": deleted_count}, status=status.HTTP_204_NO_CONTENT)

class MeetingFilter(django_filters.FilterSet):
    student = django_filters.NumberFilter(field_name='student_id')
    tutor = django_filters.NumberFilter(field_name='tutor_id')
    class Meta:
        model = Meeting
        fields = ['student', 'tutor', 'status']

class MeetingViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = MeetingFilter
    ordering = ['-time_slot__start_time']
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        qs = Meeting.objects.select_related('student', 'tutor', 'time_slot').all()
        if not user.is_staff: qs = qs.filter(student=user)
        return qs
        
    @action(detail=False, methods=['post'], url_path='create-session')
    @transaction.atomic
    def create_session(self, request, *args, **kwargs):
        slot_ids = request.data.get('time_slot_ids', [])
        subject = request.data.get('subject', 'Korepetycje')
        platform = request.data.get('platform', 'discord')
        notes = request.data.get('notes', '')

        logger.info(f"Otrzymano żądanie utworzenia sesji dla slotów: {slot_ids} przez użytkownika {request.user.email}")

        if not slot_ids:
            logger.warning("Próba utworzenia sesji bez podania ID slotów.")
            return Response({"detail": "Nie wybrano żadnych terminów do rezerwacji."}, status=status.HTTP_400_BAD_REQUEST)
        
        # --- POCZĄTEK KLUCZOWEJ POPRAWKI ---
        # KROK 1: Pobieramy i blokujemy TYLKO obiekty TimeSlot, bez dołączania (JOIN) tutora.
        # To zapytanie jest proste i baza danych pozwoli na założenie blokady.
        slots_to_book = TimeSlot.objects.select_for_update().filter(id__in=slot_ids, is_available=True)
        
        # Sprawdzamy, czy udało się zablokować wszystkie wymagane sloty.
        if slots_to_book.count() != len(slot_ids):
            logger.warning(f"Nie znaleziono wszystkich dostępnych slotów dla ID: {slot_ids}.")
            raise ValidationError("Jeden lub więcej z wybranych terminów został w międzyczasie zajęty lub nie istnieje. Proszę odświeżyć stronę i spróbować ponownie.")
        
        # KROK 2: Teraz, gdy mamy już zablokowane sloty, pobieramy je ponownie,
        # tym razem z dołączonymi danymi tutora do dalszego przetwarzania.
        # To zapytanie już nie potrzebuje blokady, bo wiersze są już zablokowane.
        slots = TimeSlot.objects.select_related('tutor').filter(id__in=slot_ids).order_by('start_time')
        # --- KONIEC KLUCZOWEJ POPRAWKI ---

        first_slot = slots.first()
        tutor = first_slot.tutor
        session_date = first_slot.start_time.date()

        if not tutor:
            logger.error(f"Krytyczny błąd: Slot {first_slot.id} nie ma przypisanego tutora.")
            raise ValidationError("Błąd wewnętrzny serwera: brak przypisanego tutora do terminu.")

        today = timezone.now().date()
        if session_date <= today:
            logger.warning(f"Użytkownik {request.user.email} próbował zarezerwować termin na dzisiaj lub w przeszłości ({session_date}).")
            raise ValidationError("Można rezerwować terminy najwcześniej od jutra.")
        
        student = request.user
        meetings_to_create = [Meeting(student=student, tutor=tutor, time_slot=slot, subject=subject, platform=platform, notes=notes) for slot in slots]
        
        created_meetings = Meeting.objects.bulk_create(meetings_to_create)
        logger.info(f"Utworzono {len(created_meetings)} spotkań w bazie danych dla sesji.")

        # Aktualizujemy oryginalny, zablokowany queryset
        slots_to_book.update(is_available=False)
        
        recalculate_daily_summary_for_date(tutor.id, session_date)
        
        try:
            context = {
                'subject': subject, 'student_name': student.first_name,
                'date': first_slot.start_time.strftime('%d-%m-%Y'),
                'start_time': first_slot.start_time.strftime('%H:%M'),
                'end_time': slots.last().end_time.strftime('%H:%M'),
                'admin_url': settings.FRONTEND_URL,
                'notes': notes
            }
            
            html_student = render_to_string('emails/session_new_reservation.html', context)
            send_mail("Potwierdzenie rezerwacji sesji", '', settings.DEFAULT_FROM_EMAIL, [student.email], html_message=html_student)
            
            html_admin = render_to_string('emails/admin_session_new_reservation_notification.html', context)
            send_mail("Nowa rezerwacja sesji!", '', settings.DEFAULT_FROM_EMAIL, [settings.DEFAULT_FROM_EMAIL], html_message=html_admin)
            
            logger.info(f"Pomyślnie wysłano powiadomienia e-mail o nowej sesji dla {student.email}.")
        except Exception as e:
            logger.error(f"Błąd podczas wysyłania e-maili o nowej sesji dla {student.email}: {e}", exc_info=True)
            
        return Response(self.get_serializer(created_meetings, many=True).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='confirm-session')
    @transaction.atomic
    def confirm_session(self, request, *args, **kwargs):
        meeting_ids = request.data.get('meeting_ids', [])
        if not meeting_ids:
            return Response({"detail": "Nie podano ID spotkań."}, status=status.HTTP_400_BAD_REQUEST)
        
        meetings = Meeting.objects.filter(id__in=meeting_ids).select_related('student', 'time_slot').order_by('time_slot__start_time')
        if not meetings.exists():
            return Response({"detail": "Spotkania nie istnieją."}, status=status.HTTP_404_NOT_FOUND)
        
        meetings.update(status=Meeting.Status.CONFIRMED)
        
        first_meeting = meetings.first()
        try:
            if first_meeting.platform == Meeting.Platform.DISCORD: template_name = 'emails/session_confirmed_discord.html'
            elif first_meeting.platform == Meeting.Platform.GOOGLE_MEET: template_name = 'emails/session_confirmed_google_meet.html'
            else: return Response({"status": "Sesja potwierdzona, ale nie wysłano e-maila (nieznana platforma)."}, status=status.HTTP_200_OK)
            
            context = {
                'subject': first_meeting.subject, 'student_name': first_meeting.student.first_name,
                'date': first_meeting.time_slot.start_time.strftime('%d-%m-%Y'),
                'start_time': first_meeting.time_slot.start_time.strftime('%H:%M'),
                'end_time': meetings.last().time_slot.end_time.strftime('%H:%M'),
                'discord_url': settings.DISCORD_SERVER_URL
            }
            html_body = render_to_string(template_name, context)
            subject = get_subject_from_html(html_body, "Twoja sesja została potwierdzona!")
            send_mail(subject, '', settings.DEFAULT_FROM_EMAIL, [first_meeting.student.email], html_message=html_body)
            logger.info(f"Wysłano e-mail o potwierdzeniu sesji do {first_meeting.student.email}")
        except Exception as e:
            logger.error(f"Błąd podczas wysyłania e-maila o potwierdzeniu sesji: {e}", exc_info=True)

        return Response({"status": "Sesja potwierdzona"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='cancel-session')
    @transaction.atomic
    def cancel_session(self, request, *args, **kwargs):
        meeting_ids = request.data.get('meeting_ids', [])
        if not meeting_ids:
            return Response({"detail": "Nie podano ID spotkań."}, status=status.HTTP_400_BAD_REQUEST)
        
        meetings = Meeting.objects.filter(id__in=meeting_ids).select_related('student', 'tutor', 'time_slot').order_by('time_slot__start_time')
        if not meetings.exists():
            return Response({"detail": "Spotkania nie istnieją."}, status=status.HTTP_404_NOT_FOUND)

        user_canceling = request.user
        first_meeting = meetings.first()
        student = first_meeting.student
        
        context = {
            'subject': first_meeting.subject, 'student_name': student.first_name,
            'date': first_meeting.time_slot.start_time.strftime('%d-%m-%Y'),
            'start_time': first_meeting.time_slot.start_time.strftime('%H:%M'),
            'end_time': meetings.last().time_slot.end_time.strftime('%H:%M'),
            'calendar_url': settings.FRONTEND_URL + "/calendar",
            'admin_url': settings.FRONTEND_URL
        }

        if user_canceling.is_staff:
            try:
                html_body = render_to_string('emails/session_canceled_by_admin.html', context)
                subject = get_subject_from_html(html_body, f"Odwołanie sesji: {first_meeting.subject}")
                send_mail(subject, '', settings.DEFAULT_FROM_EMAIL, [student.email], html_message=html_body)
                logger.info(f"Admin odwołał sesję. Wysłano e-mail do studenta {student.email}.")
            except Exception as e:
                logger.error(f"Błąd podczas wysyłania e-maila o odwołaniu sesji: {e}", exc_info=True)
        else:
            try:
                html_student = render_to_string('emails/session_canceled_by_student_confirmation.html', context)
                send_mail("Potwierdzenie anulowania sesji", '', settings.DEFAULT_FROM_EMAIL, [student.email], html_message=html_student)
                html_admin = render_to_string('emails/admin_session_cancellation_notification.html', context)
                send_mail("Student anulował sesję", '', settings.DEFAULT_FROM_EMAIL, [settings.DEFAULT_FROM_EMAIL], html_message=html_admin)
                logger.info(f"Student {student.email} anulował sesję. Wysłano powiadomienia.")
            except Exception as e:
                logger.error(f"Błąd podczas wysyłania e-maili o anulowaniu sesji przez studenta: {e}", exc_info=True)

        time_slot_ids = list(meetings.values_list('time_slot_id', flat=True))
        TimeSlot.objects.filter(id__in=time_slot_ids).update(is_available=True)
        deleted_count, _ = meetings.delete()
        
        recalculate_daily_summary_for_date(first_meeting.tutor.id, first_meeting.time_slot.start_time.date())
        logger.info(f"Anulowano i usunięto sesję składającą się z {deleted_count} spotkań.")
        
        return Response(status=status.HTTP_204_NO_CONTENT)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).select_related('meeting', 'user')

class DailyActivitySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DailyActivitySummarySerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = {'date': ['exact', 'gte', 'lte']}
    def get_queryset(self):
        admin_tutor = User.objects.filter(user_type=User.UserType.ADMIN, is_staff=True).first()
        if not admin_tutor: return DailyActivitySummary.objects.none()
        return DailyActivitySummary.objects.filter(tutor=admin_tutor).order_by('date')
    @action(detail=False, methods=['post'], url_path='recalculate')
    def recalculate_summary(self, request, *args, **kwargs):
        date_str = request.data.get('date')
        if not date_str: return Response({"error": "Pole 'date' jest wymagane."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            date_obj = parse_date(date_str)
            if not date_obj: raise ValueError
        except ValueError: return Response({"error": "Nieprawidłowy format daty. Oczekiwano YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        admin_tutor = User.objects.filter(user_type=User.UserType.ADMIN, is_staff=True).first()
        if not admin_tutor: return Response({"error": "Nie znaleziono tutora-admina."}, status=status.HTTP_404_NOT_FOUND)
        recalculate_daily_summary_for_date(admin_tutor.id, date_obj)
        logger.info(f"Ręcznie przeliczono podsumowanie dla tutora {admin_tutor.id} na dzień {date_obj}.")
        return Response({"status": "success", "message": f"Podsumowanie dla {date_obj} zostało przeliczone."}, status=status.HTTP_200_OK)