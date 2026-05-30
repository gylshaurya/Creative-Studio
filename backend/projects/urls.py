from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from .views import ProjectViewSet
from tasks.views import TaskViewSet, AttachmentViewSet
from comments.views import CommentViewSet
from studios.urls import router as studios_router

projects_router = nested_routers.NestedDefaultRouter(studios_router, 'studios', lookup='studio')
projects_router.register('projects', ProjectViewSet, basename='studio-projects')

tasks_router = nested_routers.NestedDefaultRouter(projects_router, 'projects', lookup='project')
tasks_router.register('tasks', TaskViewSet, basename='project-tasks')

comments_router = nested_routers.NestedDefaultRouter(tasks_router, 'tasks', lookup='task')
comments_router.register('comments', CommentViewSet, basename='task-comments')

attachments_router = nested_routers.NestedDefaultRouter(tasks_router, 'tasks', lookup='task')
attachments_router.register('attachments', AttachmentViewSet, basename='task-attachments')

urlpatterns = (
    projects_router.urls +
    tasks_router.urls +
    comments_router.urls +
    attachments_router.urls
)