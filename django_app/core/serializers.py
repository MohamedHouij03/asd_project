"""
core/serializers.py
"""
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    ExtendedProfile, Assessment, AssessmentResult,
    SavedAssessment, Notification, Article, ArticleCategory,
    FAQ, ContactMessage,
)


# ── Auth ───────────────────────────────────────────────────────────────────────

class CustomTokenSerializer(TokenObtainPairSerializer):
    """JWT login – includes full user data in the response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        try:
            prof = user.extended_profile
            role      = prof.role
            initials  = prof.initials
            avatar    = prof.avatar_url
        except ExtendedProfile.DoesNotExist:
            role, initials, avatar = 'parent', user.username[:2].upper(), None

        data['user'] = {
            'id':         user.pk,
            'username':   user.username,
            'email':      user.email,
            'first_name': user.first_name,
            'last_name':  user.last_name,
            'role':       role,
            'initials':   initials,
            'avatar':     avatar,
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, required=True,
                                      validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm password')
    role      = serializers.ChoiceField(
        choices=ExtendedProfile.ROLE_CHOICES,
        required=False, default='parent', write_only=True,
    )
    organization = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model  = User
        fields = ['username', 'email', 'first_name', 'last_name',
                  'password', 'password2', 'role', 'organization']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already in use.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password2': "Passwords don't match."})
        return attrs

    def create(self, validated_data):
        role         = validated_data.pop('role', 'parent')
        organization = validated_data.pop('organization', '')
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        ExtendedProfile.objects.create(user=user, role=role, organization=organization)
        return user


class PasswordChangeSerializer(serializers.Serializer):
    old_password  = serializers.CharField(write_only=True)
    new_password  = serializers.CharField(write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({'new_password2': "Passwords don't match."})
        return attrs


# ── Profile ────────────────────────────────────────────────────────────────────

class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'date_joined', 'last_login']
        read_only_fields = ['date_joined', 'last_login']


class ExtendedProfileSerializer(serializers.ModelSerializer):
    # Flatten user fields
    id         = serializers.IntegerField(source='user.id',         read_only=True)
    username   = serializers.CharField(source='user.username',      read_only=True)
    email      = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name',    allow_blank=True)
    last_name  = serializers.CharField(source='user.last_name',     allow_blank=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    last_login  = serializers.DateTimeField(source='user.last_login',  read_only=True)

    # Computed
    full_name        = serializers.CharField(read_only=True)
    initials         = serializers.CharField(read_only=True)
    avatar_url       = serializers.CharField(read_only=True)
    role_display     = serializers.CharField(read_only=True)
    assessment_count = serializers.SerializerMethodField()

    class Meta:
        model  = ExtendedProfile
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'initials', 'avatar', 'avatar_url',
            'bio', 'phone', 'date_of_birth', 'location', 'organization', 'role', 'role_display',
            'notif_assessment_complete', 'notif_recommendations',
            'notif_account_updates', 'notif_system',
            'profile_public',
            'assessment_count', 'date_joined', 'last_login',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_assessment_count(self, obj):
        return obj.user.assessments.filter(status='completed').count()

    def update(self, instance, validated_data):
        # Extract nested user fields
        user_data = validated_data.pop('user', {})
        user = instance.user
        for field, value in user_data.items():
            setattr(user, field, value)
        user.save(update_fields=list(user_data.keys()) or None)
        return super().update(instance, validated_data)


# ── Assessments ────────────────────────────────────────────────────────────────

class AssessmentResultSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AssessmentResult
        fields = [
            'prediction', 'confidence', 'ai_analysis', 'explanation_text',
            'top_factors', 'contrib_chart', 'recommendations', 'model_note', 'created_at',
        ]


class AssessmentListSerializer(serializers.ModelSerializer):
    short_id       = serializers.CharField(read_only=True)
    prediction     = serializers.SerializerMethodField()
    confidence     = serializers.SerializerMethodField()
    is_bookmarked  = serializers.SerializerMethodField()

    class Meta:
        model  = Assessment
        fields = ['id', 'short_id', 'status', 'risk_level', 'is_saved',
                  'is_bookmarked', 'prediction', 'confidence', 'created_at']

    def get_prediction(self, obj):
        try:    return obj.result.prediction
        except: return None

    def get_confidence(self, obj):
        try:    return obj.result.confidence
        except: return None

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saves.filter(user=request.user).exists()
        return False


class AssessmentDetailSerializer(serializers.ModelSerializer):
    short_id      = serializers.CharField(read_only=True)
    result        = AssessmentResultSerializer(read_only=True)
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model  = Assessment
        fields = ['id', 'short_id', 'status', 'risk_level', 'notes',
                  'input_data', 'is_saved', 'is_bookmarked',
                  'created_at', 'updated_at', 'result']

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saves.filter(user=request.user).exists()
        return False


class AssessmentRunSerializer(serializers.Serializer):
    """Validates the input for running a new assessment (mirrors PredictionForm)."""
    a1_score  = serializers.IntegerField(min_value=0, max_value=1)
    a2_score  = serializers.IntegerField(min_value=0, max_value=1)
    a3_score  = serializers.IntegerField(min_value=0, max_value=1)
    a4_score  = serializers.IntegerField(min_value=0, max_value=1)
    a5_score  = serializers.IntegerField(min_value=0, max_value=1)
    a6_score  = serializers.IntegerField(min_value=0, max_value=1)
    a7_score  = serializers.IntegerField(min_value=0, max_value=1)
    a8_score  = serializers.IntegerField(min_value=0, max_value=1)
    a9_score  = serializers.IntegerField(min_value=0, max_value=1)
    a10_score = serializers.IntegerField(min_value=0, max_value=1)
    qchat_10_score = serializers.IntegerField(min_value=0, max_value=10)

    age       = serializers.FloatField(min_value=0, max_value=18)
    sex       = serializers.ChoiceField(choices=['m', 'f'])
    ethnicity = serializers.CharField(max_length=50)
    jaundice  = serializers.IntegerField(min_value=0, max_value=1)
    family_mem_with_asd = serializers.IntegerField(min_value=0, max_value=1)

    speech_delay              = serializers.IntegerField(min_value=0, max_value=1)
    learning_disorder         = serializers.IntegerField(min_value=0, max_value=1)
    genetic_disorders         = serializers.IntegerField(min_value=0, max_value=1)
    depression                = serializers.IntegerField(min_value=0, max_value=1)
    global_developmental_delay = serializers.IntegerField(min_value=0, max_value=1)
    social_behavioural_issues = serializers.IntegerField(min_value=0, max_value=1)
    anxiety_disorder          = serializers.IntegerField(min_value=0, max_value=1)

    childhood_autism_rating_scale = serializers.FloatField(min_value=15, max_value=60)
    social_responsiveness_scale   = serializers.FloatField(min_value=0, max_value=10,
                                                           required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=1000)


# ── Saved ──────────────────────────────────────────────────────────────────────

class SavedAssessmentSerializer(serializers.ModelSerializer):
    assessment = AssessmentListSerializer(read_only=True)
    assessment_id = serializers.UUIDField(write_only=True)

    class Meta:
        model  = SavedAssessment
        fields = ['id', 'assessment', 'assessment_id', 'notes', 'created_at']

    def create(self, validated_data):
        aid = validated_data.pop('assessment_id')
        try:
            assessment = Assessment.objects.get(id=aid, user=self.context['request'].user)
        except Assessment.DoesNotExist:
            raise serializers.ValidationError({'assessment_id': 'Assessment not found.'})
        return SavedAssessment.objects.create(assessment=assessment, **validated_data)


# ── Notifications ──────────────────────────────────────────────────────────────

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id', 'notif_type', 'title', 'message',
                  'is_read', 'action_url', 'created_at']
        read_only_fields = ['notif_type', 'title', 'message', 'action_url', 'created_at']


# ── Content ────────────────────────────────────────────────────────────────────

class ArticleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ArticleCategory
        fields = ['id', 'name', 'slug', 'description', 'icon']


class ArticleListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)

    class Meta:
        model  = Article
        fields = ['id', 'title', 'slug', 'excerpt', 'category', 'category_name',
                  'category_slug', 'is_featured', 'read_time_minutes',
                  'view_count', 'published_at']


class ArticleDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name   = serializers.SerializerMethodField()

    class Meta:
        model  = Article
        fields = ['id', 'title', 'slug', 'excerpt', 'content',
                  'category', 'category_name', 'author_name',
                  'is_featured', 'read_time_minutes', 'view_count', 'published_at']

    def get_author_name(self, obj):
        if not obj.author:
            return 'Mindello Team'
        name = f"{obj.author.first_name} {obj.author.last_name}".strip()
        return name or obj.author.username


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FAQ
        fields = ['id', 'question', 'answer', 'category', 'order']


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['created_at']
