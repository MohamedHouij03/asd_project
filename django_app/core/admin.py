"""
core/admin.py
─────────────
Professional Django Admin configuration for all core models.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count, Avg
from django.utils import timezone

from .models import (
    ExtendedProfile, Assessment, AssessmentResult,
    SavedAssessment, Notification, Article, ArticleCategory,
    FAQ, ContactMessage, UserActivity,
)

admin.site.site_header  = 'Mindello Admin'
admin.site.site_title   = 'Mindello'
admin.site.index_title  = 'Platform Management'


# ── Inline helpers ─────────────────────────────────────────────────────────────

class AssessmentResultInline(admin.StackedInline):
    model          = AssessmentResult
    can_delete     = False
    readonly_fields = ['prediction', 'confidence', 'model_note', 'created_at']
    fields          = ['prediction', 'confidence', 'model_note',
                       'explanation_text', 'recommendations', 'created_at']


# ── ExtendedProfile ────────────────────────────────────────────────────────────

@admin.register(ExtendedProfile)
class ExtendedProfileAdmin(admin.ModelAdmin):
    list_display  = ['username_link', 'full_name', 'role', 'phone',
                     'organization', 'assessment_count', 'created_at']
    list_filter   = ['role', 'profile_public']
    search_fields = ['user__username', 'user__email', 'user__first_name',
                     'user__last_name', 'organization']
    readonly_fields = ['created_at', 'updated_at', 'assessment_count', 'avatar_preview']
    fieldsets = [
        ('Account', {
            'fields': ['user', 'role', 'bio', 'phone', 'location', 'organization'],
        }),
        ('Avatar', {
            'fields': ['avatar', 'avatar_preview'],
        }),
        ('Notification Preferences', {
            'fields': ['notif_assessment_complete', 'notif_recommendations',
                       'notif_account_updates', 'notif_system'],
            'classes': ['collapse'],
        }),
        ('Privacy', {
            'fields': ['profile_public'],
            'classes': ['collapse'],
        }),
        ('Meta', {
            'fields': ['created_at', 'updated_at', 'assessment_count'],
            'classes': ['collapse'],
        }),
    ]

    def get_queryset(self, request):
        return (super().get_queryset(request)
                .select_related('user')
                .annotate(_ac=Count('user__assessments')))

    def username_link(self, obj):
        return obj.user.username
    username_link.short_description = 'Username'

    def assessment_count(self, obj):
        return getattr(obj, '_ac', obj.user.assessments.count())
    assessment_count.short_description = '# Assessments'

    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="80" height="80" style="border-radius:50%">', obj.avatar.url)
        return '—'
    avatar_preview.short_description = 'Avatar Preview'


# ── Assessment ─────────────────────────────────────────────────────────────────

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display  = ['short_id', 'user_link', 'status_badge', 'risk_badge',
                     'prediction_badge', 'confidence_display', 'created_at']
    list_filter   = ['status', 'risk_level', 'result__prediction']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['id', 'short_id', 'created_at', 'updated_at']
    inlines       = [AssessmentResultInline]
    date_hierarchy = 'created_at'
    ordering      = ['-created_at']

    def user_link(self, obj):
        return obj.user.username
    user_link.short_description = 'User'

    def status_badge(self, obj):
        colors = {'completed': '#10b981', 'pending': '#f59e0b', 'failed': '#ef4444'}
        color  = colors.get(obj.status, '#64748b')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:999px;font-size:11px">{}</span>',
            color, obj.status.title()
        )
    status_badge.short_description = 'Status'

    def risk_badge(self, obj):
        colors = {'high': '#ef4444', 'moderate': '#f59e0b', 'low': '#10b981'}
        color  = colors.get(obj.risk_level, '#94a3b8')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:999px;font-size:11px">{}</span>',
            color, obj.risk_level or '—'
        )
    risk_badge.short_description = 'Risk'

    def prediction_badge(self, obj):
        try:
            pred = obj.result.prediction
            color = '#ef4444' if pred == 'YES' else '#10b981'
            return format_html(
                '<span style="background:{};color:#fff;padding:2px 8px;border-radius:999px;font-size:11px">{}</span>',
                color, pred
            )
        except AssessmentResult.DoesNotExist:
            return '—'
    prediction_badge.short_description = 'Prediction'

    def confidence_display(self, obj):
        try:
            conf = obj.result.confidence
            return f'{conf}%' if conf is not None else '—'
        except AssessmentResult.DoesNotExist:
            return '—'
    confidence_display.short_description = 'Confidence'


# ── Notification ───────────────────────────────────────────────────────────────

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display  = ['title', 'user', 'notif_type', 'is_read', 'created_at']
    list_filter   = ['notif_type', 'is_read']
    search_fields = ['user__username', 'title', 'message']
    readonly_fields = ['created_at']
    actions       = ['mark_all_read']

    def mark_all_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f'{queryset.count()} notifications marked as read.')
    mark_all_read.short_description = 'Mark selected as read'


# ── Article ────────────────────────────────────────────────────────────────────

@admin.register(ArticleCategory)
class ArticleCategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'slug', 'order']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order']


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display  = ['title', 'category', 'status', 'is_featured',
                     'view_count', 'published_at']
    list_filter   = ['status', 'is_featured', 'category']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['view_count', 'created_at', 'updated_at']
    date_hierarchy = 'published_at'
    fieldsets = [
        ('Content', {
            'fields': ['title', 'slug', 'excerpt', 'content', 'featured_image'],
        }),
        ('Classification', {
            'fields': ['category', 'author', 'is_featured', 'read_time_minutes'],
        }),
        ('Publishing', {
            'fields': ['status', 'published_at'],
        }),
        ('Stats', {
            'fields': ['view_count', 'created_at', 'updated_at'],
            'classes': ['collapse'],
        }),
    ]

    def save_model(self, request, obj, form, change):
        if obj.status == 'published' and not obj.published_at:
            obj.published_at = timezone.now()
        if not obj.author:
            obj.author = request.user
        super().save_model(request, obj, form, change)


# ── FAQ ────────────────────────────────────────────────────────────────────────

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display  = ['question_short', 'category', 'order', 'is_active']
    list_filter   = ['category', 'is_active']
    list_editable = ['order', 'is_active']
    search_fields = ['question', 'answer']

    def question_short(self, obj):
        return obj.question[:80]
    question_short.short_description = 'Question'


# ── Contact Messages ───────────────────────────────────────────────────────────

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display  = ['name', 'email', 'subject_short', 'status', 'created_at']
    list_filter   = ['status']
    search_fields = ['name', 'email', 'subject', 'message']
    readonly_fields = ['name', 'email', 'subject', 'message', 'created_at']
    list_editable = ['status']

    def subject_short(self, obj):
        return obj.subject[:60]
    subject_short.short_description = 'Subject'


# ── User Activity ──────────────────────────────────────────────────────────────

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display  = ['user', 'action', 'page', 'ip_address', 'created_at']
    list_filter   = ['action']
    search_fields = ['user__username', 'page']
    readonly_fields = list_display
    date_hierarchy = 'created_at'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
