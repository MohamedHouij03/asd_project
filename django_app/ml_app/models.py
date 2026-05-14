from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended user profile with role-based access."""
    
    ROLE_CHOICES = [
        ('parent', 'Parent/Guardian'),
        ('doctor', 'Medical Professional (Doctor/Psychologist)'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=20, blank=True, null=True)
    organization = models.CharField(max_length=255, blank=True, null=True)  # For doctors
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.get_role_display()})"
    
    class Meta:
        verbose_name_plural = "User Profiles"


class PredictionRecord(models.Model):
    """Stores prediction history for audit and analytics."""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions', null=True, blank=True)
    
    # AQ Scores
    a1_score = models.IntegerField()
    a2_score = models.IntegerField()
    a3_score = models.IntegerField()
    a4_score = models.IntegerField()
    a5_score = models.IntegerField()
    a6_score = models.IntegerField()
    a7_score = models.IntegerField()
    a8_score = models.IntegerField()
    a9_score = models.IntegerField()
    a10_score = models.IntegerField()
    
    # Clinical Scores
    qchat_10_score = models.IntegerField()
    
    # Demographics
    age = models.FloatField()
    sex = models.CharField(max_length=10)
    ethnicity = models.CharField(max_length=50)
    
    # Medical History
    jaundice = models.CharField(max_length=5)
    family_mem_with_asd = models.CharField(max_length=5)
    
    # Disorders
    speech_delay = models.CharField(max_length=5)
    learning_disorder = models.CharField(max_length=5)
    genetic_disorders = models.CharField(max_length=5)
    depression = models.CharField(max_length=5)
    global_developmental_delay = models.CharField(max_length=5)
    social_behavioural_issues = models.CharField(max_length=5)
    childhood_autism_rating_scale = models.FloatField()
    anxiety_disorder = models.CharField(max_length=5)
    
    # Result
    prediction = models.CharField(max_length=5)  # YES / NO
    confidence = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Prediction #{self.pk} - {self.prediction} ({self.created_at.strftime('%Y-%m-%d')})"
