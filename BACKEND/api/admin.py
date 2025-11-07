from django.contrib import admin

from .models import (
    PlatformUser, Site, Client, Event, Booking, Template, 
    MediaAsset, MediaUsage, CustomReactComponent, Notification, TermsOfService, MagicLink, EmailTemplate
)


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
	list_display = ('title', 'site', 'creator', 'start_time', 'end_time', 'event_type', 'capacity')
	list_filter = ('event_type', 'site')
	search_fields = ('title', 'description')
	autocomplete_fields = ('site', 'creator', 'attendees')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
	list_display = ('event', 'site', 'client', 'guest_email', 'created_at')
	search_fields = ('guest_email', 'guest_name', 'notes')
	autocomplete_fields = ('site', 'event', 'client')


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
	list_display = ('name', 'is_public')
	search_fields = ('name',)
	list_filter = ('is_public',)


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
	list_display = ('file_name', 'media_type', 'storage_bucket', 'file_size', 'uploaded_by', 'uploaded_at')
	search_fields = ('file_name', 'file_hash')
	list_filter = ('media_type',)
	autocomplete_fields = ('uploaded_by',)


@admin.register(MediaUsage)
class MediaUsageAdmin(admin.ModelAdmin):
	list_display = ('asset', 'usage_type', 'site', 'user', 'created_at')
	search_fields = ('asset__file_name', 'site__name', 'user__email')
	list_filter = ('usage_type',)
	autocomplete_fields = ('asset', 'site', 'user')


@admin.register(CustomReactComponent)
class CustomReactComponentAdmin(admin.ModelAdmin):
	list_display = ('name', 'created_at', 'updated_at')
	search_fields = ('name',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
	list_display = ('user', 'notification_type', 'is_read', 'created_at', 'message_preview')
	list_filter = ('notification_type', 'is_read', 'created_at')
	search_fields = ('user__email', 'message')
	autocomplete_fields = ('user',)
	date_hierarchy = 'created_at'
	
	def message_preview(self, obj):
		return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
	message_preview.short_description = 'Message'


@admin.register(TermsOfService)
class TermsOfServiceAdmin(admin.ModelAdmin):
	list_display = ('version', 'published_at', 'created_at')
	search_fields = ('version',)
	ordering = ('-published_at',)


@admin.register(MagicLink)
class MagicLinkAdmin(admin.ModelAdmin):
	list_display = ('email', 'token_preview', 'created_at', 'expires_at', 'used', 'used_at')
	search_fields = ('email', 'token')
	list_filter = ('used', 'created_at', 'expires_at')
	ordering = ('-created_at',)
	readonly_fields = ('token', 'created_at', 'used_at')
	
	def token_preview(self, obj):
		return f"{obj.token[:12]}..." if len(obj.token) > 12 else obj.token
	token_preview.short_description = 'Token'


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
	list_display = ('name', 'category', 'is_default', 'owner', 'created_at')
	search_fields = ('name', 'slug', 'subject_pl', 'subject_en')
	list_filter = ('category', 'is_default', 'created_at')
	ordering = ('category', '-is_default', 'name')
	readonly_fields = ('created_at', 'updated_at')
	prepopulated_fields = {'slug': ('name',)}
