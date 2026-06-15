from django.contrib import admin
from django.contrib.auth.models import User
from .models import UserProfile, PredictionRecord


# ─────────────────────────────────────────────────────────────────────────────
# USER PROFILE ADMIN
# ─────────────────────────────────────────────────────────────────────────────

class UserProfileInline(admin.StackedInline):
    """Inline admin for UserProfile."""
    model = UserProfile
    fields = ('role', 'phone', 'organization', 'created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
    extra = 0


class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile."""
    list_display = ('user_full_name', 'role', 'phone', 'organization', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'phone')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Profile Information', {
            'fields': ('role', 'phone', 'organization')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_full_name(self, obj):
        """Display user's full name."""
        return obj.user.get_full_name() or obj.user.username
    user_full_name.short_description = 'Name'


# ─────────────────────────────────────────────────────────────────────────────
# PREDICTION RECORD ADMIN
# ─────────────────────────────────────────────────────────────────────────────

class PredictionRecordAdmin(admin.ModelAdmin):
    """Admin interface for PredictionRecord (screening history)."""
    list_display = ('id', 'user_display', 'prediction', 'confidence', 'age', 'created_at')
    list_filter = ('prediction', 'created_at', 'sex')
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name')
    readonly_fields = (
        'a1_score', 'a2_score', 'a3_score', 'a4_score', 'a5_score',
        'a6_score', 'a7_score', 'a8_score', 'a9_score', 'a10_score',
        'qchat_10_score', 'age', 'sex', 'ethnicity', 'jaundice',
        'family_mem_with_asd', 'speech_delay', 'learning_disorder',
        'genetic_disorders', 'depression', 'global_developmental_delay',
        'social_behavioural_issues', 'childhood_autism_rating_scale',
        'anxiety_disorder', 'prediction', 'confidence', 'created_at'
    )
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Result', {
            'fields': ('user', 'prediction', 'confidence', 'created_at')
        }),
        ('AQ Scores (0-1 each)', {
            'fields': (
                'a1_score', 'a2_score', 'a3_score', 'a4_score', 'a5_score',
                'a6_score', 'a7_score', 'a8_score', 'a9_score', 'a10_score'
            )
        }),
        ('Clinical Scores', {
            'fields': ('qchat_10_score', 'childhood_autism_rating_scale')
        }),
        ('Demographics', {
            'fields': ('age', 'sex', 'ethnicity')
        }),
        ('Medical History', {
            'fields': ('jaundice', 'family_mem_with_asd')
        }),
        ('Co-occurring Conditions', {
            'fields': (
                'speech_delay', 'learning_disorder', 'genetic_disorders',
                'depression', 'global_developmental_delay',
                'social_behavioural_issues', 'anxiety_disorder'
            )
        }),
    )
    
    def user_display(self, obj):
        """Display user info for the prediction."""
        if obj.user:
            return f"{obj.user.get_full_name() or obj.user.username} ({obj.user.email})"
        return "Anonymous"
    user_display.short_description = 'User'
    
    def has_add_permission(self, request):
        """Prevent manual creation in admin."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Only allow deletion by superusers."""
        return request.user.is_superuser


# Register models
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(PredictionRecord, PredictionRecordAdmin)
