from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Project
from .serializers import ProjectSerializer
from studios.models import StudioMember


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