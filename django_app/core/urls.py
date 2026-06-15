"""
core/urls.py
────────────
All DRF API routes mounted at /api/v1/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView, RegisterView, LogoutView, ChangePasswordView,
    ProfileView, AvatarUploadView, UserStatsView,
    AssessmentViewSet, SavedAssessmentViewSet,
    NotificationViewSet,
    ArticleCategoryViewSet, ArticleViewSet, FAQViewSet,
    ContactView,
)

router = DefaultRouter()
router.register(r'assessments',  AssessmentViewSet,        basename='assessment')
router.register(r'saved',        SavedAssessmentViewSet,   basename='saved')
router.register(r'notifications', NotificationViewSet,     basename='notification')
router.register(r'articles',     ArticleViewSet,           basename='article')
router.register(r'article-categories', ArticleCategoryViewSet, basename='article-category')
router.register(r'faq',          FAQViewSet,               basename='faq')

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────────
    path('auth/login/',             LoginView.as_view(),         name='api-login'),
    path('auth/register/',          RegisterView.as_view(),      name='api-register'),
    path('auth/logout/',            LogoutView.as_view(),        name='api-logout'),
    path('auth/token/refresh/',     TokenRefreshView.as_view(),  name='api-token-refresh'),
    path('auth/password/change/',   ChangePasswordView.as_view(), name='api-password-change'),

    # ── User / Profile ────────────────────────────────────────────────────────
    path('users/profile/',          ProfileView.as_view(),       name='api-profile'),
    path('users/avatar/',           AvatarUploadView.as_view(),  name='api-avatar'),
    path('users/stats/',            UserStatsView.as_view(),     name='api-stats'),

    # ── Contact ───────────────────────────────────────────────────────────────
    path('contact/',                ContactView.as_view(),       name='api-contact'),

    # ── Router-registered ViewSets ────────────────────────────────────────────
    path('', include(router.urls)),
]
