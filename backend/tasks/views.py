from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer
from .filters import TaskFilter
from drf_spectacular.utils import extend_schema, OpenApiParameter

@extend_schema(parameters=[
    OpenApiParameter(name='stage', description='Filter by stage', required=False, type=str),
    OpenApiParameter(name='priority', description='Filter by priority', required=False, type=str),
    OpenApiParameter(name='assignee', description='Filter by assignee user ID', required=False, type=int),
    OpenApiParameter(name='deadline_before', description='Filter tasks due before date (YYYY-MM-DD)', required=False, type=str),
    OpenApiParameter(name='deadline_after', description='Filter tasks due after date (YYYY-MM-DD)', required=False, type=str),
])
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = TaskFilter
    search_fields = ['title', 'description']
    ordering_fields = ['priority', 'deadline', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Task.objects.filter(
            project_id=self.kwargs['project_pk'],
            project__studio__members__user=self.request.user
        )

    def perform_create(self, serializer):
        from projects.models import Project
        project = Project.objects.get(pk=self.kwargs['project_pk'])
        serializer.save(project=project, created_by=self.request.user)

from .models import Task, Attachment
from .serializers import TaskSerializer, AttachmentSerializer

class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Attachment.objects.filter(task_id=self.kwargs['task_pk'])

    def perform_create(self, serializer):
        task = Task.objects.get(pk=self.kwargs['task_pk'])
        serializer.save(task=task, added_by=self.request.user)