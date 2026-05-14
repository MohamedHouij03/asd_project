from django.urls import path
from . import views

app_name = 'ml_app'

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('predict/', views.predict, name='predict'),
    path('predict/api/', views.predict_api, name='predict_api'),
]
