# api/tests.py

import datetime
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import DailyActivitySummary, Meeting, Notification, TimeSlot
from .utils import recalculate_daily_summary_for_date

User = get_user_model()


class BaseAPITestCase(APITestCase):
    """
    A base test case class that sets up common initial data,
    such as users with different roles.
    """

    def setUp(self):
        """Set up initial users for all API tests."""
        self.admin_user = User.objects.create_superuser(
            email="admin@test.com",
            password="adminpassword123",
            first_name="Admin",
            last_name="User",
            username="adminuser",
        )
        self.student_user = User.objects.create_user(
            email="student@test.com",
            password="studentpassword123",
            first_name="Student",
            last_name="User",
            username="studentuser",
        )
        self.student_user_2 = User.objects.create_user(
            email="student2@test.com",
            password="studentpassword123",
            first_name="StudentTwo",
            last_name="User",
            username="studentuser2",
        )

        # Authenticate the admin client by default
        self.client.force_authenticate(user=self.admin_user)


# -------------------------------------
# --- MODEL, UTILITY, AND SIGNAL TESTS
# -------------------------------------

class ModelAndUtilTests(BaseAPITestCase):
    def test_create_superuser(self):
        """Ensure superuser is created with admin role and staff status."""
        self.assertEqual(self.admin_user.user_type, User.UserType.ADMIN)
        self.assertTrue(self.admin_user.is_staff)
        self.assertTrue(self.admin_user.is_superuser)

    def test_create_student_user(self):
        """Ensure regular user is created with student role."""
        self.assertEqual(self.student_user.user_type, User.UserType.STUDENT)
        self.assertFalse(self.student_user.is_staff)

    def test_timeslot_constraint(self):
        """Test that end_time must be after start_time for a TimeSlot."""
        now = timezone.now()
        with self.assertRaises(IntegrityError):
            TimeSlot.objects.create(tutor=self.admin_user, start_time=now, end_time=now)

    def test_recalculate_daily_summary(self):
        """Directly test the daily summary calculation utility."""
        tomorrow = timezone.now().date() + datetime.timedelta(days=1)
        start_time_1 = timezone.make_aware(datetime.datetime.combine(tomorrow, datetime.time(10, 0)))
        end_time_1 = start_time_1 + datetime.timedelta(minutes=30)
        start_time_2 = end_time_1
        end_time_2 = start_time_2 + datetime.timedelta(minutes=30)

        TimeSlot.objects.create(tutor=self.admin_user, start_time=start_time_1, end_time=end_time_1)
        TimeSlot.objects.create(tutor=self.admin_user, start_time=start_time_2, end_time=end_time_2)

        recalculate_daily_summary_for_date(self.admin_user.id, tomorrow)
        summary = DailyActivitySummary.objects.get(tutor=self.admin_user, date=tomorrow)
        self.assertTrue(summary.has_available_slots)
        self.assertFalse(summary.has_booked_slots)

        slot1 = TimeSlot.objects.get(start_time=start_time_1)
        Meeting.objects.create(student=self.student_user, tutor=self.admin_user, time_slot=slot1, subject="Test Meeting")
        slot1.is_available = False
        slot1.save()

        recalculate_daily_summary_for_date(self.admin_user.id, tomorrow)
        summary.refresh_from_db()
        self.assertFalse(summary.has_available_slots)
        self.assertTrue(summary.has_booked_slots)

    @patch("api.signals.recalculate_daily_summary_for_date")
    def test_meeting_creation_triggers_signal(self, mock_recalculate):
        """Ensure creating a Meeting triggers the recalculation signal."""
        slot = TimeSlot.objects.create(
            tutor=self.admin_user,
            start_time=timezone.now() + datetime.timedelta(days=2),
            end_time=timezone.now() + datetime.timedelta(days=2, minutes=30),
        )
        Meeting.objects.create(student=self.student_user, tutor=self.admin_user, time_slot=slot, subject="Signal Test")
        mock_recalculate.assert_called_once_with(self.admin_user.id, slot.start_time.date())


# -------------------------------------
# --- AUTHENTICATION API TESTS
# -------------------------------------

class AuthAPITests(APITestCase):
    def test_successful_registration(self):
        url = "/api/v1/auth/register/"
        data = {"first_name": "New", "email": "newuser@test.com", "password": "newpassword123", "password2": "newpassword123"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="newuser@test.com").exists())
        self.assertIn("access", response.data)

    def test_registration_password_mismatch(self):
        url = "/api/v1/auth/register/"
        data = {"first_name": "New", "email": "newuser@test.com", "password": "newpassword123", "password2": "differentpassword"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_duplicate_email(self):
        User.objects.create_user(email="exists@test.com", password="p", first_name="E")
        url = "/api/v1/auth/register/"
        data = {"first_name": "New", "email": "exists@test.com", "password": "newpassword123", "password2": "newpassword123"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_login(self):
        User.objects.create_user(email="login@test.com", password="password123", first_name="Login")
        url = "/api/v1/token/"
        data = {"email": "login@test.com", "password": "password123"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


# -------------------------------------
# --- USER API VIEWSET TESTS
# -------------------------------------

class UserAPITests(BaseAPITestCase):
    def test_admin_can_list_users(self):
        response = self.client.get("/api/v1/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)

    def test_student_cannot_list_users(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get("/api/v1/users/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_can_get_self_details_with_me_endpoint(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get("/api/v1/users/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], self.student_user.email)

    def test_user_can_update_self(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.patch(f"/api/v1/users/{self.student_user.id}/", {"last_name": "Updated"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student_user.refresh_from_db()
        self.assertEqual(self.student_user.last_name, "Updated")

    def test_user_cannot_update_others(self):
        self.client.force_authenticate(user=self.student_user)
        response = self.client.patch(f"/api/v1/users/{self.admin_user.id}/", {"last_name": "Hacked"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# -------------------------------------
# --- TIMESLOT API VIEWSET TESTS
# -------------------------------------

class TimeSlotAPITests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.url = "/api/v1/timeslots/"
        self.tomorrow = timezone.now() + datetime.timedelta(days=1)
        self.slot1 = TimeSlot.objects.create(
            tutor=self.admin_user,
            start_time=self.tomorrow.replace(hour=10, minute=0, second=0),
            end_time=self.tomorrow.replace(hour=10, minute=30, second=0),
        )

    def test_admin_can_create_slot(self):
        data = {"start_time": self.tomorrow.replace(hour=11, minute=0), "end_time": self.tomorrow.replace(hour=11, minute=30)}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TimeSlot.objects.count(), 2)

    def test_student_cannot_create_slot(self):
        self.client.force_authenticate(user=self.student_user)
        data = {"start_time": self.tomorrow.replace(hour=12, minute=0), "end_time": self.tomorrow.replace(hour=12, minute=30)}
        response = self.client.post(self.url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_can_list_available_slots(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_admin_can_update_slot(self):
        response = self.client.patch(f"{self.url}{self.slot1.id}/", {"is_available": False}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.slot1.refresh_from_db()
        self.assertFalse(self.slot1.is_available)

    def test_admin_can_delete_slot(self):
        response = self.client.delete(f"{self.url}{self.slot1.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TimeSlot.objects.count(), 0)

    def test_bulk_create_and_delete_slots(self):
        create_url = "/api/v1/timeslots/bulk-create/"
        data = [
            {"start_time": self.tomorrow.replace(hour=14, minute=0), "end_time": self.tomorrow.replace(hour=14, minute=30)},
            {"start_time": self.tomorrow.replace(hour=14, minute=30), "end_time": self.tomorrow.replace(hour=15, minute=0)},
        ]
        response = self.client.post(create_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TimeSlot.objects.count(), 3)
        
        delete_url = "/api/v1/timeslots/bulk-delete/"
        slot_ids_to_delete = [s['id'] for s in response.data]
        response = self.client.post(delete_url, {"ids": slot_ids_to_delete}, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TimeSlot.objects.count(), 1)


# -------------------------------------
# --- MEETING API VIEWSET TESTS
# -------------------------------------

@patch("api.views.send_mail")
class MeetingAPITests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.day_after_tomorrow = timezone.now().date() + datetime.timedelta(days=2)
        self.slot1 = TimeSlot.objects.create(
            tutor=self.admin_user,
            start_time=timezone.make_aware(datetime.datetime.combine(self.day_after_tomorrow, datetime.time(10, 0))),
            end_time=timezone.make_aware(datetime.datetime.combine(self.day_after_tomorrow, datetime.time(10, 30))),
        )
        self.slot2 = TimeSlot.objects.create(
            tutor=self.admin_user,
            start_time=timezone.make_aware(datetime.datetime.combine(self.day_after_tomorrow, datetime.time(10, 30))),
            end_time=timezone.make_aware(datetime.datetime.combine(self.day_after_tomorrow, datetime.time(11, 0))),
        )

    def test_student_can_create_session(self, mock_send_mail):
        self.client.force_authenticate(user=self.student_user)
        url = "/api/v1/meetings/create-session/"
        data = {"time_slot_ids": [self.slot1.id, self.slot2.id], "subject": "Python Basics"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Meeting.objects.count(), 2)
        self.slot1.refresh_from_db()
        self.assertFalse(self.slot1.is_available)
        self.assertEqual(mock_send_mail.call_count, 2)

    def test_create_session_for_today_fails(self, mock_send_mail):
        today_slot = TimeSlot.objects.create(tutor=self.admin_user, start_time=timezone.now() + datetime.timedelta(hours=2), end_time=timezone.now() + datetime.timedelta(hours=3))
        self.client.force_authenticate(user=self.student_user)
        url = "/api/v1/meetings/create-session/"
        data = {"time_slot_ids": [today_slot.id]}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_session_with_invalid_slot_id_fails(self, mock_send_mail):
        self.client.force_authenticate(user=self.student_user)
        url = "/api/v1/meetings/create-session/"
        data = {"time_slot_ids": [99999]} # Non-existent ID
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_can_list_own_meetings(self, mock_send_mail):
        Meeting.objects.create(student=self.student_user, tutor=self.admin_user, time_slot=self.slot1, subject="My Meeting")
        Meeting.objects.create(student=self.student_user_2, tutor=self.admin_user, time_slot=self.slot2, subject="Other's Meeting")
        self.client.force_authenticate(user=self.student_user)
        response = self.client.get("/api/v1/meetings/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['subject'], "My Meeting")

    def test_admin_can_confirm_session(self, mock_send_mail):
        meeting = Meeting.objects.create(student=self.student_user, tutor=self.admin_user, time_slot=self.slot1, subject="Pending")
        response = self.client.post("/api/v1/meetings/confirm-session/", {"meeting_ids": [meeting.id]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        meeting.refresh_from_db()
        self.assertEqual(meeting.status, Meeting.Status.CONFIRMED)
        mock_send_mail.assert_called_once()

    def test_student_can_cancel_session(self, mock_send_mail):
        meeting = Meeting.objects.create(student=self.student_user, tutor=self.admin_user, time_slot=self.slot1, subject="Cancel me")
        self.slot1.is_available = False; self.slot1.save()
        self.client.force_authenticate(user=self.student_user)
        response = self.client.post("/api/v1/meetings/cancel-session/", {"meeting_ids": [meeting.id]}, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Meeting.objects.filter(id=meeting.id).exists())
        self.slot1.refresh_from_db()
        self.assertTrue(self.slot1.is_available)

    def test_student_cannot_cancel_another_students_session(self, mock_send_mail):
        meeting_of_student2 = Meeting.objects.create(student=self.student_user_2, tutor=self.admin_user, time_slot=self.slot1, subject="Student 2's meeting")
        self.client.force_authenticate(user=self.student_user) # Authenticate as student 1
        response = self.client.post("/api/v1/meetings/cancel-session/", {"meeting_ids": [meeting_of_student2.id]}, format="json")
        # Since the query in the view filters for the user, it will act like the meeting doesn't exist
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Meeting.objects.filter(id=meeting_of_student2.id).exists())


# -------------------------------------
# --- OTHER VIEWSET TESTS
# -------------------------------------
class SummaryAndNotificationAPITests(BaseAPITestCase):
    def test_list_daily_summaries(self):
        tomorrow = timezone.now().date() + datetime.timedelta(days=1)
        TimeSlot.objects.create(tutor=self.admin_user, start_time=timezone.now(), end_time=timezone.now() + datetime.timedelta(minutes=30))
        recalculate_daily_summary_for_date(self.admin_user.id, tomorrow)

        self.client.logout()
        response = self.client.get(f"/api/v1/daily-summaries/?date={tomorrow}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_user_can_list_own_notifications(self):
        Notification.objects.create(user=self.student_user, title="Your Notification", message="Hi")
        Notification.objects.create(user=self.admin_user, title="Admin Notification", message="Hi")

        self.client.force_authenticate(user=self.student_user)
        response = self.client.get("/api/v1/notifications/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], "Your Notification")