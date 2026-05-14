from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from ml_app import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # WRAP the auth paths in include() with a namespace
    path('auth/', include(([
        path('signup/', auth_views.signup_view, name='signup'),
        path('login/', auth_views.login_view, name='login'),
        path('logout/', auth_views.logout_view, name='logout'),
    ], 'auth'))), # This 'auth' here defines the namespace
    
    path('', include('ml_app.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
