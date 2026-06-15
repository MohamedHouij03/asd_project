"""
mindello/urls.py
────────────────
Root URL configuration for the Mindello project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ── Django admin ──────────────────────────────────────────────────────────
    path('admin/', admin.site.urls),

    # ── NEW: DRF API v1 ───────────────────────────────────────────────────────
    path('api/v1/', include('core.urls')),

    # ── Existing app URLs (unchanged) ─────────────────────────────────────────
    path('', include('ml_app.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
