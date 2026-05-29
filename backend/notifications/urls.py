<<<<<<< HEAD
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewset import NotificationViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
=======
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet

router = DefaultRouter()
router.register('notifications', NotificationViewSet, basename='notifications')

urlpatterns = router.urls
>>>>>>> origin/main
