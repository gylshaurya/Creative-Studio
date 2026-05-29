from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Project
from .serializers import ProjectSerializer
from studios.models import StudioMember
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from tasks.models import Task


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(
            studio__members__user=self.request.user
        )

    def perform_create(self, serializer):
        from studios.models import Studio
        studio = Studio.objects.get(pk=self.kwargs['studio_pk'])
        serializer.save(studio=studio, created_by=self.request.user)

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        overdue_tasks = Task.objects.filter(
            assignee=user,
            deadline__lt=today,
        ).exclude(stage='COMPLETED').values(
            'id', 'title', 'stage', 'priority', 'deadline',
            'project__name', 'project__id'
        )

        my_tasks = Task.objects.filter(
            assignee=user
        ).exclude(stage='COMPLETED').values(
            'id', 'title', 'stage', 'priority', 'deadline',
            'project__name', 'project__id'
        )

        projects = Project.objects.filter(
            studio__members__user=user
        ).values('id', 'name', 'type', 'status', 'deadline')

        project_list = []
        for project in projects:
            total = Task.objects.filter(project_id=project['id']).count()
            done = Task.objects.filter(project_id=project['id'], stage='COMPLETED').count()
            project['total_tasks'] = total
            project['completed_tasks'] = done
            project['progress'] = round((done / total) * 100) if total > 0 else 0
            project_list.append(project)

        return Response({
            'overdue_tasks': list(overdue_tasks),
            'my_tasks': list(my_tasks),
            'projects': project_list,
        })