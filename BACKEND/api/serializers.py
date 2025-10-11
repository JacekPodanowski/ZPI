# api/serializers.py

import logging
from django.db import transaction
from django.utils.text import slugify
from rest_framework import serializers

from .models import User, TimeSlot, Meeting, Notification, DailyActivitySummary

logger = logging.getLogger(__name__)

class CustomRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)
    
    class Meta:
        model = User
        fields = ['first_name', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"detail": "Hasła muszą być identyczne."})
        return data

    def create(self, validated_data):
        email = validated_data['email']
        first_name = validated_data['first_name']
        password = validated_data['password']
        
        base_username = slugify(email.split('@')[0])
        username = base_username
        counter = 1
        existing_usernames = set(User.objects.filter(username__startswith=base_username).values_list('username', flat=True))
        
        while username in existing_usernames:
            username = f"{base_username}{counter}"
            counter += 1
        
        logger.info(f"Tworzenie użytkownika {email} z wygenerowaną nazwą: {username}")
        user = User.objects.create_user(
            email=email,
            username=username,
            first_name=first_name,
            password=password
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'user_type', 'is_staff', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}}
        }

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            instance.set_password(validated_data.pop('password'))
        return super().update(instance, validated_data)

class TimeSlotSerializer(serializers.ModelSerializer):
    tutor_email = serializers.EmailField(source='tutor.email', read_only=True, allow_null=True)
    tutor_username = serializers.CharField(source='tutor.username', read_only=True, allow_null=True)
    
    class Meta:
        model = TimeSlot
        fields = ['id', 'tutor', 'tutor_email', 'tutor_username', 'start_time', 'end_time', 'is_available', 'created_at']
        read_only_fields = ['created_at', 'tutor_email', 'tutor_username']

class MeetingSerializer(serializers.ModelSerializer):
    student_details = UserSerializer(source='student', read_only=True)
    tutor_details = UserSerializer(source='tutor', read_only=True)
    time_slot_details = TimeSlotSerializer(source='time_slot', read_only=True)
    
    class Meta:
        model = Meeting
        fields = [
            'id', 'student', 'student_details', 'tutor', 'tutor_details',
            'time_slot', 'time_slot_details', 'subject', 'notes', 'status', 
            'platform', 'created_at'
        ]
        read_only_fields = [
            'created_at', 'student_details', 'tutor_details', 'time_slot_details'
        ]

class NotificationSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_email', 'meeting', 'title', 'message', 
            'type', 'is_read', 'created_at'
        ]
        read_only_fields = ['created_at', 'user_email']

class DailyActivitySummarySerializer(serializers.ModelSerializer):
    tutor_email = serializers.ReadOnlyField(source='tutor.email', allow_null=True)
    
    class Meta:
        model = DailyActivitySummary
        fields = [
            'id', 'tutor', 'tutor_email', 'date', 'has_available_slots', 
            'has_booked_slots', 'last_updated'
        ]