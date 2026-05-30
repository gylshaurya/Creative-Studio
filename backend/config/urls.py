"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from projects.views import DashboardView

urlpatterns = [
    # Core Administration
    path('admin/', admin.site.urls),
    
    # Authentication Management
    path('api/auth/', include('users.urls')),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Documentation Schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger/', SpectacularSwaggerView.as_view(url_name='schema')),
    
    # Unified App Workspace Endpoints
    path('api/', include('studios.urls')),
    path('api/', include('projects.urls')),
    path('api/', include('tasks.urls')),          # ✨ Kept your tasks routing active!
    path('api/', include('notifications.urls')),  # ✨ Unified notifications router!
    path('api/dashboard/', DashboardView.as_view()),
]