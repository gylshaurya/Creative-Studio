from rest_framework.routers import DefaultRouter
from .viewset import NotificationViewSet  # Points to your viewset file

router = DefaultRouter()
# Register the notification endpoints cleanly
router.register(r'notifications', NotificationViewSet, basename='notification')

# Direct clean routing mapping
urlpatterns = router.urls