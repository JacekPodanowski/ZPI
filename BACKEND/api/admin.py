from django.contrib import admin

from .models import (
	PlatformUser, Site, SiteVersion, Client, Event, Booking, Template, AttendedSession,
	MediaAsset, MediaUsage, CustomReactComponent, Notification, TermsOfService, MagicLink, EmailTemplate,
	Testimonial, TestimonialSummary, NewsletterSubscription, NewsletterAnalytics, Payment,
	TeamMember, BigEvent, GoogleCalendarIntegration, GoogleCalendarEvent
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


@admin.register(SiteVersion)
class SiteVersionAdmin(admin.ModelAdmin):
	list_display = ('site', 'version_number', 'created_at', 'created_by')
	search_fields = ('site__name', 'site__identifier')
	list_filter = ('site',)
	autocomplete_fields = ('site', 'created_by')


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


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
	list_display = ('name', 'email', 'site', 'permission_role', 'invitation_status', 'is_active')
	list_filter = ('permission_role', 'invitation_status', 'is_active', 'site')
	search_fields = ('name', 'email', 'site__name')
	autocomplete_fields = ('site', 'linked_user')


@admin.register(AttendedSession)
class AttendedSessionAdmin(admin.ModelAdmin):
	list_display = ('title', 'site', 'host_type', 'start_time', 'duration_minutes')
	search_fields = (
		'title', 'host_user__email', 'host_team_member__first_name', 'host_team_member__last_name'
	)
	list_filter = ('host_type', 'site')
	autocomplete_fields = ('site', 'event', 'host_user', 'host_team_member')


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


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
	list_display = ('author_name', 'site', 'rating', 'is_approved', 'created_at')
	search_fields = ('author_name', 'author_email', 'content')
	list_filter = ('rating', 'is_approved', 'site', 'created_at')
	ordering = ('-created_at',)
	autocomplete_fields = ('site',)
	list_editable = ('is_approved',)


@admin.register(TestimonialSummary)
class TestimonialSummaryAdmin(admin.ModelAdmin):
	list_display = ('site', 'total_count', 'average_rating', 'updated_at')
	search_fields = ('site__name', 'site__identifier')
	ordering = ('-updated_at',)
	autocomplete_fields = ('site',)
	readonly_fields = ('created_at', 'updated_at')


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
	list_display = ('email', 'site', 'is_active', 'is_confirmed', 'emails_sent', 'emails_opened', 'emails_clicked', 'open_rate', 'click_rate', 'subscribed_at', 'confirmed_at', 'last_sent_at')
	search_fields = ('email', 'site__name', 'site__identifier')
	list_filter = ('is_active', 'is_confirmed', 'subscribed_at')
	ordering = ('-subscribed_at',)
	autocomplete_fields = ('site',)
	readonly_fields = ('subscribed_at', 'confirmed_at', 'unsubscribe_token', 'confirmation_token', 'emails_sent', 'emails_opened', 'emails_clicked', 'open_rate', 'click_rate')
	
	def open_rate(self, obj):
		if obj.emails_sent == 0:
			return "0%"
		return f"{(obj.emails_opened / obj.emails_sent * 100):.1f}%"
	open_rate.short_description = 'Open Rate'
	
	def click_rate(self, obj):
		if obj.emails_sent == 0:
			return "0%"
		return f"{(obj.emails_clicked / obj.emails_sent * 100):.1f}%"
	click_rate.short_description = 'Click Rate'


@admin.register(NewsletterAnalytics)
class NewsletterAnalyticsAdmin(admin.ModelAdmin):
	list_display = ('subscription_email', 'sent_at', 'opened_at', 'clicked_at', 'is_opened', 'is_clicked')
	search_fields = ('subscription__email', 'subscription__site__name')
	list_filter = ('sent_at', 'opened_at', 'clicked_at')
	ordering = ('-sent_at',)
	readonly_fields = ('tracking_token', 'sent_at', 'opened_at', 'clicked_at')
	
	def subscription_email(self, obj):
		return obj.subscription.email
	subscription_email.short_description = 'Email'
	
	def is_opened(self, obj):
		return obj.opened_at is not None
	is_opened.boolean = True
	is_opened.short_description = 'Opened'
	
	def is_clicked(self, obj):
		return obj.clicked_at is not None
	is_clicked.boolean = True
	is_clicked.short_description = 'Clicked'


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
	list_display = ('session_id', 'user', 'amount_pln', 'plan_id', 'status', 'created_at')
	search_fields = ('session_id', 'user__email', 'email', 'p24_order_id')
	list_filter = ('status', 'plan_id', 'created_at')
	ordering = ('-created_at',)
	autocomplete_fields = ('user',)
	readonly_fields = ('session_id', 'token', 'p24_order_id', 'created_at', 'updated_at')
	
	def amount_pln(self, obj):
		return f"{obj.amount / 100:.2f} PLN"
	amount_pln.short_description = 'Amount'


@admin.register(BigEvent)
class BigEventAdmin(admin.ModelAdmin):
	list_display = ('title', 'site', 'creator', 'start_date', 'status', 'current_participants', 'max_participants', 'email_sent')
	search_fields = ('title', 'description', 'location')
	list_filter = ('status', 'email_sent', 'created_at')
	autocomplete_fields = ('site', 'creator')
	readonly_fields = ('created_at', 'updated_at', 'published_at', 'email_sent_at')


@admin.register(GoogleCalendarIntegration)
class GoogleCalendarIntegrationAdmin(admin.ModelAdmin):
	list_display = ('site', 'google_email', 'is_active', 'sync_enabled', 'last_sync_at', 'created_at')
	search_fields = ('site__name', 'google_email', 'calendar_name')
	list_filter = ('is_active', 'sync_enabled', 'created_at')
	autocomplete_fields = ('site', 'connected_by')
	readonly_fields = ('created_at', 'updated_at', 'last_sync_at', 'token_expires_at')
	
	fieldsets = (
		('Basic Info', {
			'fields': ('site', 'connected_by', 'google_email', 'calendar_name')
		}),
		('OAuth Credentials', {
			'fields': ('access_token', 'refresh_token', 'token_expires_at', 'calendar_id'),
			'classes': ('collapse',)
		}),
		('Sync Settings', {
			'fields': ('is_active', 'sync_enabled', 'last_sync_at')
		}),
		('Timestamps', {
			'fields': ('created_at', 'updated_at')
		}),
	)


@admin.register(GoogleCalendarEvent)
class GoogleCalendarEventAdmin(admin.ModelAdmin):
	list_display = ('event', 'integration', 'google_event_id', 'last_synced_at', 'created_at')
	search_fields = ('event__title', 'google_event_id', 'integration__google_email')
	list_filter = ('created_at', 'last_synced_at')
	autocomplete_fields = ('event', 'integration')
	readonly_fields = ('created_at', 'last_synced_at')
