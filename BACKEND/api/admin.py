from django.contrib import admin

from .models import PlatformUser, Site, Client, Event, Booking


@admin.register(PlatformUser)
class PlatformUserAdmin(admin.ModelAdmin):
	list_display = ('email', 'first_name', 'account_type', 'source_tag', 'is_staff', 'created_at')
	search_fields = ('email', 'first_name', 'last_name')
	list_filter = ('account_type', 'source_tag', 'is_staff')


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
	list_display = ('name', 'identifier', 'owner', 'created_at')
	search_fields = ('name', 'identifier')
	autocomplete_fields = ('owner',)


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
	list_display = ('email', 'name', 'site', 'google_id', 'created_at')
	search_fields = ('email', 'name', 'google_id')
	autocomplete_fields = ('site',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
	list_display = ('title', 'site', 'admin', 'start_time', 'end_time', 'event_type', 'capacity')
	list_filter = ('event_type', 'site')
	search_fields = ('title', 'description')
	autocomplete_fields = ('site', 'admin', 'attendees')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
	list_display = ('event', 'site', 'client', 'guest_email', 'created_at')
	search_fields = ('guest_email', 'guest_name', 'notes')
	autocomplete_fields = ('site', 'event', 'client')
