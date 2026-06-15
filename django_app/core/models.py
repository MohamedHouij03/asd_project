"""
core/models.py
──────────────
All new database models for the Mindello platform.
Coexists with the existing ml_app models – does NOT modify them.
"""
import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.text import slugify


# ── User Extension ─────────────────────────────────────────────────────────────

class ExtendedProfile(models.Model):
    ROLE_CHOICES = [
        ('parent',     'Parent / Guardian'),
        ('doctor',     'Medical Professional'),
        ('researcher', 'Researcher'),
        ('admin',      'Administrator'),
    ]

    user         = models.OneToOneField(User, on_delete=models.CASCADE, related_name='extended_profile')
    avatar       = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio          = models.TextField(blank=True, max_length=500)
    phone        = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    location     = models.CharField(max_length=100, blank=True)
    organization = models.CharField(max_length=200, blank=True)
    role         = models.CharField(max_length=20, choices=ROLE_CHOICES, default='parent')

    # Notification preferences
    notif_assessment_complete = models.BooleanField(default=True)
    notif_recommendations     = models.BooleanField(default=True)
    notif_account_updates     = models.BooleanField(default=True)
    notif_system              = models.BooleanField(default=False)

    # Privacy
    profile_public = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Extended Profile'

    def __str__(self):
        return f"Profile – {self.user.username}"

    @property
    def full_name(self):
        name = f"{self.user.first_name} {self.user.last_name}".strip()
        return name or self.user.username

    @property
    def initials(self):
        fn = self.user.first_name
        ln = self.user.last_name
        if fn and ln:
            return (fn[0] + ln[0]).upper()
        if fn:
            return fn[:2].upper()
        return self.user.username[:2].upper()

    @property
    def avatar_url(self):
        if self.avatar:
            return self.avatar.url
        return None

    @property
    def role_display(self):
        return dict(self.ROLE_CHOICES).get(self.role, self.role)


# ── Assessments ────────────────────────────────────────────────────────────────

class Assessment(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('completed', 'Completed'),
        ('failed',    'Failed'),
    ]
    RISK_CHOICES = [
        ('low',      'Low Risk'),
        ('moderate', 'Moderate Risk'),
        ('high',     'High Risk'),
    ]

    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assessments')
    status     = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    risk_level = models.CharField(max_length=20, choices=RISK_CHOICES, blank=True)
    notes      = models.TextField(blank=True)
    input_data = models.JSONField(default=dict)   # all 24 form fields stored verbatim
    is_saved   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Assessment {self.short_id} – {self.user.username}"

    @property
    def short_id(self):
        return f"A-{str(self.id)[:8].upper()}"


class AssessmentResult(models.Model):
    assessment       = models.OneToOneField(Assessment, on_delete=models.CASCADE, related_name='result')
    prediction       = models.CharField(max_length=5)   # YES / NO
    confidence       = models.FloatField(null=True, blank=True)
    ai_analysis      = models.TextField(blank=True)
    explanation_text = models.TextField(blank=True)
    top_factors      = models.JSONField(default=list)   # SHAP top-3
    shap_data        = models.JSONField(default=list)   # full SHAP items
    contrib_chart    = models.TextField(blank=True)     # base64 PNG
    recommendations  = models.JSONField(default=list)
    model_note       = models.CharField(max_length=20, default='model')  # 'model' | 'demo'
    created_at       = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result {self.assessment.short_id}: {self.prediction} ({self.confidence}%)"


class SavedAssessment(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_assessments')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='saves')
    notes      = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'assessment']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} saved {self.assessment.short_id}"


# ── Notifications ──────────────────────────────────────────────────────────────

class Notification(models.Model):
    TYPE_CHOICES = [
        ('assessment_completed', 'Assessment Completed'),
        ('recommendation',       'Recommendation'),
        ('account',              'Account Update'),
        ('system',               'System'),
        ('alert',                'Alert'),
    ]

    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notif_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='system')
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    action_url = models.CharField(max_length=300, blank=True)
    data       = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.notif_type}] {self.title} → {self.user.username}"


# ── Educational Content ────────────────────────────────────────────────────────

class ArticleCategory(models.Model):
    name        = models.CharField(max_length=100)
    slug        = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon        = models.CharField(max_length=50, blank=True)   # emoji or icon name
    order       = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = 'Article Categories'

    def __str__(self):
        return self.name


class Article(models.Model):
    STATUS_CHOICES = [
        ('draft',     'Draft'),
        ('published', 'Published'),
        ('archived',  'Archived'),
    ]

    title        = models.CharField(max_length=300)
    slug         = models.SlugField(unique=True, max_length=320)
    excerpt      = models.TextField(max_length=600, blank=True)
    content      = models.TextField()
    category     = models.ForeignKey(ArticleCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    author       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    featured_image = models.ImageField(upload_to='articles/', blank=True, null=True)
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured  = models.BooleanField(default=False)
    view_count   = models.PositiveIntegerField(default=0)
    read_time_minutes = models.PositiveIntegerField(default=5)
    published_at = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:320]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class FAQ(models.Model):
    CATEGORY_CHOICES = [
        ('general',    'General'),
        ('assessment', 'Assessment'),
        ('results',    'Understanding Results'),
        ('privacy',    'Privacy & Security'),
        ('account',    'Account'),
    ]

    question    = models.TextField()
    answer      = models.TextField()
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    order       = models.PositiveIntegerField(default=0)
    is_active   = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'order']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'

    def __str__(self):
        return self.question[:80]


# ── Contact ────────────────────────────────────────────────────────────────────

class ContactMessage(models.Model):
    STATUS_CHOICES = [
        ('new',     'New'),
        ('read',    'Read'),
        ('replied', 'Replied'),
        ('closed',  'Closed'),
    ]

    name         = models.CharField(max_length=200)
    email        = models.EmailField()
    subject      = models.CharField(max_length=300)
    message      = models.TextField()
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    admin_notes  = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    replied_at   = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} — {self.subject}"


# ── Analytics / Activity Log ───────────────────────────────────────────────────

class UserActivity(models.Model):
    ACTION_CHOICES = [
        ('login',                'Login'),
        ('logout',               'Logout'),
        ('assessment_start',     'Assessment Started'),
        ('assessment_complete',  'Assessment Completed'),
        ('profile_update',       'Profile Updated'),
        ('article_view',         'Article Viewed'),
        ('page_view',            'Page Viewed'),
    ]

    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action     = models.CharField(max_length=30, choices=ACTION_CHOICES)
    page       = models.CharField(max_length=300, blank=True)
    details    = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'User Activities'

    def __str__(self):
        return f"{self.user.username} – {self.action}"
