"""
django_app/ml_app/urls.py
─────────────────────────
URL configuration for ml_app.

Changes from original:
  • Added three JSON auth endpoints used by the React frontend:
      /api/auth/login/   → api_auth_views.api_login
      /api/auth/signup/  → api_auth_views.api_signup
      /api/auth/logout/  → api_auth_views.api_logout_json

  Everything else is identical to the original file.
"""
from django.urls import path, re_path
from . import views
from .api_auth_views import api_login, api_signup, api_logout_json

app_name = 'ml_app'

urlpatterns = [
    # ── Public pages (Django templates) ──────────────────────────────────
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('autism/', views.autism_info, name='autism'),

    # ── Authenticated Django-template pages ───────────────────────────────
    path('dashboard/', views.dashboard, name='dashboard'),
    path('predict/', views.predict, name='predict'),
    path('predict/api/', views.predict_api, name='predict_api'),

    # ── Profile & Account ─────────────────────────────────────────────────
    path('profile/', views.profile_view, name='profile'),

    # ── Prediction History (Django templates) ─────────────────────────────
    path('history/', views.prediction_history, name='history'),
    path('history/<int:pk>/', views.prediction_detail, name='prediction_detail'),

    # ── React JSON API endpoints (original) ──────────────────────────────
    path('api/user/', views.api_user, name='api_user'),
    path('api/dashboard/stats/', views.api_dashboard_stats, name='api_dashboard_stats'),
    path('api/predictions/', views.api_predictions, name='api_predictions'),
    path('api/patients/', views.api_patients, name='api_patients'),

    # ── NEW: JSON authentication endpoints for React ──────────────────────
    path('api/auth/login/',  api_login,        name='api_auth_login'),
    path('api/auth/signup/', api_signup,        name='api_auth_signup'),
    path('api/auth/logout/', api_logout_json,   name='api_auth_logout'),

    # ── Catch-all: serves React build (production) ────────────────────────
    re_path(
        r'^(?!(?:api|auth|admin|static|media)/)(?P<rest_path>.*)$',
        views.serve_react,
        name='serve_react',
    ),
]
