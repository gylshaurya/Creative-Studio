from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewset import AttachmentViewSet, CommentViewSet, TaskViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'attachments', AttachmentViewSet, basename='attachment')
router.register(r'comments', CommentViewSet, basename='comment')

# Clean configuration mapping without wrapping router.urls inside include()
urlpatterns = router.urls