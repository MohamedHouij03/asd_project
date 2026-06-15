"""
core/signals.py
───────────────
Django signals — auto-create ExtendedProfile and welcome notification on new user.
"""
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_extended_profile(sender, instance, created, **kwargs):
    if created:
        from .models import ExtendedProfile, Notification
        ExtendedProfile.objects.get_or_create(user=instance)
        Notification.objects.create(
            user       = instance,
            notif_type = 'account',
            title      = f'Welcome to Mindello, {instance.first_name or instance.username}!',
            message    = (
                'Your account is ready. Start your first ASD screening from the dashboard, '
                'or explore our educational resources to learn more about autism spectrum disorder.'
            ),
            action_url = '/dashboard',
        )
