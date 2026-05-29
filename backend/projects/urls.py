from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from .views import ProjectViewSet
from tasks.views import TaskViewSet

router = DefaultRouter()

from studios.urls import router as studios_router

projects_router = nested_routers.NestedDefaultRouter(studios_router, 'studios', lookup='studio')
projects_router.register('projects', ProjectViewSet, basename='studio-projects')

tasks_router = nested_routers.NestedDefaultRouter(projects_router, 'projects', lookup='project')
tasks_router.register('tasks', TaskViewSet, basename='project-tasks')

urlpatterns = projects_router.urls + tasks_router.urls