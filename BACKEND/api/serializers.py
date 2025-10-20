"""Serializers for the multi-tenant Personal Site Generator backend."""

import logging
from django.utils.text import slugify
from rest_framework import serializers

from .models import PlatformUser, Site, Client, Event, Booking, Template

logger = logging.getLogger(__name__)


class CustomRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = PlatformUser
        fields = ['first_name', 'last_name', 'email', 'password', 'password2', 'account_type', 'source_tag']
        extra_kwargs = {
            'password': {'write_only': True},
            'account_type': {'required': False},
            'source_tag': {'required': False},
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'detail': 'Passwords must match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2', None)
        email = validated_data['email']
        base_username = slugify(email.split('@')[0])
        username = base_username
        counter = 1
        existing_usernames = set(
            PlatformUser.objects.filter(username__startswith=base_username).values_list('username', flat=True)
        )
        while username in existing_usernames:
            username = f"{base_username}{counter}"
            counter += 1

        logger.info("Creating platform user %s with generated username %s", email, username)
        return PlatformUser.objects.create_user(username=username, **validated_data)


class PlatformUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'account_type', 'source_tag', 'is_staff', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_staff', 'is_active']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        return user


class SiteSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Site
        fields = [
            'id', 'owner', 'name', 'identifier', 'color_index',
            'template_config', 'version_history',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['identifier', 'created_at', 'updated_at', 'owner']


class PublicSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ['id', 'identifier', 'name', 'template_config', 'updated_at']
        read_only_fields = ['id', 'identifier', 'name', 'template_config', 'updated_at']


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'site', 'email', 'name', 'google_id', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        site = attrs.get('site') or (self.instance.site if self.instance else None)
        if site is None:
            raise serializers.ValidationError({'site': 'Site reference is required.'})
        google_id = attrs.get('google_id')
        if google_id and Client.objects.filter(site=site, google_id=google_id).exclude(
            pk=self.instance.pk if self.instance else None
        ).exists():
            raise serializers.ValidationError({'google_id': 'This Google account is already linked to the site.'})
        return attrs


class EventSerializer(serializers.ModelSerializer):
    attendees = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'site', 'admin', 'title', 'description',
            'start_time', 'end_time', 'capacity', 'event_type',
            'attendees', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'attendees']

    def validate(self, attrs):
        site = attrs.get('site') or (self.instance.site if self.instance else None)
        admin = attrs.get('admin') or (self.instance.admin if self.instance else None)
        if site and admin and not (admin.is_staff or admin.sites.filter(pk=site.pk).exists()):
            raise serializers.ValidationError({'admin': 'Admin must own or have access to the site.'})
        return attrs


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'id', 'site', 'event', 'client', 'guest_email', 'guest_name',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, attrs):
        site = attrs.get('site') or (self.instance.site if self.instance else None)
        event = attrs.get('event') or (self.instance.event if self.instance else None)
        client = attrs.get('client') or (self.instance.client if self.instance else None)

        if event and site and event.site_id != site.id:
            raise serializers.ValidationError({'event': 'Event must belong to the provided site.'})

        if client and site and client.site_id != site.id:
            raise serializers.ValidationError({'client': 'Client must belong to the provided site.'})

        if not client and not (attrs.get('guest_email') or (self.instance.guest_email if self.instance else None)):
            raise serializers.ValidationError({'guest_email': 'Provide a client or guest contact details.'})

        return attrs


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = ['id', 'name', 'description', 'template_config', 'thumbnail_url']